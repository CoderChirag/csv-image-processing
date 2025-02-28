import { Controller, HttpException, Inject, Post, Res } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { IMAGE_PROCESSING_CONFIG } from './constants/config';
import { MultipartFileDto } from 'src/dtos/http/multipart/file.dto';
import { Multipart, MultiPartData } from 'src/decorators/multipart.decorator';
import { HTTP_RESPONSE_CODES, providers } from 'src/constants';
import { ICSVValidationEntity } from 'src/interfaces/entities/csv/csv-validation.interface';
import { CSVData } from 'src/dtos/entities/csv/csv.dto';
import { Response } from 'express';

@ApiTags(IMAGE_PROCESSING_CONFIG.API_TAGS.IMAGE_PROCESSING)
@Controller('image-processing')
export class ImageProcessingController {
  constructor(
    @Inject(providers.ENTITIES.CSV_VALIDATION)
    private readonly csvValidationEntity: ICSVValidationEntity,
  ) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: MultipartFileDto })
  @Post('process/csv')
  async processCsv(
    @Multipart({
      fileField: 'file',
      filesCountLimit: IMAGE_PROCESSING_CONFIG.CSV_FILES_COUNT_LIMIT,
      fileSizeLimit: IMAGE_PROCESSING_CONFIG.CSV_FILE_SIZE_LIMIT,
    })
    multiPart: AsyncGenerator<MultiPartData>,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!multiPart)
      throw new HttpException(
        IMAGE_PROCESSING_CONFIG.FAILURES.FILE_NOT_UPLOADED.MESSAGE,
        IMAGE_PROCESSING_CONFIG.FAILURES.FILE_NOT_UPLOADED.CODE,
      );

    let csvData: CSVData | undefined;
    // [Memory Optimization]: Accepting Multipart file as a Stream rather than Buffer, using a Custom Decorator
    for await (const part of multiPart) {
      if (part.type === 'file') {
        csvData = await this.csvValidationEntity.validateAndParse(
          part.stream,
          part.info.mimeType,
        );
        break;
      }
    }

    if (!csvData)
      throw new HttpException(
        IMAGE_PROCESSING_CONFIG.FAILURES.FILE_NOT_UPLOADED.MESSAGE,
        IMAGE_PROCESSING_CONFIG.FAILURES.FILE_NOT_UPLOADED.CODE,
      );

    res.status(HTTP_RESPONSE_CODES.ACCEPTED.CODE);
    return csvData;
  }
}
