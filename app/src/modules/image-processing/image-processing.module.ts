import { Module } from '@nestjs/common';
import { ImageProcessingController } from './image-processing.controller';
import { CSVEntityModule } from 'src/entities/csv/csv.module';
import { IMAGE_PROCESSING_CONFIG } from './constants/config';
import { SchedulingService } from './services/scheduling.service';
import { MessagingEntityModule } from 'src/entities/messaging/messaging.module';

@Module({
  imports: [CSVEntityModule, MessagingEntityModule],
  controllers: [ImageProcessingController],
  providers: [
    {
      provide: IMAGE_PROCESSING_CONFIG.PROVIDERS.SCHEDULING,
      useClass: SchedulingService,
    },
  ],
})
export class ImageProcessingModule {}
