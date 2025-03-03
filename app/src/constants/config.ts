import { HTTP_RESPONSE_CODES } from './http-response-codes';

export const config = {
  NODE_ENV: process.env.NODE_ENV!,
  APP: {
    NAME: process.env.APP_NAME!,
    PORT: process.env.PORT ?? 3000,
    REQUEST_BODY_SIZE_LIMIT: '50mb',
    KEEP_ALIVE_TIMEOUT: 76 * 1000,
    HEADERS_TIMEOUT: 77 * 1000,
    EVENTS: {
      SHUTDOWN_EVENT: 'SHUTDOWN_EVENT',
    },
    SERVER_URL: process.env.SERVER_URL!,
    GLOBAL_API_PREFIX: 'api',
    HEALTH_CHECK_ROUTES_PREFIX: 'health-check',
  },
  DB: {
    CONNECTION_STRING: process.env.MONGODB_URI!,
    MONGO_CONNECT_TIMEOUT: 30000,
    MONGO_SERVER_SELECTION_TIMEOUT: 180000,
    MONGO_POOL_SIZE: 10,
  },
  QUEUE: {
    KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID!,
    KAFKA_BROKERS: process.env.KAFKA_BROKERS!.split(','),
    SCHEMA_REGISTRY_HOST: process.env.SCHEMA_REGISTRY_HOST!,
    IMAGE_PROCESSING_TOPIC_NAME: process.env.IMAGE_PROCESSING_TOPIC_NAME!,
    IMAGE_PROCESSING_TOPIC_PARTITIONS:
      process.env.IMAGE_PROCESSING_TOPIC_PARTITIONS!,
    IMAGE_PROCESSING_DLQ_TOPIC_NAME:
      process.env.IMAGE_PROCESSING_DLQ_TOPIC_NAME!,
    IMAGE_PROCESSING_DLQ_TOPIC_PARTITIONS:
      process.env.IMAGE_PROCESSING_DLQ_TOPIC_PARTITIONS!,
    IMAGE_PROCESSING_CONSUMER_GROUP_ID:
      process.env.IMAGE_PROCESSING_CONSUMER_GROUP_ID!,
  },
  IMAGE_PROCESSING: {
    FILE_UPLOAD_TOKEN: process.env.FILE_UPLOAD_TOKEN!,
    FILE_UPLOAD_BASE_URL: process.env.FILE_UPLOAD_BASE_URL!,
    FILE_UPLOAD_AUTHOR: process.env.FILE_UPLOAD_AUTHOR!,
    FILE_UPLOAD_EMAIL: process.env.FILE_UPLOAD_EMAIL!,
    FILE_UPLOAD_BRANCH: process.env.FILE_UPLOAD_BRANCH!,
  },
  FAILURES: {
    FILE_COUNT_LIMIT_EXCEEDED: {
      MESSAGE: 'File count limit exceeded',
      CODE: HTTP_RESPONSE_CODES.PAYLOAD_TOO_LARGE.CODE,
    },
    FILE_SIZE_LIMIT_EXCEEDED: {
      MESSAGE: 'File size limit exceeded',
      CODE: HTTP_RESPONSE_CODES.PAYLOAD_TOO_LARGE.CODE,
    },
    INVALID_MULTIPART_FIELD: {
      MESSAGE: 'Invalid multipart field',
      CODE: HTTP_RESPONSE_CODES.BAD_REQUEST.CODE,
    },
  },
  HEALTH_CHECK_ERRORS: {
    HEALTH_CHECK_ERROR: {
      NAME: 'ServiceUnavailableException',
      MESSAGE: 'Service is unavailable',
    },
    NO_SHUTDOWN_MODE: {
      NAME: 'ShutdownModeError',
      MESSAGE: 'Shutdown mode is enabled',
    },
    DB: {
      NAME: 'DbHealthCheckError',
      MESSAGE: 'DB is down',
    },
  },
  HEALTH_CHECKS: {
    NO_SHUTDOWN_MODE: 'no_shutdown_mode',
    DB: 'db_status',
    READINESS: 'readiness',
  },
} as const;
