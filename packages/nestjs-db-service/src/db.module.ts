import { DynamicModule, Module } from "@nestjs/common";
import { DB_TYPES, IConfigModelsOrSchemas, IDBConfigOptions } from "@app/db-service";
import { DBProvider } from "./db.provider";

export type ConfigOptions<
	T extends DB_TYPES,
	S extends IConfigModelsOrSchemas = undefined,
> = IDBConfigOptions<T, S> & {
	providerName: string;
	withTransactionLogger?: boolean;
	loggerToken?: string;
};

@Module({})
export class DBModule {
	static forRoot<T extends Record<string, ConfigOptions<DB_TYPES, IConfigModelsOrSchemas>>>(
		dbConfigs: T,
	): DynamicModule {
		return {
			module: DBModule,
			providers: Object.values(dbConfigs).map((config) => DBProvider(config)),
			exports: Object.values(dbConfigs).map((config) => config.providerName),
			global: true,
		};
	}
}
