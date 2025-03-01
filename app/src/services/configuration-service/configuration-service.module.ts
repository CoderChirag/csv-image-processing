import { DynamicModule, Module } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';
import { ConfigurationService } from './configuration-service.service';
import { providers } from 'src/constants';

/** Boundary Module for Transformation & Validation of Configurations like .env, etc. */
@Module({})
export class ConfigurationServiceModule {
  static forRoot<T extends object>(
    schema: ClassConstructor<T>,
    env: Record<string, string>,
    transformer: (env: Record<string, string>) => Record<string, any>,
  ): DynamicModule {
    return {
      module: ConfigurationServiceModule,
      global: true,
      providers: [
        {
          provide: providers.SERVICES.CONFIGURATION,
          useFactory: async () => {
            const configurationService = new ConfigurationService(
              schema,
              env,
              transformer,
            );
            await configurationService.validate();
            return configurationService.config;
          },
        },
      ],
      exports: [providers.SERVICES.CONFIGURATION],
    };
  }
}
