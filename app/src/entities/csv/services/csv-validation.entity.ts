import { Readable } from 'node:stream';
import { HttpException, Injectable } from '@nestjs/common';
import { ICSVValidationEntity } from 'src/interfaces/entities/csv/csv-validation.interface';
import { CSVData, CSVProduct } from 'src/dtos/entities/csv/csv.dto';
import { CSV_ENTITY_CONFIG, CSV_ENTITY_FAILURES } from '../constants/config';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class CSVValidationEntity implements ICSVValidationEntity {
  constructor() {}

  async validateAndParse(
    csvFile: Readable,
    mimeType: string,
  ): Promise<CSVData> {
    this.validateMimeType(mimeType);
    const data = await this.parseData(csvFile);
    return data;
  }

  // [Memory Optimization]: Parsing CSV file chunk by chunk from Stream rather than converting complete file to Buffer. Would optimize memory usage for large files.
  private async parseData(csvFile: Readable): Promise<CSVData> {
    const data: CSVData = {
      products: [],
    };
    let partialRow = '';
    let headerRow: string[] = [];
    // Iterating over the Stream Chunk by Chunk
    for await (const ch of csvFile) {
      const chunk = ch.toString();
      const rows = `${partialRow}${chunk}`.split(/\r\n|\n\r|\n|\r/);
      // Last row might be incomplete due to chunk size, so it's stored in partialRow for next iteration.
      partialRow = rows.pop() ?? '';

      for (const row of rows) {
        // Splitting the row into columns with comma separated values while preserving quotes
        const cols = this.parseCols(row);
        if (headerRow.length === 0) {
          this.validateHeaderRow(cols);
          headerRow = cols;
          continue;
        }
        // Skipping empty rows
        if (this.isEmptyRow(cols)) continue;

        const product = this.getProductFromRow(cols);
        data.products.push(product);
      }
    }

    if (partialRow.trim().length > 0) {
      // Splitting the row into columns with comma separated values while preserving quotes
      const cols = this.parseCols(partialRow);
      if (!this.isEmptyRow(cols)) {
        if (headerRow.length === 0) {
          this.validateHeaderRow(cols);
          headerRow = cols;
        } else {
          const product = this.getProductFromRow(cols);
          data.products.push(product);
        }
      }
    }
    await this.validateProductsData(data);
    return data;
  }

  private async validateProductsData(data: CSVData): Promise<void> {
    const productsInstance = plainToClass(CSVData, data);
    const errors = await validate(productsInstance);
    if (errors.length > 0) {
      throw new HttpException(
        `${CSV_ENTITY_FAILURES.INVALID_PRODUCT_DATA.MESSAGE}: ${errors.map((error) => error.toString()).join(', ')}`,
        CSV_ENTITY_FAILURES.INVALID_PRODUCT_DATA.CODE,
      );
    }
  }

  private getProductFromRow(cols: string[]): CSVProduct {
    const product: CSVProduct = {
      name: '',
      inputImageUrls: [],
      outputImageUrls: [],
    };

    this.validateRow(cols);

    product.name = cols[1];
    product.inputImageUrls = cols[2]
      .trim()
      .split(',')
      .map((url) => url.trim());

    return product;
  }

  private validateHeaderRow(headers: string[]): void {
    if (headers.length !== CSV_ENTITY_CONFIG.EXPECTED_HEADERS.length)
      throw new HttpException(
        `${CSV_ENTITY_FAILURES.CSV_PARSE_ERROR.MESSAGE} Expected: ${CSV_ENTITY_CONFIG.EXPECTED_HEADERS.length} columns, Received: ${headers.length} columns.`,
        CSV_ENTITY_FAILURES.CSV_PARSE_ERROR.CODE,
      );

    const headerMatch = CSV_ENTITY_CONFIG.EXPECTED_HEADERS.every(
      (header, index) => headers[index].toLowerCase() === header.toLowerCase(),
    );
    if (!headerMatch)
      throw new HttpException(
        `${CSV_ENTITY_FAILURES.CSV_PARSE_ERROR.MESSAGE}: Invalid headers. Expected: ${CSV_ENTITY_CONFIG.EXPECTED_HEADERS.join(', ')}, Received: ${headers.join(', ')}.`,
        CSV_ENTITY_FAILURES.CSV_PARSE_ERROR.CODE,
      );
  }

  private isEmptyRow(cols: string[]): boolean {
    return cols.every((col) => col.trim() === '');
  }

  private validateRow(cols: string[]): void {
    if (cols.length !== CSV_ENTITY_CONFIG.EXPECTED_HEADERS.length)
      throw new HttpException(
        `${CSV_ENTITY_FAILURES.CSV_PARSE_ERROR.MESSAGE} Expected: ${CSV_ENTITY_CONFIG.EXPECTED_HEADERS.length} columns, Received: ${cols.length} columns.`,
        CSV_ENTITY_FAILURES.CSV_PARSE_ERROR.CODE,
      );
  }

  private validateMimeType(mimeType: string): void {
    if (mimeType !== CSV_ENTITY_CONFIG.ALLOWED_MIME_TYPE)
      throw new HttpException(
        `${CSV_ENTITY_FAILURES.INCORRECT_FILE_FORMAT.MESSAGE} Received: ${mimeType}`,
        CSV_ENTITY_FAILURES.INCORRECT_FILE_FORMAT.CODE,
      );
  }

  private parseCols(row: string): string[] {
    const cols: string[] = [];
    let currentCol = '';
    let inQuotes = false;
    let quoteStart = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        // Handling escaped quotes (double quotes in the row)
        if (i + 1 < row.length && row[i + 1] === '"') {
          currentCol += '"';
          i++;
        } else if (currentCol.length !== 0 && !inQuotes) {
          throw new HttpException(
            `${CSV_ENTITY_FAILURES.CSV_PARSE_ERROR.MESSAGE}: Unexpected quote in middle of field: ${row}`,
            CSV_ENTITY_FAILURES.CSV_PARSE_ERROR.CODE,
          );
        } else inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        // col splitting, only when comma is not in quotes
        cols.push(currentCol.trim());
        currentCol = '';
      } else {
        currentCol += char;
      }
    }

    if (inQuotes)
      throw new HttpException(
        `${CSV_ENTITY_FAILURES.CSV_PARSE_ERROR.MESSAGE}: Unclosed quote in the last field: ${row}`,
        CSV_ENTITY_FAILURES.CSV_PARSE_ERROR.CODE,
      );
    cols.push(currentCol.trim());
    return cols;
  }
}
