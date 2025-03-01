import { KafkaService } from '@app/queue-service';
import { Inject, Injectable } from '@nestjs/common';
import { providers } from 'src/constants';
import { ImageProcessingProducts } from 'src/dtos/entities/messaging/image-processing.messaging-entity.dto';
import { IImageProcessingMessagingEntity } from 'src/interfaces/entities/messaging/image-processing.messaging-entity.interface';
import { MESSAGING_ENTITY_CONFIG } from '../constants/config';

@Injectable()
export class ImageProcessingMessagingEntity
  implements IImageProcessingMessagingEntity
{
  constructor(
    @Inject(providers.SERVICES.QUEUE) private readonly queue: KafkaService,
  ) {}

  async publishProcessingRequest(
    requestId: string,
    products: ImageProcessingProducts,
    webhookUrl: string,
  ): Promise<string> {
    await this.queue.producer.publish(
      MESSAGING_ENTITY_CONFIG.PUBLISH_TOPICS.IMAGE_PROCESSING.TOPIC_NAME,
      {
        key: requestId,
        value: {
          requestId,
          products,
          webhookUrl,
        },
      },
    );
    return requestId;
  }
}
