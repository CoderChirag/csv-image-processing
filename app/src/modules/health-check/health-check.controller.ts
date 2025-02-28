import { Controller, Get, Inject } from '@nestjs/common';
import { IHealthCheckService } from './interfaces/health-check.interface';
import { HEALTH_CHECK_PROVIDERS } from './constants/providers';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { config, SWAGGER } from 'src/constants';
import { HttpResponse } from 'src/dtos/http-response.dto';
import { HttpError } from 'src/dtos/http-error.dto';

@ApiTags(HEALTH_CHECK_PROVIDERS.API_TAG, SWAGGER.API_TAGS.INTERNAL)
@ApiServiceUnavailableResponse({
  type: HttpError,
  description: 'Service Unavailable',
})
@Controller(config.APP.HEALTH_CHECK_ROUTES_PREFIX)
export class HealthCheckController {
  constructor(
    @Inject(HEALTH_CHECK_PROVIDERS.HEALTH_CHECK_SERVICE)
    private readonly healthCheckService: IHealthCheckService,
  ) {}

  @ApiOperation({
    summary: 'Api for health check',
    description: `This api pings the database to check their health and accordingly gives the 
			status of health.`,
  })
  @ApiOkResponse({ type: HttpResponse, description: 'Liveness Success' })
  @Get('liveness')
  async liveness() {
    return this.healthCheckService.liveness();
  }

  @ApiOperation({
    summary: 'Api for health check',
    description: `This api checks for shutdown mode, and pings the database to check their health and accordingly gives the 
			status of health.`,
  })
  @ApiOkResponse({ type: HttpResponse, description: 'Readiness Success' })
  @Get('readiness')
  async readiness() {
    return this.healthCheckService.readiness();
  }
}
