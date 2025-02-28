import { IsEnum, IsNotEmpty, IsPort, IsString, IsUrl } from 'class-validator';

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
  APM_SERVICE_NAME: string;

  @IsUrl()
  @IsNotEmpty()
  SERVER_URL: string;

  @IsString()
  @IsNotEmpty()
  MONGODB_URI: string;
}
