import { Agent } from "elastic-apm-node";
import { Logger } from "@app/utility-types";
import { SUPPORTED_DBS } from "../constants";
import { MongoService } from "../mongo/mongo-service";
import {
	Model as MongooseModel,
	Schema as MongooseSchema,
	ConnectOptions as MongooseConnectOptions,
} from "mongoose";

export type MongoSchemasType = Record<string, MongooseSchema>;

export type MongoSchemaEntityType<S> = S extends MongooseSchema<infer T> ? T : never;
export type IMongoModels<S> = {
	[K in keyof S]: MongooseModel<MongoSchemaEntityType<S[K]>>;
};

export interface MongoConnectOptions extends MongooseConnectOptions {
	connectTimeoutMS?: number;
	serverSelectionTimeoutMS?: number;
	poolSize?: number;
	keepAlive?: boolean;
}
export interface IMongoConfigOptions<S extends MongoSchemasType> {
	type: typeof SUPPORTED_DBS.MONGO_DB;
	connectionString: string;
	schemas: S;
	configOptions?: MongoConnectOptions;
	hooks?: (schemas: S) => void | Promise<void>;
	logger?: Logger;
	transactionLogger?: Logger;
	apm?: Agent;
}

export type IMongoService<S extends MongoSchemasType> = MongoService<S> & IMongoModels<S>;
