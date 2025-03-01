import { ConnectionStatus } from 'src/dtos/repositories/services/repository-service.dto';

export interface IRepositoryService {
  connectionStatus(): Promise<ConnectionStatus>;
}
