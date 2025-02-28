import { ApiResponseProperty } from '@nestjs/swagger';

export class HttpResponse {
  @ApiResponseProperty({ example: true })
  success: boolean;
  @ApiResponseProperty()
  data: any;
}
