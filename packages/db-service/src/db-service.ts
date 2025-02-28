import { Agent } from "elastic-apm-node";
import { DBServiceError } from ".";
import { SUPPORTED_DBS } from "./constants";
import { getMongoService } from "./mongo/mongo-service";
import { getSqlService } from "./sql/sql-service";
import type {
	DB_TYPES,
	IConfigModelsOrSchemas,
	IDBConfigOptions,
	IDbInstance,
	MongoSchemasType,
	SqlModelsType,
} from "./types";
import { ElasticsearchService } from "./elastic/elasticsearch";

export class DBService<T extends DB_TYPES, S extends IConfigModelsOrSchemas = undefined> {
	private _db: IDbInstance<T, S>;

	constructor(config: IDBConfigOptions<T, S>) {
		const { type, logger, transactionLogger, apm } = config;
		switch (type) {
			case SUPPORTED_DBS.MONGO_DB:
				const {
					schemas,
					configOptions,
					connectionString: mongoConnectionString,
					hooks,
				} = config as IDBConfigOptions<typeof SUPPORTED_DBS.MONGO_DB, MongoSchemasType>;
				if (!schemas) {
					const err = new DBServiceError("Schemas are required for MongoDB connection");
					apm?.captureError(err);
					throw err;
				}
				(this._db as any) = getMongoService(
					mongoConnectionString,
					schemas as S extends MongoSchemasType ? S : never,
					configOptions,
					hooks,
					logger,
					transactionLogger,
					apm,
				);
				break;
			case SUPPORTED_DBS.SQL:
				const {
					models,
					dialectOptions,
					connectionString: sqlConnectionString,
				} = config as IDBConfigOptions<typeof SUPPORTED_DBS.SQL, SqlModelsType>;
				if (!models) {
					const err = new DBServiceError("Models are required for SQL connection");
					apm?.captureError(err);
					throw err;
				}
				(this._db as any) = getSqlService(
					sqlConnectionString,
					models as S extends SqlModelsType ? S : never,
					dialectOptions,
					logger,
					transactionLogger,
					apm,
				);
				break;
			case SUPPORTED_DBS.ELASTICSEARCH:
				const { clientOptions } = config as IDBConfigOptions<typeof SUPPORTED_DBS.ELASTICSEARCH>;
				if (!clientOptions) {
					const err = new DBServiceError(
						"Client options are required for Elasticsearch connection",
					);
					apm?.captureError(err);
					throw err;
				}
				(this._db as any) = new ElasticsearchService(clientOptions, logger, transactionLogger, apm);
				break;
			default:
				const err = new DBServiceError(`DB type not supported: ${type}`);
				((logger || console) as any).error(err.message);
				(apm as Agent)?.captureError(err);
				throw err;
		}
	}

	getDbInstance() {
		return this._db;
	}
}
