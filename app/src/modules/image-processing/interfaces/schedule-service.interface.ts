import { ImageProcessingSchedulingProducts } from '../dtos/services/scheduling-service.dto';

export interface ISchedulingService {
  scheduleImageProcessing(
    products: ImageProcessingSchedulingProducts,
    webhookUrl: string,
  ): Promise<string>;
}
