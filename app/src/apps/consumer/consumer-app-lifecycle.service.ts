import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';
import { mkdir, writeFile } from 'fs/promises';
import { dirname } from 'path';
import { config, providers } from 'src/constants';
import { IImageProcessingMessagingEntity } from 'src/interfaces/entities/messaging/image-processing.messaging-entity.interface';
import { ILogger } from 'src/interfaces/logger/logger.interface';
import { IImageProcessor } from 'src/interfaces/modules/image-processing/image-processor.interface';
import { IRepositoryService } from 'src/interfaces/repositories/services/repository-service.interface';

@Injectable()
export class ConsumerAppLifecycleService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(ConsumerAppLifecycleService.name);

  constructor(
    @Inject(providers.SERVICES.LOGGER) private readonly txnLogger: ILogger,
    private readonly eventEmitter: EventEmitter2,
    @Inject(providers.MODULES.IMAGE_PROCESSOR)
    private readonly imageProcessor: IImageProcessor,
    @Inject(providers.ENTITIES.IMAGE_PROCESSING_MESSAGING)
    private readonly imageProcessingMessaging: IImageProcessingMessagingEntity,
    @Inject(providers.SERVICES.REPOSITORY)
    private readonly repo: IRepositoryService,
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

  @Interval(config.APP.LIVENESS_CHECK_INTERVAL)
  async checkLiveness() {
    const dbConnectionStatus = await this.repo.connectionStatus();
    if (dbConnectionStatus.db_status !== 'success') {
      this.txnLogger.error('Database connection failed');
      return;
    }

    const timestamp = new Date().toISOString();
    await this.writeLivenessFile(config.APP.LIVENESS_FILE_PATH, timestamp);
  }

  async writeLivenessFile(filepath: string, timestamp: string) {
    try {
      await mkdir(dirname(filepath), { recursive: true });
      await writeFile(filepath, timestamp);
    } catch (error) {
      this.txnLogger.error(`Failed to write liveness file: ${error}`, error);
    }
  }
}
