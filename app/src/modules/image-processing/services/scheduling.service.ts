import { v4 as uuidv4 } from 'uuid';
import { Inject, Injectable } from '@nestjs/common';
import { ISchedulingService } from '../interfaces/schedule-service.interface';
import { ImageProcessingSchedulingProducts } from '../dtos/services/scheduling.service';
import { providers } from 'src/constants';
import { IImageProcessingMessagingEntity } from 'src/interfaces/entities/messaging/image-processing.messaging-entity.interface';
import { IRequestRepository } from 'src/interfaces/repositories/request/request-repository.interface';
import {
  RequestStatus,
  RequestStatusMessage,
} from 'src/models/request/request.schema';

@Injectable()
export class SchedulingService implements ISchedulingService {
  constructor(
    @Inject(providers.ENTITIES.IMAGE_PROCESSING_MESSAGING)
    private readonly scheduler: IImageProcessingMessagingEntity,
    @Inject(providers.REPOSITORIES.REQUEST)
    private readonly request: IRequestRepository,
  ) {}

  async scheduleImageProcessing(
    products: ImageProcessingSchedulingProducts,
    webhookUrl: string,
  ): Promise<string> {
    const requestId = uuidv4();
    const request = await this.request.createRequest({
      requestId,
      status: RequestStatus.ACCEPTED,
      message: RequestStatusMessage.ACCEPTED,
      webhookUrl,
      products,
    });
    await this.scheduler.publishProcessingRequest(
      requestId,
      products,
      webhookUrl,
    );
    return requestId;
  }
}
