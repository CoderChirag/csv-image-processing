import { config } from 'src/constants';

export const MESSAGING_ENTITY_CONFIG = {
  SCHEMAS_DIR: 'avro-schemas',
  PUBLISH_TOPICS: {
    IMAGE_PROCESSING: {
      TOPIC_NAME: `image-processing-${config.NODE_ENV}`,
      DLQ_REQUIRED: true,
      PARTITIONS: 3,
      DLQ_TOPIC_NAME: `image-processing-${config.NODE_ENV}.DLQ`,
      DLQ_PARTITIONS: 3,
    },
  },
};
