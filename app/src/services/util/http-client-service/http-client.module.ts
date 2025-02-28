import { DynamicModule, Module } from '@nestjs/common';
import { HttpRequestConfig } from 'src/interfaces/util/http-client-service/http-client-service.interface';
import { AxiosClientService } from './services/axios-client/axios-client.service';
import { ILogger } from 'src/interfaces/util/logger/logger.interface';
import { providers } from 'src/constants';

/** Boundary Module for Http Client Service */
@Module({})
export class HttpClientModule {
  static forFeature(
    config: HttpRequestConfig<any>,
    providerName: string,
    responseLogging: boolean = true,
  ): DynamicModule {
    return {
      module: HttpClientModule,
      providers: [
        {
          provide: providerName,
          useFactory: (logger: ILogger) =>
            new AxiosClientService(config, responseLogging, logger),
          inject: [providers.SERVICES.LOGGER],
        },
      ],
      exports: [providerName],
    };
  }
}
