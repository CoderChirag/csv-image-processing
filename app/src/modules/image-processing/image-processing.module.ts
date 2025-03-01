import { Module } from '@nestjs/common';
import { CSVEntityModule } from 'src/entities/csv/csv.module';
import { IMAGE_PROCESSING_CONFIG } from './constants/config';
import { SchedulingService } from './services/scheduling.service';
import { MessagingEntityModule } from 'src/entities/messaging/messaging.module';
import { ImageProcessingController } from './controllers/image-processing.controller';
import { APP_NAMES, config, providers } from 'src/constants';
import { ImageProcessor } from './processors/image.processor';
import { StatusService } from './services/status.service';
import { HttpClientModule } from 'src/services/http-client-service/http-client.module';

@Module({
  imports: [
    CSVEntityModule,
    MessagingEntityModule,
    HttpClientModule.forFeature(
      {},
      IMAGE_PROCESSING_CONFIG.PROVIDERS.HTTP_CLIENT,
      false,
    ),
  ],
  controllers:
    config.APP.NAME === APP_NAMES.API_APP ? [ImageProcessingController] : [],
  providers: [
    {
      provide: IMAGE_PROCESSING_CONFIG.PROVIDERS.SCHEDULING,
      useClass: SchedulingService,
    },
    {
      provide: IMAGE_PROCESSING_CONFIG.PROVIDERS.STATUS,
      useClass: StatusService,
    },
    {
      provide: providers.MODULES.IMAGE_PROCESSOR,
      useClass: ImageProcessor,
    },
  ],
  exports: [providers.MODULES.IMAGE_PROCESSOR],
})
export class ImageProcessingModule {}
