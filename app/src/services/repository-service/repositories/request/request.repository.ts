import { MongoService } from '@app/db-service';
import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { providers } from 'src/constants';
import { IRequestRepository } from 'src/interfaces/repositories/request/request-repository.interface';
import { DB_SCHEMAS } from 'src/models';
import { Request, RequestStatus } from 'src/models/request/request.schema';

@Injectable()
export class RequestRepository implements IRequestRepository {
  private readonly Request: Model<Request>;
  constructor(
    @Inject(providers.SERVICES.DB)
    private readonly dbService: MongoService<typeof DB_SCHEMAS>,
  ) {
    this.Request = this.dbService.models.Request;
  }

  async createRequest(
    request: Omit<Request, '_id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Request> {
    return await this.Request.create(request);
  }

  async updateStatus(
    requestId: string,
    status: RequestStatus,
    message: string,
  ): Promise<Request | null> {
    return await this.Request.findOneAndUpdate(
      { requestId },
      { status, message },
    );
  }
}
