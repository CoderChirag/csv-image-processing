import { Readable } from 'node:stream';
import { CSVData, CSVProductOutput } from 'src/dtos/entities/csv/csv.dto';

export interface ICSVEntity {
  validateAndParse(csvFile: Readable, mimeType: string): Promise<CSVData>;
  buildCSV(products: Record<string, CSVProductOutput>): Promise<string>;
}
