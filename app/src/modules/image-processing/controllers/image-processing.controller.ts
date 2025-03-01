import { Response } from 'express';
import {
  Controller,
  Get,
  HttpException,
  Inject,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { IMAGE_PROCESSING_CONFIG } from '../constants/config';
import { MultipartFileDto } from 'src/dtos/http/multipart/file.dto';
import { Multipart, MultiPartData } from 'src/decorators/multipart.decorator';
import { HTTP_RESPONSE_CODES, providers } from 'src/constants';
import { ICSVEntity } from 'src/interfaces/entities/csv/csv.interface';
import { CSVData } from 'src/dtos/entities/csv/csv.dto';
import { ISchedulingService } from '../interfaces/schedule-service.interface';
import {
  GetStatusReqParamDto,
  GetStatusResData,
  ProcessCSVReqQueryDto,
  ProcessCSVResData,
  ProcessCSVResDto,
} from '../dtos/controllers/image-processing.dto';
import { HttpReqValidationPipe } from 'src/pipes/http-req-validation.pipe';
import { IStatusService } from '../interfaces/status-service.interface';

@ApiTags(IMAGE_PROCESSING_CONFIG.API_TAGS.IMAGE_PROCESSING)
@Controller('image-processing')
export class ImageProcessingController {
  constructor(
    @Inject(providers.ENTITIES.CSV)
    private readonly CSVEntity: ICSVEntity,
    @Inject(IMAGE_PROCESSING_CONFIG.PROVIDERS.SCHEDULING)
    private readonly schedulingService: ISchedulingService,
    @Inject(IMAGE_PROCESSING_CONFIG.PROVIDERS.STATUS)
    private readonly statusService: IStatusService,
  ) {}

  @ApiOperation({
    summary: 'Api for processing csv file',
    description: `This api accepts a multipart file and processes the products image urls.`,
  })
  @ApiAcceptedResponse({
    description: 'Request accepted and queued for processing',
    type: ProcessCSVResDto,
  })
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
    @Query(HttpReqValidationPipe) query: ProcessCSVReqQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ProcessCSVResData> {
    if (!multiPart)
      throw new HttpException(
        IMAGE_PROCESSING_CONFIG.FAILURES.FILE_NOT_UPLOADED.MESSAGE,
        IMAGE_PROCESSING_CONFIG.FAILURES.FILE_NOT_UPLOADED.CODE,
      );

    let csvData: CSVData | undefined;
    // [Memory Optimization]: Accepting Multipart file as a Stream rather than Buffer, using a Custom Decorator
    for await (const part of multiPart) {
      if (part.type === 'file') {
        csvData = await this.CSVEntity.validateAndParse(
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

    const requestId = await this.schedulingService.scheduleImageProcessing(
      csvData.products,
      query.webhookUrl,
    );

    res.status(HTTP_RESPONSE_CODES.ACCEPTED.CODE);
    return { requestId };
  }

  @ApiOperation({
    summary: 'Api for getting the status of the request',
    description: `This api returns the status of the request.`,
  })
  @ApiParam({
    name: 'requestId',
    description: 'Request id for fetching status',
    example: '4acf3398-9d53-41d1-bacb-4786e9ce6bcd',
    type: 'string',
    required: true,
  })
  @ApiOkResponse({
    description: 'Status fetched successfully',
    type: GetStatusResData,
  })
  @Get('status/:requestId')
  async getStatus(
    @Param(HttpReqValidationPipe) params: GetStatusReqParamDto,
  ): Promise<GetStatusResData> {
    return await this.statusService.getStatus(params.requestId);
  }
}
