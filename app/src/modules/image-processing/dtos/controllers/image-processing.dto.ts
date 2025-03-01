import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { HttpResponse } from 'src/dtos/http-response.dto';

export class ProcessCSVReqQueryDto {
  @ApiProperty({
    description: 'The URL to which the processing result will be sent',
    example: 'https://example.com/webhook',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  webhookUrl: string;
}

export class ProcessCSVResData {
  @ApiProperty({
    description: 'The request id',
    example: '4acf3398-9d53-41d1-bacb-4786e9ce6bcd',
  })
  requestId: string;
}

export class ProcessCSVResDto extends HttpResponse {
  @ApiProperty({
    description: 'The data of the response',
    type: ProcessCSVResData,
    required: true,
  })
  data: ProcessCSVResData;
}
