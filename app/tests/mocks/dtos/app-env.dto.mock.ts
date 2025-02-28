import { IsEnum, IsNotEmpty, IsPort, IsString } from 'class-validator';

export class MockAppEnv {
  @IsEnum(['test'].reduce((acc, curr) => ({ ...acc, [curr]: curr }), {}))
  NODE_ENV: 'test';
  @IsString()
  @IsNotEmpty()
  APP_NAME: string;
  @IsPort()
  PORT: number;
}
