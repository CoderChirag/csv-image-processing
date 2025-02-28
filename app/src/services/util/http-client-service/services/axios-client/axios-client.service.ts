import { Injectable } from '@nestjs/common';
import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosRequestConfig,
  AxiosError,
} from 'axios';
import { IHttpClientService } from 'src/interfaces/util/http-client-service/http-client-service.interface';
import { ILogger } from 'src/interfaces/util/logger/logger.interface';

/** Boundary for axios */
@Injectable()
export class AxiosClientService implements IHttpClientService {
  private readonly _client: AxiosInstance;

  private requestInterceptors: number[] = [];
  private responseInterceptors: number[] = [];

  private readonly requestLoggingInterceptorId: number | undefined;
  private readonly responseLoggingInterceptorId: number | undefined;

  constructor(
    config: AxiosRequestConfig,
    private readonly successResponseLogging: boolean = false,
    private readonly logger: ILogger,
  ) {
    this._client = axios.create(config);
    this.requestLoggingInterceptorId = this.addRequestLoggingInterceptor();
    this.responseLoggingInterceptorId = this.addResponseLoggingInterceptor(
      successResponseLogging,
    );
  }

  get client() {
    return this._client;
  }

  addRequestInterceptor<T>(
    onFulfilled?: (
      value: AxiosRequestConfig<T>,
    ) => AxiosRequestConfig<T> | Promise<AxiosRequestConfig<T>>,
  ): number {
    const interceptorId = this._client.interceptors.request.use(onFulfilled);
    this.requestInterceptors.push(interceptorId);
    return interceptorId;
  }

  addResponseInterceptor<T>(
    onFulfilled?: (
      value: AxiosResponse<T>,
    ) => AxiosResponse<T> | Promise<AxiosResponse<T>>,
    onRejected?: (error: AxiosError<T>) => never,
  ): number {
    const interceptorId = this._client.interceptors.response.use(
      onFulfilled,
      onRejected,
    );
    this.responseInterceptors.push(interceptorId);
    return interceptorId;
  }

  ejectRequestInterceptor(interceptorId: number) {
    if (interceptorId === this.requestLoggingInterceptorId) return;
    this._client.interceptors.request.eject(interceptorId);
    this.requestInterceptors = this.requestInterceptors.filter(
      (id) => id !== interceptorId,
    );
  }

  ejectResponseInterceptor(interceptorId: number) {
    if (interceptorId === this.responseLoggingInterceptorId) return;
    this._client.interceptors.response.eject(interceptorId);
    this.responseInterceptors = this.responseInterceptors.filter(
      (id) => id !== interceptorId,
    );
  }

  clearRequestInterceptors() {
    this.requestInterceptors.forEach((id) => this.ejectRequestInterceptor(id));
  }

  clearResponseInterceptors() {
    this.responseInterceptors.forEach((id) =>
      this.ejectResponseInterceptor(id),
    );
  }

  isHttpClientError<T>(err: unknown): err is AxiosError<T> {
    return axios.isAxiosError(err);
  }

  private addRequestLoggingInterceptor() {
    return this.addRequestInterceptor((config) => {
      this.logger.log(
        `Sending AXIOS Request([${config.method?.toUpperCase()}] ${
          config.baseURL ?? ''
        }${config.url ?? ''})`,
        {
          method: config.method,
          baseURL: config.baseURL,
          url: config.url,
          params: config.params,
        },
      );
      return config;
    });
  }

  private addResponseLoggingInterceptor(successResponseLogging: boolean) {
    return this.addResponseInterceptor(
      (res) => {
        this.logger.log(
          `Received AXIOS Response([${res.config.method?.toUpperCase()}] ${
            res.config.baseURL ?? ''
          }${res.config.url ?? ''}): ${JSON.stringify({
            status: res.status,
          })}`,
          {
            status: res.status,
            data: successResponseLogging ? res.data : undefined,
          },
        );
        return res;
      },
      (error) => {
        if (error.config.responseType !== 'stream')
          this.logger.error(
            `Received Axios Error([${error.config.method?.toUpperCase()}] ${
              error.config.baseURL ?? ''
            }${error.config.url ?? ''}): ${JSON.stringify(
              error?.response?.data || {},
            )}`,
            error,
          );
        else
          this.logger.error(
            `Received Axios Error([${error.config.method?.toUpperCase()}] ${
              error.config.baseURL ?? ''
            }${error.config.url ?? ''})`,
            error,
          );
        throw error;
      },
    );
  }
}
