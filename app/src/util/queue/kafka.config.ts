import apm from 'elastic-apm-node';
import { QueueConfig } from '@app/nestjs-queue-service';
import { SUPPORTED_QUEUES } from '@app/queue-service';
import { Logger } from '@nestjs/common';
import { config, providers } from 'src/constants';

export const kafkaQueueConfig: QueueConfig<typeof SUPPORTED_QUEUES.KAFKA> = {
  type: SUPPORTED_QUEUES.KAFKA,
  providerName: providers.SERVICES.QUEUE,
  withTransactionLogger: true,
  loggerToken: providers.SERVICES.LOGGER,
  config: {
    kafkaConfig: {
      clientId: config.QUEUE.KAFKA_CLIENT_ID,
      brokers: config.QUEUE.KAFKA_BROKERS,
    },
    schemaRegistryConfig: {
      args: { host: config.QUEUE.SCHEMA_REGISTRY_HOST },
    },
    logger: new Logger(providers.SERVICES.QUEUE),
    apm,
    adminConfig: {},
    producerConfig: {
      allowAutoTopicCreation: true,
    },
  },
};
