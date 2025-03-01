import { Logger } from 'nestjs-pino';
import { Injectable } from '@nestjs/common';
import { ILogger } from 'src/interfaces/logger/logger.interface';

/** Boundary for nestjs-pino */
@Injectable()
export class PinoLogger implements ILogger {
  constructor(private readonly logger: Logger) {
    this.logger = logger;
  }

  verbose(message: any, ...optionalParams: any[]): void {
    this.logger.verbose(message, ...optionalParams);
  }
  debug(message: any, ...optionalParams: any[]): void {
    this.logger.debug(message, ...optionalParams);
  }
  log(message: any, ...optionalParams: any[]): void {
    this.logger.log(message, ...optionalParams);
  }
  warn(message: any, ...optionalParams: any[]): void {
    this.logger.warn(message, ...optionalParams);
  }
  error(message: any, ...optionalParams: any[]): void {
    this.logger.error(message, ...optionalParams);
  }
  fatal(message: any, ...optionalParams: any[]): void {
    this.logger.fatal(message, ...optionalParams);
  }
}
