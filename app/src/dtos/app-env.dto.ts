import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPort,
  IsString,
  IsUrl,
} from 'class-validator';

export class AppEnv {
  @IsEnum(
    ['local', 'development', 'staging', 'production'].reduce(
      (acc, curr) => ({ ...acc, [curr]: curr }),
      {},
    ),
  )
  NODE_ENV: 'local' | 'development' | 'staging' | 'production';
  @IsString()
  @IsNotEmpty()
  APP_NAME: string;
  @IsPort()
  PORT: number;

  @IsUrl()
  APM_BASE_URI: string;
  @IsString()
  @IsNotEmpty()
  APM_API_KEY: string;
  @IsString()
  @IsNotEmpty()
  APM_SERVICE_NAME: string;

  @IsUrl()
  @IsNotEmpty()
  SERVER_URL: string;

  @IsString()
  @IsNotEmpty()
  MONGODB_URI: string;

  @IsString()
  @IsNotEmpty()
  KAFKA_CLIENT_ID: string;
  @IsString()
  @IsNotEmpty()
  KAFKA_BROKERS: string;
  @IsString()
  @IsNotEmpty()
  SCHEMA_REGISTRY_HOST: string;

  @IsString()
  @IsNotEmpty()
  IMAGE_PROCESSING_TOPIC_NAME: string;
  @IsNumber()
  @IsNotEmpty()
  IMAGE_PROCESSING_TOPIC_PARTITIONS: number;
  @IsString()
  @IsNotEmpty()
  IMAGE_PROCESSING_DLQ_TOPIC_NAME: string;
  @IsNumber()
  @IsNotEmpty()
  IMAGE_PROCESSING_DLQ_TOPIC_PARTITIONS: number;
  @IsString()
  @IsNotEmpty()
  IMAGE_PROCESSING_CONSUMER_GROUP_ID: string;

  @IsString()
  @IsNotEmpty()
  FILE_UPLOAD_TOKEN: string;
  @IsString()
  @IsNotEmpty()
  FILE_UPLOAD_BASE_URL: string;
  @IsString()
  @IsNotEmpty()
  FILE_UPLOAD_AUTHOR: string;
  @IsString()
  @IsNotEmpty()
  FILE_UPLOAD_EMAIL: string;
  @IsString()
  @IsNotEmpty()
  FILE_UPLOAD_BRANCH: string;
}
