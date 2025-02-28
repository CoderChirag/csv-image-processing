import { Schema } from 'mongoose';
import { Product, ProductSchema } from './product.schema';

export enum RequestStatus {
  ACCEPTED = 'Accepted',
  PROCESSING = 'Processing',
  SUCCEEDED = 'Succeeded',
  FAILED = 'Failed',
}

export interface Request {
  _id: string;
  requestId: string;
  status: RequestStatus;
  message: string;
  webhookUrl: string;
  products: Product[];
  createdAt: Date;
  updatedAt: Date;
}

export const RequestSchema = new Schema<Request>({
  requestId: { type: String, required: true, unique: true },
  status: { type: String, required: true, enum: Object.values(RequestStatus) },
  message: { type: String, required: true },
  webhookUrl: { type: String, required: true },
  products: { type: [ProductSchema], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
