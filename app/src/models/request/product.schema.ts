import { Schema } from 'mongoose';

export interface Product {
  _id: string;
  inputImages: string[];
  outputImages: string[];
}

export const ProductSchema = new Schema<Product>({
  inputImages: { type: [String], required: true, default: [] },
  outputImages: { type: [String], required: true, default: [] },
});
