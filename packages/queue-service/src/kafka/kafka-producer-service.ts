import { Agent } from "elastic-apm-node";
import { Kafka, Message, Partitioners, Producer, ProducerConfig } from "kafkajs";
import { KafkaProducerServiceError } from "..";
import { Logger } from "@app/utility-types";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";

export class KafkaProducerService {
	private _client: Kafka;
	private _schemaRegistry?: SchemaRegistry;
	private _producer: Producer;

	private logger: Logger;
	private transactionLogger: Logger;
	private apm?: Agent;

	constructor(
		_client: Kafka,
		_schemaRegistry?: SchemaRegistry,
		config?: ProducerConfig,
		logger?: Logger,
		transactionLogger?: Logger,
		apm?: Agent,
	) {
		this._client = _client;
		this._schemaRegistry = _schemaRegistry;
		this.logger = logger ?? console;
		this.transactionLogger = transactionLogger ?? this.logger;
		this.apm = apm;

		this._producer = this._client.producer({
			createPartitioner: Partitioners.DefaultPartitioner,
			...config,
		});
	}

	async connect() {
		try {
			await this._producer.connect();
			this.logger.log("[KafkaProducerService] Connected to Kafka Producer!!");
		} catch (e) {
			const err = new KafkaProducerServiceError("Error connecting to Kafka Producer", e);
			this.logger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}

	async disconnect() {
		try {
			await this._producer.disconnect();
			this.logger.log("[KafkaProducerService] Kafka Producer Disconnected!!");
		} catch (e) {
			const err = new KafkaProducerServiceError("Error disconnecting from Kafka Producer", e);
			this.logger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}

	async publish(
		topicName: string,
		message: Omit<Message, "value"> & { value: unknown },
		schemaEnabled: boolean = false,
	) {
		try {
			const headers = {};
			this.apm?.currentTransaction?.setLabel("kafka_producer_topic", topicName);
			if (this.apm?.currentTransaction?.ids)
				headers["transaction"] = JSON.stringify(this.apm.currentTransaction.ids);

			this.transactionLogger.log(
				`[KafkaProducerService] Publishing message to ${topicName}: ${JSON.stringify(message)}`,
			);
			const result = await this._producer.send({
				topic: topicName,
				messages: [
					{
						...message,
						value:
							schemaEnabled && this._schemaRegistry
								? await this._schemaRegistry.encode(
										await this._schemaRegistry.getLatestSchemaId(topicName),
										message.value,
									)
								: JSON.stringify(message.value),
						headers,
					},
				],
			});
			this.transactionLogger.log(`[KafkaProducerService] Published message to ${topicName}`);
			return result;
		} catch (e) {
			const err = new KafkaProducerServiceError("Error publishing message to Kafka Producer", e);
			this.transactionLogger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}
}
