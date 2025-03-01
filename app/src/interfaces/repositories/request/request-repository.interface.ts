import { RequestStatusAndMessage } from 'src/dtos/repositories/request/request-repository.dto';
import { Product } from 'src/models/request/product.schema';
import { Request, RequestStatus } from 'src/models/request/request.schema';

export interface IRequestRepository {
  createRequest(
    request: Omit<Request, '_id' | 'createdAt' | 'updatedAt' | 'products'> & {
      products: Record<string, Omit<Product, '_id'>>;
    },
  ): Promise<Request>;

  updateStatus(
    requestId: string,
    status: RequestStatus,
    message: string,
  ): Promise<Request>;

  getStatus(requestId: string): Promise<RequestStatusAndMessage>;

  updateRequest(
    requestId: string,
    request: Partial<Omit<Request, 'products'>> & {
      products?: Record<string, Omit<Product, '_id'>>;
    },
  ): Promise<Request>;
}
