import { ApiResponseProperty } from '@nestjs/swagger';

export class HttpError {
  @ApiResponseProperty({ example: false })
  success: false;
  @ApiResponseProperty()
  error: {
    message: string;
    details?: Record<string, any>;
  };
}
