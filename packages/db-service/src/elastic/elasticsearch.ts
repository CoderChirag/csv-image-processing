import { Logger } from "@app/utility-types";
import { Client, ClientOptions } from "@elastic/elasticsearch";
import { Agent } from "elastic-apm-node";
import { ElasticsearchServiceError } from "../exceptions/error";
import { IDBService } from "../interfaces";

export class ElasticsearchService implements IDBService {
	private logger: Logger;
	private transactionLogger: Logger;
	private apm?: Agent;

	private clientOptions: ClientOptions;
	private _client: Client;

	constructor(
		clientOptions: ClientOptions,
		logger?: Logger,
		transactionLogger?: Logger,
		apm?: Agent,
	) {
		this.clientOptions = clientOptions;
		this.logger = logger ?? console;
		this.transactionLogger = transactionLogger ?? this.logger;
		this.apm = apm;
	}

	get client() {
		return this._client;
	}

	async connect() {
		try {
			this._client = new Client(this.clientOptions);
			this.logger.log("Successfully connected to Elasticsearch!!");
		} catch (e) {
			const err = new ElasticsearchServiceError("Error connecting to Elasticsearch", e);
			this.logger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}

	async isConnected() {
		try {
			return Boolean((await this._client.ping()).body);
		} catch (e) {
			const err = new ElasticsearchServiceError("Error pinging Elasticsearch", e);
			this.transactionLogger.error(err.message);
			this.apm?.captureError(err);
			return false;
		}
	}

	async closeConnection() {
		try {
			await this._client.close();
			this.logger.log("Elasticsearch connection closed!!");
		} catch (e) {
			const err = new ElasticsearchServiceError("Error closing connection to Elasticsearch", e);
			this.logger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}
}
