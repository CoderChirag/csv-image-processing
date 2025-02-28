import { MongoService } from '@app/db-service';
import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { providers } from 'src/constants';
import { DB_SCHEMAS } from 'src/models';
import { Request } from 'src/models/request/request.schema';

@Injectable()
export class RequestRepository {
  private readonly Request: Model<Request>;
  constructor(
    @Inject(providers.SERVICES.DB)
    private readonly dbService: MongoService<typeof DB_SCHEMAS>,
  ) {
    this.Request = this.dbService.models.Request;
  }
}
