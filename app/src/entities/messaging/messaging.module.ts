import { QueueModule } from '@app/nestjs-queue-service';
import { Module } from '@nestjs/common';
import { providers } from 'src/constants';
import { kafkaQueueConfig } from 'src/util/queue/kafka.config';
import { MessagingEntity } from './services/messaging.entity';
import { ImageProcessingMessagingEntity } from './services/image-processing.messaging.entity';

@Module({
  imports: [QueueModule.forRoot(kafkaQueueConfig)],
  providers: [
    {
      provide: providers.ENTITIES.MESSAGING,
      useClass: MessagingEntity,
    },
    {
      provide: providers.ENTITIES.IMAGE_PROCESSING_MESSAGING,
      useClass: ImageProcessingMessagingEntity,
    },
  ],
  exports: [
    providers.ENTITIES.MESSAGING,
    providers.ENTITIES.IMAGE_PROCESSING_MESSAGING,
  ],
})
export class MessagingEntityModule {}
