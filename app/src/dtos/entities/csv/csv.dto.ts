import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CSVProduct {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  @IsNotEmpty()
  @IsUrl({}, { each: true })
  inputImageUrls: string[];
}

export class CSVProductOutput extends CSVProduct {
  @IsArray()
  @IsNotEmpty()
  @IsUrl({}, { each: true })
  outputImageUrls: string[];
}

export interface CSVData {
  products: Record<string, CSVProduct>;
}
