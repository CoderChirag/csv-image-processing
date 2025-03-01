import { Inject, Injectable } from '@nestjs/common';
import { providers } from 'src/constants';
import { IRequestRepository } from 'src/interfaces/repositories/request/request-repository.interface';
import { IStatusService } from '../interfaces/status-service.interface';
import { Status } from '../dtos/services/status-service.dto';

@Injectable()
export class StatusService implements IStatusService {
  constructor(
    @Inject(providers.REPOSITORIES.REQUEST)
    private readonly request: IRequestRepository,
  ) {}

  async getStatus(requestId: string): Promise<Status> {
    return await this.request.getStatus(requestId);
  }
}
