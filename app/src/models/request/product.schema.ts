import { Schema } from 'mongoose';

export interface Product {
  _id: string;
  name: string;
  inputImageUrls: string[];
  outputImageUrls?: string[];
}

export const ProductSchema = new Schema<Product>({
  name: { type: String, required: true },
  inputImageUrls: { type: [String], required: true, default: [] },
  outputImageUrls: { type: [String], default: [] },
});
