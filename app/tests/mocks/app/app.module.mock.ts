import { setTimeout as sleep } from 'node:timers/promises';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  ApiAppConfigurationModule,
  ApiAppModule,
} from 'src/apps/api/api-app.module';
import { config, providers } from 'src/constants';
import { MockConfigurationServiceModule } from 'tests/mocks/services/util/configuration-service/configuration-service.module.mock';
import { MockDbService } from '../lib/db-service/db.service.mock';

export async function createTestingApp(): Promise<INestApplication> {
  let app: INestApplication;
  const moduleRef = await Test.createTestingModule({
    imports: [ApiAppModule],
  })
    .overrideModule(ApiAppConfigurationModule)
    .useModule(MockConfigurationServiceModule)
    .overrideProvider(providers.SERVICES.DB)
    .useValue(MockDbService)
    .compile();

  app = moduleRef.createNestApplication();
  app.setGlobalPrefix(config.APP.GLOBAL_API_PREFIX);
  await app.init();

  return app;
}

export async function closeTestingApp(app: INestApplication) {
  process.emit('SIGUSR1');
  await sleep(500);
  await app.close();
}
