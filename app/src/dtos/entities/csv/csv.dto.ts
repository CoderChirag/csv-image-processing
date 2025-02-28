import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class CSVProduct {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  @IsNotEmpty()
  @IsUrl({}, { each: true })
  inputImageUrls: string[];

  @IsArray()
  @IsUrl({}, { each: true })
  outputImageUrls: string[];
}

export class CSVData {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CSVProduct)
  products: CSVProduct[];
}
