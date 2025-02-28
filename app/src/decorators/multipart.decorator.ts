import { Readable, PassThrough, EventEmitter } from 'node:stream';
import { BusboyConfig, FileInfo, FieldInfo } from 'busboy';
import busboy = require('busboy');
import { Request } from 'express';
import {
  ExecutionContext,
  HttpException,
  createParamDecorator,
} from '@nestjs/common';
import { config } from 'src/constants';

export interface MultiPartFile {
  type: 'file';
  name: string;
  stream: Readable;
  info: FileInfo;
}

export interface MultiPartField {
  type: 'field';
  name: string;
  value: string;
  info: FieldInfo;
}

export type MultiPartData = MultiPartFile | MultiPartField;

export interface MultipartOptions {
  fileField?: string;
  fileFields?: string[];
  filesCountLimit?: number;
  fileSizeLimit?: number;
  fileSizeLimitQueryField?: string;
  config?: BusboyConfig;
}

export const Multipart = createParamDecorator<
  MultipartOptions,
  ExecutionContext
>(async (data, ctx) => {
  const req: Request = ctx.switchToHttp().getRequest();
  if (!req.headers['content-type']?.includes('multipart/form-data')) {
    return undefined;
  }

  if (!data.config) {
    data.config = {};
  }
  if (!data.config.limits) {
    data.config.limits = {};
  }

  if (data.fileSizeLimit) {
    data.config.limits.fileSize = data.fileSizeLimit;
  } else if (
    data.fileSizeLimitQueryField &&
    Number(req.query[data.fileSizeLimitQueryField])
  ) {
    data.config.limits.fileSize = Number(
      req.query[data.fileSizeLimitQueryField],
    );
  }

  return getMultipartData(req, data);
});

function getMultipartData(
  req: Request,
  data: MultipartOptions,
): AsyncGenerator<MultiPartData> {
  const stream = new PassThrough({ objectMode: true });
  const b = bb(req, data.config || {});
  let fileCount = 0;
  b.on('file', (name: string, s: Readable, info: FileInfo) => {
    fileCount++;
    if (data.filesCountLimit && fileCount > data.filesCountLimit)
      return b.emit(
        'error',
        new HttpException(
          `${config.FAILURES.FILE_COUNT_LIMIT_EXCEEDED.MESSAGE}. Maximum allowed files: ${data.filesCountLimit}`,
          config.FAILURES.FILE_COUNT_LIMIT_EXCEEDED.CODE,
        ),
      );

    if (
      (data.fileField && data.fileField !== name) ||
      (data.fileFields && !data.fileFields.includes(name))
    )
      return b.emit(
        'error',
        new HttpException(
          `${config.FAILURES.INVALID_MULTIPART_FIELD.MESSAGE}: ${name}`,
          config.FAILURES.INVALID_MULTIPART_FIELD.CODE,
        ),
      );

    s.on('limit', (d) => {
      return stream.emit(
        'error',
        new HttpException(
          `${config.FAILURES.FILE_SIZE_LIMIT_EXCEEDED.MESSAGE}: ${data.config?.limits?.fileSize}`,
          config.FAILURES.FILE_SIZE_LIMIT_EXCEEDED.CODE,
        ),
      );
    });

    stream.write({ name, stream: s, info, type: 'file' });
  });
  b.on('field', (name: string, value: string, info: FieldInfo) => {
    req.body[name] = value;
    stream.write({ name, value, info, type: 'field' });
  });
  b.on('finish', () => stream.end());
  b.on('error', (err) => {
    stream.emit('error', err);
  });
  return stream as unknown as AsyncGenerator<MultiPartData>;
}

function bb(req: Request, config: BusboyConfig): EventEmitter {
  const instance = busboy({ headers: req.headers, ...config });
  req.pipe(instance);
  return instance;
}
