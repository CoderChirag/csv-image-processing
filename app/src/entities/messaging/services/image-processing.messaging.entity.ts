import {
  IKafkaMessageProcessorMessageArg,
  KafkaService,
} from '@app/queue-service';
import { Inject, Injectable } from '@nestjs/common';
import { providers } from 'src/constants';
import {
  ImageProcessingHandler,
  ImageProcessingProducts,
  ImageProcessingRequest,
} from 'src/dtos/entities/messaging/image-processing.messaging-entity.dto';
import { IImageProcessingMessagingEntity } from 'src/interfaces/entities/messaging/image-processing.messaging-entity.interface';
import { MESSAGING_ENTITY_CONFIG } from '../constants/config';

@Injectable()
export class ImageProcessingMessagingEntity
  implements IImageProcessingMessagingEntity
{
  private handler: ImageProcessingHandler;
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
      true,
    );
    return requestId;
  }

  async subscribe(handler: ImageProcessingHandler): Promise<void> {
    this.handler = handler;
    await this.queue.consumer.subscribe(
      {
        groupId: MESSAGING_ENTITY_CONFIG.CONSUMER_GROUP_ID.IMAGE_PROCESSING,
      },
      {
        topics: [
          MESSAGING_ENTITY_CONFIG.PUBLISH_TOPICS.IMAGE_PROCESSING.TOPIC_NAME,
        ],
        dlqRequired: true,
        schemaEnabled: true,
      },
      this.processor.bind(this),
    );
  }

  private async processor(
    msg: IKafkaMessageProcessorMessageArg<ImageProcessingRequest>,
  ): Promise<void> {
    await this.handler(msg.value);
  }
}
