export type HttpMethod =
  | 'get'
  | 'GET'
  | 'delete'
  | 'DELETE'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH'
  | 'purge'
  | 'PURGE'
  | 'link'
  | 'LINK'
  | 'unlink'
  | 'UNLINK';

export interface HttpBasicAuth {
  username: string;
  password: string;
}

export type HttpResponseType =
  | 'arraybuffer'
  | 'blob'
  | 'document'
  | 'json'
  | 'text'
  | 'stream';

export interface HttpRequestConfig<T = any> {
  url?: string;
  method?: HttpMethod | string;
  baseURL?: string;
  headers?: Record<string, string | number | boolean>;
  params?: Record<string, string | number | boolean>;
  data?: T;
  timeout?: number;
  auth?: HttpBasicAuth;
  responseType?: HttpResponseType;
  onUploadProgress?: (progressEvent: any) => void;
  onDownloadProgress?: (progressEvent: any) => void;
  maxContentLength?: number;
  maxBodyLength?: number;
  maxRedirects?: number;
  httpAgent?: any;
  httpsAgent?: any;
  signal?: AbortSignal;
}

export interface HttpResponse<T = any, K = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string | number | boolean>;
  config: HttpRequestConfig<K>;
  request?: any;
}

export interface HttpClient {
  request<T = any, K = any>(
    config: HttpRequestConfig<K>,
  ): Promise<HttpResponse<T, K>>;
  get<T = any, K = any>(
    url: string,
    config?: HttpRequestConfig<K>,
  ): Promise<HttpResponse<T, K>>;
  delete<T = any, K = any>(
    url: string,
    config?: HttpRequestConfig<K>,
  ): Promise<HttpResponse<T, K>>;
  head<T = any, K = any>(
    url: string,
    config?: HttpRequestConfig<K>,
  ): Promise<HttpResponse<T, K>>;
  options<T = any, K = any>(
    url: string,
    config?: HttpRequestConfig<K>,
  ): Promise<HttpResponse<T, K>>;
  post<T = any, K = any>(
    url: string,
    data?: K,
    config?: HttpRequestConfig<K>,
  ): Promise<HttpResponse<T, K>>;
  put<T = any, K = any>(
    url: string,
    data?: K,
    config?: HttpRequestConfig<K>,
  ): Promise<HttpResponse<T, K>>;
  patch<T = any, K = any>(
    url: string,
    data?: K,
    config?: HttpRequestConfig<K>,
  ): Promise<HttpResponse<T, K>>;
}

export interface HttpClientError<T = any, K = any> {
  config: HttpRequestConfig<K>;
  code?: string;
  request?: any;
  response?: HttpResponse<T>;
  status?: string;
}

export interface IHttpClientService {
  get client(): HttpClient;

  addRequestInterceptor<T>(
    onFulfilled?: (
      value: HttpRequestConfig<T>,
    ) => HttpRequestConfig<T> | Promise<HttpRequestConfig<T>>,
  ): number;
  addResponseInterceptor<T>(
    onFulfilled?: (
      value: HttpResponse<T>,
    ) => HttpResponse<T> | Promise<HttpResponse<T>>,
    onRejected?: (error: HttpClientError<T>) => never,
  ): number;

  ejectRequestInterceptor(id: number): void;
  ejectResponseInterceptor(id: number): void;

  clearRequestInterceptors(): void;
  clearResponseInterceptors(): void;

  isHttpClientError<T>(err: unknown): err is HttpClientError<T>;
}
