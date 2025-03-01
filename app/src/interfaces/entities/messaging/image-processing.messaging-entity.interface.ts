import { ImageProcessingProducts } from 'src/dtos/entities/messaging/image-processing.messaging-entity.dto';

export interface IImageProcessingMessagingEntity {
  publishProcessingRequest(
    requestId: string,
    products: ImageProcessingProducts,
    webhookUrl: string,
  ): Promise<string>;
}
