import { HealthCheckResult } from '@nestjs/terminus';

export interface HealthCheckResponseDto {
  [key: string]: {
    status: 'up' | 'down';
    [optionalKeys: string]: any;
  };
}

export interface IHealthCheckService {
  liveness(): Promise<HealthCheckResult>;
  readiness(): Promise<HealthCheckResult>;
}
