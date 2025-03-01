import { Product } from 'src/models/request/product.schema';
import { Request } from 'src/models/request/request.schema';

export interface IRequestRepository {
  createRequest(
    request: Omit<Request, '_id' | 'createdAt' | 'updatedAt' | 'products'> & {
      products: Record<string, Omit<Product, '_id'>>;
    },
  ): Promise<Request>;
}
