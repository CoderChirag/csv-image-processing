import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ReqResInterceptor } from 'src/interceptors/request-response.interceptor';
import { HttpExceptionFilter } from 'src/filters/http-exception.filter';
import { ConfigurationServiceModule } from 'src/services/util/configuration-service/configuration-service.module';
import { AppEnv } from 'src/dtos/app-env.dto';
import { appEnvTransformer } from 'src/transformers/app-env.transformer';
import { RepositoryModule } from 'src/services/util/repository-service/repository.module';
import { LoggerModule } from 'src/services/util/logger/logger.module';
import { ApiAppLifecycleService } from './api-app-lifecycle.service';
import { HealthCheckModule } from 'src/modules/health-check/health-check.module';

export const ApiAppConfigurationModule = ConfigurationServiceModule.forRoot(
  AppEnv,
  process.env as Record<string, string>,
  appEnvTransformer,
);
@Module({
  imports: [
    LoggerModule.forRoot(),
    ApiAppConfigurationModule,
    EventEmitterModule.forRoot(),
    HealthCheckModule,
    RepositoryModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ReqResInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    ApiAppLifecycleService,
  ],
})
export class ApiAppModule {}
