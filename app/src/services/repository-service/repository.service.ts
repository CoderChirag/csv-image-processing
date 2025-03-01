import { MongoService } from '@app/db-service';
import { Inject, Injectable } from '@nestjs/common';
import { providers } from 'src/constants';
import { ConnectionStatus } from 'src/dtos/repositories/services/repository-service.dto';
import { IRepositoryService } from 'src/interfaces/repositories/services/repository-service.interface';
import { DB_SCHEMAS } from 'src/models';

@Injectable()
export class RepositoryService implements IRepositoryService {
  constructor(
    @Inject(providers.SERVICES.DB)
    private readonly dbService: MongoService<typeof DB_SCHEMAS>,
  ) {}

  async connectionStatus(): Promise<ConnectionStatus> {
    const dbStatus = await this.dbService.isConnected();
    return {
      db_status: dbStatus ? 'success' : 'failure',
    };
  }
}
