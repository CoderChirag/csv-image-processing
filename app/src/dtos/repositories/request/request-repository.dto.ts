import { RequestStatus } from 'src/models/request/request.schema';

export interface RequestStatusAndMessage {
  status: RequestStatus;
  message: string;
}
