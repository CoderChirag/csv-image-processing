import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { config, providers } from 'src/constants';
import { IMessagingEntity } from 'src/interfaces/entities/messaging/messaging-entity.interface';

@Injectable()
export class ApiAppLifecycleService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(ApiAppLifecycleService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(providers.ENTITIES.MESSAGING)
    private readonly messaging: IMessagingEntity,
  ) {}

  async onApplicationBootstrap() {
    process.on('SIGUSR1', async () => {
      this.logger.log('SIGUSR1 signal received.');
      this.eventEmitter.emit(config.APP.EVENTS.SHUTDOWN_EVENT, true);
    });

    await this.messaging.registerSchemas();
    await this.messaging.initializeTopics();
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log('App Shutdown Signal Received: ' + signal);
  }
}
