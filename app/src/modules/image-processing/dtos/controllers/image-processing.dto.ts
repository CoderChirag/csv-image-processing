import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator';
import { HttpResponse } from 'src/dtos/http-response.dto';
import { RequestStatus } from 'src/models/request/request.schema';

export class ProcessCSVReqQueryDto {
  @ApiProperty({
    description: 'The URL to which the processing result will be sent',
    example: 'https://example.com/webhook',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  webhookUrl: string;
}

export class GetStatusReqParamDto {
  @ApiProperty({
    description: 'The request id',
    example: '4acf3398-9d53-41d1-bacb-4786e9ce6bcd',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  requestId: string;
}

export class ProcessCSVResData {
  @ApiProperty({
    description: 'The request id',
    example: '4acf3398-9d53-41d1-bacb-4786e9ce6bcd',
  })
  requestId: string;
}

export class GetStatusResData {
  @ApiProperty({
    description: 'The status of the request',
    enum: Object.values(RequestStatus),
    example: 'Processing',
  })
  status: RequestStatus;

  @ApiProperty({
    description: 'The message of the request',
    example: 'request processing started',
  })
  message: string;
}

export class ProcessCSVResDto extends HttpResponse {
  @ApiProperty({
    description: 'The data of the response',
    type: ProcessCSVResData,
    required: true,
  })
  data: ProcessCSVResData;
}

export class GetStatusResDto extends HttpResponse {
  @ApiProperty({
    description: 'The data of the response',
    type: GetStatusResData,
    required: true,
  })
  data: GetStatusResData;
}
