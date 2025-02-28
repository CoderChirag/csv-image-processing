import { resolve } from 'node:path';
import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { providers } from 'src/constants';
import { RepositoryService } from './repository.service';
import { DBModule } from '@app/nestjs-db-service';
import { dbConfigs } from 'src/util/db';

const moduleConfig: ModuleMetadata = {
  imports: [DBModule.forRoot(dbConfigs)],
  providers: [
    {
      provide: providers.SERVICES.REPOSITORY,
      useClass: RepositoryService,
    },
    ...Object.entries(providers.REPOSITORIES).map(([name, token]) => ({
      provide: token,
      useClass: require(
        resolve(
          __dirname,
          'repositories',
          name.toLowerCase(),
          `${name.toLowerCase()}.repository`,
        ),
      )[
        `${name
          .split('-')
          .map(
            (n) =>
              n.toLowerCase().charAt(0).toUpperCase() +
              n.slice(1).toLowerCase(),
          )
          .join('')}Repository`
      ],
    })),
  ],

  exports: [
    providers.SERVICES.REPOSITORY,
    ...Object.values(providers.REPOSITORIES),
  ],
};

/** Boundary Module for Database Services */
@Module({})
export class RepositoryModule {
  static forRoot(): DynamicModule {
    return {
      module: RepositoryModule,
      ...moduleConfig,
      global: true,
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: RepositoryModule,
      ...moduleConfig,
    };
  }
}
