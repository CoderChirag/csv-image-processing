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

  private validateMimeType(mimeType: string): void {
    if (mimeType !== CSV_ENTITY_CONFIG.ALLOWED_MIME_TYPE)
      throw new HttpException(
        `${CSV_ENTITY_FAILURES.INCORRECT_FILE_FORMAT.MESSAGE}. Required: ${CSV_ENTITY_CONFIG.ALLOWED_MIME_TYPE}, Received: ${mimeType}`,
        CSV_ENTITY_FAILURES.INCORRECT_FILE_FORMAT.CODE,
      );
  }

  // [Memory Optimization]: Parsing CSV file chunk by chunk from Stream rather than converting complete file to Buffer. Would optimize memory usage for large files.
  private async parseData(csvFile: Readable): Promise<CSVData> {
    const data: CSVData = {
      products: {},
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
        await this.validateProduct(product);
        // Merging input image urls for same product name
        this.mergeProductsData(data, product);
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
          await this.validateProduct(product);
          // Merging input image urls for same product name
          this.mergeProductsData(data, product);
        }
      }
    }
    return data;
  }

  private parseCols(row: string): string[] {
    const cols: string[] = [];
    let currentCol = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        // Handling escaped quotes (double quotes in the row)
        if (i + 1 < row.length && row[i + 1] === '"') {
          currentCol += '"';
          i++;
        } else {
          // Handling non-escaped quotes
          let j = i - 1,
            k = i + 1;
          while (j >= 0 && row[j] === ' ') j--;
          while (k < row.length && row[k] === ' ') k++;
          if (j < 0 || row[j] === ',' || k === row.length || row[k] === ',') {
            // If quote is just after or before a comma, it's not a text quote
            inQuotes = !inQuotes;
          } else {
            // If quote is not just after or before a comma, it's a text quote
            currentCol += char;
          }
        }
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
        `${CSV_ENTITY_FAILURES.CSV_PARSE_ERROR.MESSAGE}. Unclosed quote in row: ${row}`,
        CSV_ENTITY_FAILURES.CSV_PARSE_ERROR.CODE,
      );
    cols.push(currentCol.trim());
    return cols;
  }

  private validateHeaderRow(headers: string[]): void {
    if (headers.length !== CSV_ENTITY_CONFIG.EXPECTED_HEADERS.length)
      throw new HttpException(
        `${CSV_ENTITY_FAILURES.CSV_HEADER_PARSE_ERROR.MESSAGE}: ${headers.join(', ')}. Expected: ${CSV_ENTITY_CONFIG.EXPECTED_HEADERS.length} columns, Received: ${headers.length} columns.`,
        CSV_ENTITY_FAILURES.CSV_HEADER_PARSE_ERROR.CODE,
      );

    const headerMatch = CSV_ENTITY_CONFIG.EXPECTED_HEADERS.every(
      (header, index) => headers[index].toLowerCase() === header.toLowerCase(),
    );
    if (!headerMatch)
      throw new HttpException(
        `${CSV_ENTITY_FAILURES.CSV_HEADER_PARSE_ERROR.MESSAGE}: Invalid headers ${headers.join(', ')}. Expected: ${CSV_ENTITY_CONFIG.EXPECTED_HEADERS.join(', ')}.`,
        CSV_ENTITY_FAILURES.CSV_HEADER_PARSE_ERROR.CODE,
      );
  }

  private isEmptyRow(cols: string[]): boolean {
    return cols.every((col) => col.trim() === '');
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

  private async validateProduct(product: CSVProduct): Promise<void> {
    const productInstance = plainToClass(CSVProduct, product);
    const errors = await validate(productInstance);
    if (errors.length > 0) {
      throw new HttpException(
        `${CSV_ENTITY_FAILURES.INVALID_PRODUCT.MESSAGE}: ${JSON.stringify(product)}. Errors: ${errors.map((error) => (error.constraints ? Object.values(error.constraints).join(', ') : error.toString())).join(', ')}`,
        CSV_ENTITY_FAILURES.INVALID_PRODUCT.CODE,
      );
    }
  }

  private mergeProductsData(data: CSVData, product: CSVProduct): void {
    if (data.products[product.name]) {
      data.products[product.name].inputImageUrls = Array.from(
        new Set([
          ...data.products[product.name].inputImageUrls,
          ...product.inputImageUrls,
        ]),
      );
    } else {
      data.products[product.name] = product;
    }
  }

  private validateRow(cols: string[]): void {
    if (cols.length !== CSV_ENTITY_CONFIG.EXPECTED_HEADERS.length)
      throw new HttpException(
        `${CSV_ENTITY_FAILURES.CSV_PARSE_ERROR.MESSAGE}: ${cols.join(', ')}. Expected: ${CSV_ENTITY_CONFIG.EXPECTED_HEADERS.length} columns, Received: ${cols.length} columns.`,
        CSV_ENTITY_FAILURES.CSV_PARSE_ERROR.CODE,
      );
  }
}
