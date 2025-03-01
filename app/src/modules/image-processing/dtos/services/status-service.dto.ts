import { RequestStatus } from 'src/models/request/request.schema';

export interface Status {
  status: RequestStatus;
  message: string;
}
