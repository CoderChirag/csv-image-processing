import apm from 'elastic-apm-node';
import { Logger } from '@nestjs/common';
import { ConfigOptions as DbConfigOptions } from '@app/nestjs-db-service';
import { SUPPORTED_DBS, MongoSchemasType } from '@app/db-service';
import { config, providers } from 'src/constants';
import { DB_SCHEMAS } from 'src/models';

export const dbConfig: DbConfigOptions<
  typeof SUPPORTED_DBS.MONGO_DB,
  MongoSchemasType
> = {
  providerName: providers.SERVICES.DB,
  type: SUPPORTED_DBS.MONGO_DB,
  withTransactionLogger: true,
  loggerToken: providers.SERVICES.LOGGER,
  connectionString: config.DB.CONNECTION_STRING,
  schemas: DB_SCHEMAS,
  configOptions: {
    connectTimeoutMS: config.DB.MONGO_CONNECT_TIMEOUT,
    serverSelectionTimeoutMS: config.DB.MONGO_SERVER_SELECTION_TIMEOUT,
    maxPoolSize: config.DB.MONGO_POOL_SIZE,
    keepAlive: true,
  },
  logger: new Logger(providers.SERVICES.DB),
  apm: apm as any,
};
