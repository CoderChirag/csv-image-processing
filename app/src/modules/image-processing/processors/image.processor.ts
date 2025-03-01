import { Inject, Injectable } from '@nestjs/common';
import { providers } from 'src/constants';
import { ImageProcessingRequest } from 'src/dtos/entities/messaging/image-processing.messaging-entity.dto';
import { ILogger } from 'src/interfaces/logger/logger.interface';
import { IImageProcessor } from 'src/interfaces/modules/image-processing/image-processor.interface';
import { IRequestRepository } from 'src/interfaces/repositories/request/request-repository.interface';
import {
  RequestStatus,
  RequestStatusMessage,
} from 'src/models/request/request.schema';

@Injectable()
export class ImageProcessor implements IImageProcessor {
  constructor(
    @Inject(providers.SERVICES.LOGGER)
    private readonly logger: ILogger,
    @Inject(providers.REPOSITORIES.REQUEST)
    private readonly request: IRequestRepository,
  ) {}
  async process(request: ImageProcessingRequest): Promise<void> {
    this.logger.log(
      `Processing for request ${request.requestId}`,
      request.requestId,
    );
    await this.request.updateStatus(
      request.requestId,
      RequestStatus.PROCESSING,
      RequestStatusMessage.PROCESSING,
    );
    this.logger.log(
      `Processing completed for request ${request.requestId}`,
      request.requestId,
    );
  }
}
