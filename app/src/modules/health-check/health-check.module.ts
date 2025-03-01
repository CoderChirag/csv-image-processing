import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthCheckController } from './health-check.controller';
import { HEALTH_CHECK_PROVIDERS } from './constants/providers';
import { HealthCheckService } from './health-check.service';
import { RepositoryModule } from 'src/services/repository-service/repository.module';

@Module({
  imports: [TerminusModule, RepositoryModule],
  controllers: [HealthCheckController],
  providers: [
    {
      provide: HEALTH_CHECK_PROVIDERS.HEALTH_CHECK_SERVICE,
      useClass: HealthCheckService,
    },
  ],
})
export class HealthCheckModule {}
