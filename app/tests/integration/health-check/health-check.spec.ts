import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { HealthCheckService } from 'src/modules/health-check/health-check.service';
import { MockDbService } from 'tests/mocks/lib/db-service/db.service.mock';
import {
  closeTestingApp,
  createTestingApp,
} from 'tests/mocks/app/app.module.mock';
import { HEALTH_CHECK_PROVIDERS } from 'src/modules/health-check/constants/providers';

describe('Health Check Module', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    await closeTestingApp(app);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('[GET] /api/health-check/liveness', () => {
    it('should return 200 when the database is connected', async () => {
      MockDbService.isConnected.mockResolvedValue(true);
      const res = await request(app.getHttpServer()).get(
        '/api/health-check/liveness',
      );
      expect(res.statusCode).toBe(200);
    });

    it('should return 503 when the database is not connected', async () => {
      MockDbService.isConnected.mockResolvedValue(false);
      const res = await request(app.getHttpServer()).get(
        '/api/health-check/liveness',
      );
      expect(res.statusCode).toBe(503);
    });
  });

  describe('[GET] /api/health-check/readiness', () => {
    it('should return 200 when the database is connected', async () => {
      MockDbService.isConnected.mockResolvedValue(true);
      const res = await request(app.getHttpServer()).get(
        '/api/health-check/readiness',
      );
      expect(res.statusCode).toBe(200);
    });

    it('should return 503 when the database is not connected', async () => {
      MockDbService.isConnected.mockResolvedValue(false);
      const res = await request(app.getHttpServer()).get(
        '/api/health-check/readiness',
      );
      expect(res.statusCode).toBe(503);
    });

    it('should return 503 when the shutdown mode is enabled', async () => {
      const healthCheckService: HealthCheckService = app.get(
        HEALTH_CHECK_PROVIDERS.HEALTH_CHECK_SERVICE,
      );
      healthCheckService.onShutdownEvent();
      MockDbService.isConnected.mockResolvedValue(true);
      const res = await request(app.getHttpServer()).get(
        '/api/health-check/readiness',
      );
      expect(res.statusCode).toBe(503);
    });
  });
});
