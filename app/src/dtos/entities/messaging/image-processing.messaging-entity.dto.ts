export interface ImageProcessingProduct {
  name: string;
  inputImageUrls: string[];
}

export type ImageProcessingProducts = Record<string, ImageProcessingProduct>;

export interface ImageProcessingRequest {
  requestId: string;
  webhookUrl: string;
  products: ImageProcessingProducts;
}

export type ImageProcessingHandler = (
  msg: ImageProcessingRequest,
) => Promise<void>;
