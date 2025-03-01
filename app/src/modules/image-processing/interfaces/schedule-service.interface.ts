import { ImageProcessingSchedulingProducts } from '../dtos/services/scheduling.service';

export interface ISchedulingService {
  scheduleImageProcessing(
    products: ImageProcessingSchedulingProducts,
    webhookUrl: string,
  ): Promise<string>;
}
