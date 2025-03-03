import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppEnv } from 'src/dtos/app-env.dto';
import { MessagingEntityModule } from 'src/entities/messaging/messaging.module';
import { HealthCheckModule } from 'src/modules/health-check/health-check.module';
import { ConfigurationServiceModule } from 'src/services/configuration-service/configuration-service.module';
import { LoggerModule } from 'src/services/logger/logger.module';
import { RepositoryModule } from 'src/services/repository-service/repository.module';
import { appEnvTransformer } from 'src/transformers/app-env.transformer';
import { ConsumerAppLifecycleService } from './consumer-app-lifecycle.service';
import { ImageProcessingModule } from 'src/modules/image-processing/image-processing.module';
import { ScheduleModule } from '@nestjs/schedule';

export const ConsumerAppConfigurationModule =
  ConfigurationServiceModule.forRoot(
    AppEnv,
    process.env as Record<string, string>,
    appEnvTransformer,
  );

@Module({
  imports: [
    LoggerModule.forRoot(),
    ScheduleModule.forRoot(),
    ConsumerAppConfigurationModule,
    EventEmitterModule.forRoot(),
    RepositoryModule.forRoot(),
    MessagingEntityModule,
    ImageProcessingModule,
  ],
  providers: [ConsumerAppLifecycleService],
})
export class ConsumerAppModule {}
