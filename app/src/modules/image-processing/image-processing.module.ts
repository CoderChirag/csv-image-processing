import { Module } from '@nestjs/common';
import { CSVEntityModule } from 'src/entities/csv/csv.module';
import { IMAGE_PROCESSING_CONFIG } from './constants/config';
import { SchedulingService } from './services/scheduling.service';
import { MessagingEntityModule } from 'src/entities/messaging/messaging.module';
import { ImageProcessingController } from './controllers/image-processing.controller';
import { APP_NAMES, config, providers } from 'src/constants';
import { ImageProcessor } from './processors/image.processor';

@Module({
  imports: [CSVEntityModule, MessagingEntityModule],
  controllers:
    config.APP.NAME === APP_NAMES.API_APP ? [ImageProcessingController] : [],
  providers: [
    {
      provide: IMAGE_PROCESSING_CONFIG.PROVIDERS.SCHEDULING,
      useClass: SchedulingService,
    },
    {
      provide: providers.MODULES.IMAGE_PROCESSOR,
      useClass: ImageProcessor,
    },
  ],
  exports: [providers.MODULES.IMAGE_PROCESSOR],
})
export class ImageProcessingModule {}
