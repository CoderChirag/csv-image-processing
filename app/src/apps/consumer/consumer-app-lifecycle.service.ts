import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { config, providers } from 'src/constants';
import { IImageProcessingMessagingEntity } from 'src/interfaces/entities/messaging/image-processing.messaging-entity.interface';
import { IImageProcessor } from 'src/interfaces/modules/image-processing/image-processor.interface';

@Injectable()
export class ConsumerAppLifecycleService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(ConsumerAppLifecycleService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(providers.MODULES.IMAGE_PROCESSOR)
    private readonly imageProcessor: IImageProcessor,
    @Inject(providers.ENTITIES.IMAGE_PROCESSING_MESSAGING)
    private readonly imageProcessingMessaging: IImageProcessingMessagingEntity,
  ) {}

  async onApplicationBootstrap() {
    process.on('SIGUSR1', async () => {
      this.logger.log('SIGUSR1 signal received.');
      this.eventEmitter.emit(config.APP.EVENTS.SHUTDOWN_EVENT, true);
    });
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log('App Shutdown Signal Received: ' + signal);
  }

  async consume() {
    this.imageProcessingMessaging.subscribe(
      this.imageProcessor.process.bind(this.imageProcessor),
    );
  }
}
