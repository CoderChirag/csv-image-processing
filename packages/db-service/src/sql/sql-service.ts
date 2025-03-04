import { Logger } from "@app/utility-types";
import { Agent } from "elastic-apm-node";
import { Model, Options, Sequelize } from "sequelize";
import { ISqlModels, ISqlService, SqlModelsType } from "../types";
import { IDBService } from "../interfaces";
import { SqlServiceError } from "../exceptions/error";

export class SqlService<T extends SqlModelsType> implements IDBService {
	private logger: Logger;
	private transactionLogger: Logger;
	private apm?: Agent;
	private modelsRef: T;
	public models: ISqlModels<T> = {} as ISqlModels<T>;

	private connectionString: string;
	private dialectOptions: Options;
	private dbConnectionRef: Sequelize;

	constructor(
		connectionString: string,
		models: T,
		dialectOptions?: Options,
		logger?: Logger,
		transactionLogger?: Logger,
		apm?: Agent,
	) {
		this.connectionString = connectionString;
		this.dialectOptions = dialectOptions ?? {};
		this.modelsRef = models;
		this.logger = logger ?? console;
		this.transactionLogger = transactionLogger ?? this.logger;
		this.apm = apm;
	}

	get sequelize() {
		return this.dbConnectionRef;
	}

	async connect() {
		this.dbConnectionRef = await this.initiateConnection(
			this.connectionString,
			this.dialectOptions,
		);
		this.setupModels();
	}

	private async initiateConnection(connectionString: string, dialectOptions: Options) {
		try {
			const conn = new Sequelize(connectionString, dialectOptions);
			this.logger.log("Successfully Connected to Sequelize!!");
			return conn;
		} catch (e) {
			const err = new SqlServiceError("Error connecting to sequelize", e);
			this.logger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}

	private setupModels() {
		for (const [modelName, model] of Object.entries(this.modelsRef)) {
			(this.models[modelName] as any) = model(this.dbConnectionRef);
			this[modelName] = this.models[modelName];

			if (this[modelName].associate) {
				this[modelName].associate(this.models);
			}
		}
	}

	async isConnected() {
		try {
			await this.dbConnectionRef.authenticate();
			return true;
		} catch (e) {
			const err = new SqlServiceError("Error authenticating to sequelize", e);
			this.transactionLogger.error(err.message);
			this.apm?.captureError(err);
			return false;
		}
	}

	async closeConnection() {
		try {
			await this.dbConnectionRef.close();
			this.logger.log("Sequelize connection closed!!");
		} catch (e) {
			const err = new SqlServiceError("Error closing sequelize connection", e);
			this.logger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}

	async syncDb() {
		try {
			return await this.dbConnectionRef.sync();
		} catch (e) {
			const err = new SqlServiceError("Error syncing sequelize connection", e);
			this.transactionLogger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}

	fn() {
		return this.sequelize.fn;
	}
}

export const getSqlService = <T extends Record<string, (db: Sequelize) => Model<any, any>>>(
	connectionString: string,
	models: T,
	dialectOptions?: Options,
	logger?: Logger,
	transactionLogger?: Logger,
	apm?: Agent,
) =>
	new SqlService(
		connectionString,
		models,
		dialectOptions,
		logger,
		transactionLogger,
		apm,
	) as ISqlService<T>;
