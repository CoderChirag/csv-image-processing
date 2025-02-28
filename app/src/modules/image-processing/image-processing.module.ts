import { Module } from '@nestjs/common';
import { ImageProcessingController } from './image-processing.controller';
import { CSVEntityModule } from 'src/entities/csv/csv.module';

@Module({
  imports: [CSVEntityModule],
  controllers: [ImageProcessingController],
  providers: [],
})
export class ImageProcessingModule {}
