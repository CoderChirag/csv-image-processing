import { PassThrough, Readable } from 'node:stream';
import { Request } from 'express';
import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { config } from 'src/constants';

export interface FileDataOptions {
  configField?: string;
}

export class FileDataConfig {
  fileSizeLimit?: number;
}

export interface FileData {
  stream: Readable;
  mimeType: string;
}

export const File = createParamDecorator<FileDataOptions, ExecutionContext>(
  (config, ctx) => {
    const req: Request = ctx.switchToHttp().getRequest();
    return getFileData(req, config?.configField ? req[config.configField] : {});
  },
);

function getFileData(req: Request, conf: FileDataConfig): FileData {
  const stream = new PassThrough({ objectMode: true });
  const fileSizeLimit = conf.fileSizeLimit;
  let len = 0;
  const dataListener = (chunk: Buffer) => {
    len += chunk.length;
    if (fileSizeLimit && len > fileSizeLimit) {
      stream.emit(
        'error',
        new HttpException(
          config.FAILURES.FILE_SIZE_LIMIT_EXCEEDED.MESSAGE,
          config.FAILURES.FILE_SIZE_LIMIT_EXCEEDED.CODE,
        ),
      );
      stream.end();
      req.off('data', dataListener);
      req.off('end', endListener);
      return;
    }
    stream.write(chunk);
  };
  const endListener = () => {
    stream.end();
  };

  req.on('data', dataListener);
  req.on('end', endListener);
  return {
    stream,
    mimeType: req.headers['content-type'] ?? 'application/octet-stream',
  };
}
