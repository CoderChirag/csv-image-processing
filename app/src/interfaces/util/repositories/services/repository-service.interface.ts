import { ConnectionStatus } from 'src/dtos/util/repositories/services/repository-service.dto';

export interface IRepositoryService {
  connectionStatus(): Promise<ConnectionStatus>;
}
