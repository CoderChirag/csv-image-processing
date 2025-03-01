import { MongoService } from '@app/db-service';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { providers } from 'src/constants';
import { RequestStatusAndMessage } from 'src/dtos/repositories/request/request-repository.dto';
import { IRequestRepository } from 'src/interfaces/repositories/request/request-repository.interface';
import { DB_SCHEMAS } from 'src/models';
import { Request, RequestStatus } from 'src/models/request/request.schema';
import { REQUEST_REPOSITORY_FAILURES } from './contants/config';

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
  ): Promise<Request> {
    const request = await this.Request.findOneAndUpdate(
      { requestId },
      { status, message },
    );
    if (!request)
      throw new HttpException(
        REQUEST_REPOSITORY_FAILURES.REQUEST_NOT_FOUND.MESSAGE,
        REQUEST_REPOSITORY_FAILURES.REQUEST_NOT_FOUND.CODE,
      );

    return request;
  }

  async getStatus(requestId: string): Promise<RequestStatusAndMessage> {
    const request = await this.Request.findOne({ requestId });
    if (!request)
      throw new HttpException(
        REQUEST_REPOSITORY_FAILURES.REQUEST_NOT_FOUND.MESSAGE,
        REQUEST_REPOSITORY_FAILURES.REQUEST_NOT_FOUND.CODE,
      );

    return {
      status: request.status,
      message: request.message,
    };
  }

  async updateRequest(
    requestId: string,
    request: Partial<Request>,
  ): Promise<Request> {
    const updatedRequest = await this.Request.findOneAndUpdate(
      { requestId },
      request,
    );
    if (!updatedRequest)
      throw new HttpException(
        REQUEST_REPOSITORY_FAILURES.REQUEST_NOT_FOUND.MESSAGE,
        REQUEST_REPOSITORY_FAILURES.REQUEST_NOT_FOUND.CODE,
      );

    return updatedRequest;
  }
}
