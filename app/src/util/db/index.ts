import { DB_TYPES, IConfigModelsOrSchemas } from '@app/db-service';
import { ConfigOptions as DbConfigOptions } from '@app/nestjs-db-service';
import { dbConfig } from './db.config';

export const dbConfigs: Record<
  string,
  DbConfigOptions<DB_TYPES, IConfigModelsOrSchemas>
> = {
  db: dbConfig,
};
