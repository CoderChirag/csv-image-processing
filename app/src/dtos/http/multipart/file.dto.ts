import { ApiProperty } from '@nestjs/swagger';

export class MultipartFileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
