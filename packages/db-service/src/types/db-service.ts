import { SUPPORTED_DBS } from "../constants";
import { IMongoConfigOptions, IMongoService, MongoSchemasType } from "./mongo";
import { ISqlConfigOptions, ISqlService, SqlModelsType } from "./sql";
import { IElasticsearchConfigOptions } from "./elasticsearch";
import { ElasticsearchService } from "../elastic/elasticsearch";

export type IConfigModelsOrSchemas = MongoSchemasType | SqlModelsType | undefined;

export type IDbInstance<
	T extends DB_TYPES,
	S extends IConfigModelsOrSchemas = undefined,
> = T extends typeof SUPPORTED_DBS.MONGO_DB
	? S extends MongoSchemasType
		? IMongoService<S>
		: never
	: T extends typeof SUPPORTED_DBS.SQL
		? S extends SqlModelsType
			? ISqlService<S>
			: never
		: T extends typeof SUPPORTED_DBS.ELASTICSEARCH
			? S extends undefined
				? ElasticsearchService
				: never
			: never;

export type IDBConfigOptions<
	T extends DB_TYPES,
	S extends IConfigModelsOrSchemas = undefined,
> = T extends typeof SUPPORTED_DBS.MONGO_DB
	? S extends MongoSchemasType
		? IMongoConfigOptions<S>
		: never
	: T extends typeof SUPPORTED_DBS.SQL
		? S extends SqlModelsType
			? ISqlConfigOptions<S>
			: never
		: T extends typeof SUPPORTED_DBS.ELASTICSEARCH
			? S extends undefined
				? IElasticsearchConfigOptions
				: never
			: never;

export type DB_TYPES = (typeof SUPPORTED_DBS)[keyof typeof SUPPORTED_DBS];
