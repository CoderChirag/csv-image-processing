import { resolve } from 'node:path';
import { readdir } from 'node:fs/promises';
import { KafkaService } from '@app/queue-service';
import { Inject, Injectable } from '@nestjs/common';
import { config, providers } from 'src/constants';
import { IMessagingEntity } from 'src/interfaces/entities/messaging/messaging-entity.interface';
import { MESSAGING_ENTITY_CONFIG } from '../constants/config';

@Injectable()
export class MessagingEntity implements IMessagingEntity {
  constructor(
    @Inject(providers.SERVICES.QUEUE) private readonly queue: KafkaService,
  ) {}

  async registerSchemas(): Promise<void> {
    const schemasDir = config.QUEUE.AVRO_SCHEMAS_DIR;
    const schemas = await readdir(schemasDir);
    for (const path of schemas) {
      const schemaPath = resolve(schemasDir, path);
      const schemaName = `${path.split('.')[0]}-${config.NODE_ENV}`;
      await this.queue.registerSchema(schemaPath, schemaName);
    }
  }

  async initializeTopics(): Promise<void> {
    const topics = Object.values(MESSAGING_ENTITY_CONFIG.PUBLISH_TOPICS);
    for (const {
      TOPIC_NAME,
      DLQ_REQUIRED,
      PARTITIONS,
      DLQ_TOPIC_NAME,
      DLQ_PARTITIONS,
    } of topics) {
      await this.queue.createTopic({
        topic: TOPIC_NAME,
        numPartitions: PARTITIONS,
      });
      if (DLQ_REQUIRED) {
        await this.queue.createTopic({
          topic: DLQ_TOPIC_NAME,
          numPartitions: DLQ_PARTITIONS,
        });
      }
    }
  }
}
