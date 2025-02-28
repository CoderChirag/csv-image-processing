import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { PinoLogger } from './services/pino/pino.service';
import { loggerConfigurations } from 'src/util/logger/logger.config';
import { providers } from 'src/constants';

const moduleConfig: ModuleMetadata = {
  imports: [PinoLoggerModule.forRoot(loggerConfigurations)],
  providers: [
    {
      provide: providers.SERVICES.LOGGER,
      useClass: PinoLogger,
    },
  ],
  exports: [providers.SERVICES.LOGGER],
};

/** Boundary Module for Logger Service */
@Module({})
export class LoggerModule {
  static forRoot(): DynamicModule {
    return {
      module: LoggerModule,
      ...moduleConfig,
      global: true,
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: LoggerModule,
      ...moduleConfig,
    };
  }
}
