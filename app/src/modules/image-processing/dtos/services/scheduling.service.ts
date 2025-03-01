export interface ImageProcessingSchedulingProduct {
  name: string;
  inputImageUrls: string[];
}

export type ImageProcessingSchedulingProducts = Record<
  string,
  ImageProcessingSchedulingProduct
>;
