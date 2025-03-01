import { ImageProcessingRequest } from 'src/dtos/entities/messaging/image-processing.messaging-entity.dto';

export interface IImageProcessor {
  process(request: ImageProcessingRequest): Promise<void>;
}
