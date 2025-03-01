import { Inject, Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthCheckResult,
  HealthIndicator,
  HealthCheckService as TerminusHealthCheckService,
} from '@nestjs/terminus';
import {
  HealthCheckResponseDto,
  IHealthCheckService,
} from './interfaces/health-check.interface';
import { OnEvent } from '@nestjs/event-emitter';
import { config, providers } from 'src/constants';
import { IRepositoryService } from 'src/interfaces/repositories/services/repository-service.interface';

@Injectable()
export class HealthCheckService
  extends HealthIndicator
  implements IHealthCheckService
{
  private shutdownMode = false;

  constructor(
    private readonly healthStatusService: TerminusHealthCheckService,
    @Inject(providers.SERVICES.REPOSITORY)
    private readonly repositoryService: IRepositoryService,
  ) {
    super();
  }

  async liveness(): Promise<HealthCheckResult> {
    const dbStatuses = await this.getDbStatuses();
    return await this.healthStatusService.check(
      dbStatuses.map((status) => status),
    );
  }

  async readiness(): Promise<HealthCheckResult> {
    const dbStatuses = await this.getDbStatuses();
    return await this.healthStatusService.check([
      ...dbStatuses.map((status) => status),
      () => this.getShutdownModeStatus(),
    ]);
  }

  private async getDbStatuses(): Promise<(() => HealthCheckResponseDto)[]> {
    const connectionStatus = await this.repositoryService.connectionStatus();

    return [
      () => {
        if (connectionStatus.db_status !== 'success') {
          throw new HealthCheckError(
            config.HEALTH_CHECKS.DB,
            this.getStatus(config.HEALTH_CHECKS.DB, false),
          );
        }

        return this.getStatus(
          config.HEALTH_CHECKS.DB,
          connectionStatus.db_status === 'success',
        );
      },
    ];
  }

  private async getShutdownModeStatus(): Promise<HealthCheckResponseDto> {
    if (this.shutdownMode) {
      throw new HealthCheckError(
        config.HEALTH_CHECKS.NO_SHUTDOWN_MODE,
        this.getStatus(config.HEALTH_CHECKS.NO_SHUTDOWN_MODE, false),
      );
    }
    return this.getStatus(config.HEALTH_CHECKS.READINESS, true);
  }

  @OnEvent(config.APP.EVENTS.SHUTDOWN_EVENT)
  async onShutdownEvent() {
    this.shutdownMode = true;
  }
}
