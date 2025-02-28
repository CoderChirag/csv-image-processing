import { Readable } from 'node:stream';
import { CSVData } from 'src/dtos/entities/csv/csv.dto';

export interface ICSVValidationEntity {
  validateAndParse(csvFile: Readable, mimeType: string): Promise<CSVData>;
}
