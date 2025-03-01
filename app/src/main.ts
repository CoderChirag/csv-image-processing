import apm from 'elastic-apm-node';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { APP_NAMES, config } from 'src/constants';
import { ApiAppModule } from 'src/apps/api/api-app.module';
import { setupDocs } from './util/swagger/setup-docs';
import { ConsumerAppModule } from './apps/consumer/consumer-app.module';
import { ConsumerAppLifecycleService } from './apps/consumer/consumer-app-lifecycle.service';

async function bootstrap() {
  let app: INestApplication | undefined;
  let server: any;
  const appName = config.APP.NAME;
  apm.logger.info(`Initializing startApp ${appName}`);

  if (appName === APP_NAMES.API_APP) {
    app = await NestFactory.create(ApiAppModule, {
      bufferLogs: true,
    });
    app.enableCors();
    app.setGlobalPrefix(config.APP.GLOBAL_API_PREFIX);
    server = app.getHttpServer();
    server.keepAliveTimeout = config.APP.KEEP_ALIVE_TIMEOUT;
    server.headersTimeout = config.APP.HEADERS_TIMEOUT;

    setupDocs(app);

    await app.listen(config.APP.PORT);
    apm.logger.info(`App Started on Port: ${config.APP.PORT}`);
  } else if (appName === APP_NAMES.CONSUMER_APP) {
    const app = await NestFactory.createApplicationContext(ConsumerAppModule, {
      bufferLogs: true,
    });

    await app.get(ConsumerAppLifecycleService).consume();
  } else {
    const errorMessage = `Invalid app name ${appName}`;
    apm.logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  if (app) {
    app.enableShutdownHooks();
    global.app = app;
  }
}

bootstrap();
