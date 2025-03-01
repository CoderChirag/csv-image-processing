import { Status } from '../dtos/services/status-service.dto';

export interface IStatusService {
  getStatus(requestId: string): Promise<Status>;
}
