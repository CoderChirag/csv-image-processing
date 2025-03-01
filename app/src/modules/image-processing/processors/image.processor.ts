import { Injectable } from '@nestjs/common';
import { ImageProcessingRequest } from 'src/dtos/entities/messaging/image-processing.messaging-entity.dto';
import { IImageProcessor } from 'src/interfaces/modules/image-processing/image-processor.interface';

@Injectable()
export class ImageProcessor implements IImageProcessor {
  async process(request: ImageProcessingRequest): Promise<void> {
    console.log(request);
  }
}
