import { Options as SequelizeOptions, Sequelize } from "sequelize";
import { Agent } from "elastic-apm-node";
import { Logger } from "@app/utility-types";
import { SUPPORTED_DBS } from "../constants";
import { SqlService } from "../sql/sql-service";

export type SqlModelsType = Record<string, (db: Sequelize) => any>;

export type ISqlModels<T extends SqlModelsType> = {
	[K in keyof T]: ReturnType<T[K]>;
};

export interface ISqlConfigOptions<M extends SqlModelsType> {
	type: typeof SUPPORTED_DBS.SQL;
	connectionString: string;
	models: M;
	dialectOptions?: SequelizeOptions;
	logger?: Logger;
	transactionLogger?: Logger;
	apm?: Agent;
}

export type ISqlService<T extends SqlModelsType> = SqlService<T> & ISqlModels<T>;
