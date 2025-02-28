import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Logger } from 'nestjs-pino';
import { map } from 'rxjs';
import { config } from 'src/constants';

@Injectable()
export class ReqResInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: Logger) {}
  intercept(context: ExecutionContext, next: CallHandler) {
    const req: Request = context.switchToHttp().getRequest();
    if (
      !req.url.startsWith(
        `/${config.APP.GLOBAL_API_PREFIX}/${config.APP.HEALTH_CHECK_ROUTES_PREFIX}`,
      )
    )
      this.loggerService.log({
        msg: 'Request received',
      });
    return next.handle().pipe(
      map((data) => {
        return {
          success: true,
          data,
        };
      }),
    );
  }
}
