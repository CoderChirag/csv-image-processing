import { DynamicModule } from '@nestjs/common';
import { ConfigurationServiceModule } from 'src/services/util/configuration-service/configuration-service.module';
import { MockAppEnv } from 'tests/mocks/dtos/app-env.dto.mock';
import { mockAppEnvTransformer } from 'tests/mocks/transformers/app-env.transformer.mock';

export const MockConfigurationServiceModule: DynamicModule =
  ConfigurationServiceModule.forRoot(
    MockAppEnv,
    process.env as Record<string, string>,
    mockAppEnvTransformer,
  );
