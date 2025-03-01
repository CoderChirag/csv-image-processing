import { tmpdir } from 'node:os';
import { mkdir, readFile, rmdir, unlink } from 'node:fs/promises';
import { IncomingMessage } from 'node:http';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { basename, dirname, join, resolve } from 'node:path';
import mime from 'mime';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { Inject, Injectable } from '@nestjs/common';
import { config, providers } from 'src/constants';
import {
  ImageProcessingProduct,
  ImageProcessingRequest,
} from 'src/dtos/entities/messaging/image-processing.messaging-entity.dto';
import {
  HttpClient,
  IHttpClientService,
} from 'src/interfaces/http-client-service/http-client-service.interface';
import { ILogger } from 'src/interfaces/logger/logger.interface';
import { IImageProcessor } from 'src/interfaces/modules/image-processing/image-processor.interface';
import { IRequestRepository } from 'src/interfaces/repositories/request/request-repository.interface';
import {
  Request,
  RequestStatus,
  RequestStatusMessage,
} from 'src/models/request/request.schema';
import { IMAGE_PROCESSING_CONFIG } from '../constants/config';
import {
  FileUploadReqBody,
  FileUploadResponse,
} from '../dtos/processors/image-processor.dto';
import { ICSVEntity } from 'src/interfaces/entities/csv/csv.interface';

@Injectable()
export class ImageProcessor implements IImageProcessor {
  private readonly http: HttpClient;
  constructor(
    @Inject(providers.SERVICES.LOGGER)
    private readonly logger: ILogger,
    @Inject(providers.REPOSITORIES.REQUEST)
    private readonly request: IRequestRepository,
    @Inject(IMAGE_PROCESSING_CONFIG.PROVIDERS.HTTP_CLIENT)
    private readonly httpService: IHttpClientService,
    @Inject(providers.ENTITIES.CSV)
    private readonly csvEntity: ICSVEntity,
  ) {
    this.http = httpService.client;
  }
  async process(request: ImageProcessingRequest): Promise<void> {
    try {
      this.logger.log(
        `Processing for request ${request.requestId}`,
        request.requestId,
      );
      await this.updateRequestProcessingStatus(request.requestId); // Updating Status to Processing in DB

      const processed: ImageProcessingRequest & {
        products: Record<
          string,
          ImageProcessingProduct & { outputImageUrls: string[] }
        >;
      } = {
        ...request,
        products: {},
      };
      for (const [productName, product] of Object.entries(request.products)) {
        processed.products[productName] = {
          ...product,
          outputImageUrls: [],
        };
        for (const url of product.inputImageUrls) {
          this.logger.log(`Processing image ${url}`, {
            product: product.name,
            requestId: request.requestId,
          });
          try {
            const fileUrl = await this.processImage(
              request.requestId,
              productName,
              url,
            );
            processed.products[productName].outputImageUrls.push(fileUrl);
          } catch (e) {
            this.handleImageProcessingError(
              request.requestId,
              e,
              productName,
              url,
            );
          }
          this.logger.log(`Processing completed for image ${url}`, {
            product: product.name,
            requestId: request.requestId,
          });
        }
      }

      await this.deleteDirectory(
        resolve(join(tmpdir(), 'image-processing', request.requestId)),
      ); // Cleaning up the temporary directory
      await this.updateRequestSuccessStatus(
        request.requestId,
        processed.products,
      ); // Updating Status to Succeeded in DB
      const csv = await this.csvEntity.buildCSV(processed.products); // Building CSV
      await this.callWebhook(request.requestId, csv, request.webhookUrl); // Calling Webhook
      this.logger.log(
        `Processing completed for request ${request.requestId}`,
        request.requestId,
      );
    } catch (e) {
      await this.handleError(request.requestId, e);
    }
  }

  private async updateRequestProcessingStatus(
    requestId: string,
  ): Promise<Request> {
    return await this.request.updateStatus(
      requestId,
      RequestStatus.PROCESSING,
      RequestStatusMessage.PROCESSING,
    );
  }

  private async updateRequestSuccessStatus(
    requestId: string,
    products: Record<
      string,
      ImageProcessingProduct & { outputImageUrls: string[] }
    >,
  ): Promise<Request> {
    return await this.request.updateRequest(requestId, {
      status: RequestStatus.SUCCEEDED,
      message: RequestStatusMessage.SUCCEEDED,
      products,
    });
  }

  async processImage(
    requestId: string,
    productName: string,
    url: string,
  ): Promise<string> {
    const filePath = await this.downloadImage(requestId, url);
    const outputFilePath = await this.convertImageQuality(filePath);
    await this.deleteFile(filePath);
    const outputUrl = await this.uploadFile(
      requestId,
      productName,
      url,
      outputFilePath,
    );
    await this.deleteFile(outputFilePath);
    return outputUrl;
  }

  private async downloadImage(requestId: string, url: string): Promise<string> {
    // [Memory Optimization]: Downloading & Streaming the file to temporary directory instead of storing in buffer, for further processing
    const { data } = await this.http.get<IncomingMessage>(url, {
      responseType: 'stream',
    });
    const dirPath = resolve(join(tmpdir(), 'image-processing', requestId));
    await mkdir(dirPath, { recursive: true });
    const filePath = join(
      dirPath,
      this.getFileName(
        url,
        data.headers?.['content-type'] ?? 'application/octet-stream',
      ),
    );
    const writeStream = createWriteStream(filePath);
    await pipeline(data, writeStream);
    return filePath;
  }

  private getFileName(url: string, contentType: string): string {
    const fileName = basename(url).split('.')[0];
    const fileExtension = mime.extension(contentType) ?? 'bin';
    return `${uuidv4()}.${fileExtension}`;
  }

  private async convertImageQuality(filePath: string): Promise<string> {
    try {
      const image = sharp(filePath);
      const metadata = await image.metadata(); // Getting Image Format
      if (!metadata.format) throw new Error(`Cannot determine image format.`);
      const outputDirPath = resolve(join(dirname(filePath), 'processed'));
      let outputFilePath = resolve(
        join(
          outputDirPath,
          `${basename(filePath).split('.').slice(0, -1)}.${metadata.format}`,
        ),
      );
      await mkdir(outputDirPath, { recursive: true });
      if (image[metadata.format])
        await image[metadata.format]({ quality: 50 }).toFile(outputFilePath);
      else {
        outputFilePath = `${outputFilePath.split('.').slice(0, -1)}.png`;
        await image.toFormat('png', { quality: 50 }).toFile(outputFilePath);
      }
      return outputFilePath;
    } catch (e: any) {
      throw new Error(`Failed to convert image quality: ${e?.message ?? e}`);
    }
  }

  private async uploadFile(
    requestId: string,
    productName: string,
    imageUrl: string,
    filePath: string,
  ): Promise<string> {
    // As Github don't support native file streaming, we need to load the entire file in memory here. Can be optimized using git LFS or git cli later.`
    const file = await readFile(filePath);
    const b64Content = file.toString('base64');
    const { data } = await this.http.put<FileUploadResponse, FileUploadReqBody>(
      `${config.IMAGE_PROCESSING.FILE_UPLOAD_BASE_URL}/${requestId}/${productName}/${basename(filePath)}`,
      {
        message: `Uploading file ${basename(filePath)}\nProduct: ${productName}\nImage URL: ${imageUrl}`,
        committer: {
          name: config.IMAGE_PROCESSING.FILE_UPLOAD_AUTHOR,
          email: config.IMAGE_PROCESSING.FILE_UPLOAD_EMAIL,
        },
        branch: config.IMAGE_PROCESSING.FILE_UPLOAD_BRANCH,
        content: b64Content,
      },
      {
        headers: {
          Authorization: `Bearer ${config.IMAGE_PROCESSING.FILE_UPLOAD_TOKEN}`,
        },
      },
    );
    return data.content.download_url;
  }

  private async deleteFile(filePath: string): Promise<void> {
    await unlink(filePath);
  }

  private async deleteDirectory(dirPath: string): Promise<void> {
    await rmdir(dirPath, { recursive: true });
  }

  private async callWebhook(
    requestId: string,
    csv: string,
    webhookUrl: string,
  ): Promise<void> {
    console.log(webhookUrl, 'Webhook URL');
    await this.http.post<unknown, string>(webhookUrl, csv, {
      headers: {
        'Content-Type': 'text/csv',
        'X-Request-Id': requestId,
      },
    });
  }

  private handleImageProcessingError(
    requestId: string,
    error: any,
    productName: string,
    url: string,
  ) {
    const msg = `Processing failed for product ${productName}, image ${url}: ${error?.response?.data?.message ?? error?.response?.error ?? error?.response?.message ?? error?.message ?? error}`;
    throw new Error(msg);
  }

  private async handleError(requestId: string, error: unknown) {
    const msg: string =
      error instanceof Error
        ? `${RequestStatusMessage.FAILED}: ${error.message}`
        : `${RequestStatusMessage.FAILED}: ${error}`;
    await this.deleteDirectory(
      resolve(join(tmpdir(), 'image-processing', requestId)),
    ); // Cleaning up the temporary directory
    this.logger.error(
      `Processing failed for request ${requestId}: ${msg}`,
      requestId,
    );
    await this.request.updateStatus(requestId, RequestStatus.FAILED, msg); // Updating Status to Failed in DB
  }
}
