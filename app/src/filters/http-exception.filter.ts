import apm from 'elastic-apm-node';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { config, HTTP_RESPONSE_CODES } from 'src/constants';
import { HttpError } from 'src/dtos/http-error.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    let error: HttpError;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception?.status ?? HTTP_RESPONSE_CODES.INTERNAL_SERVER_ERROR.CODE;

    if (
      exception?.name === config.HEALTH_CHECK_ERRORS.HEALTH_CHECK_ERROR.NAME
    ) {
      error = healthCheckErrorRespConstructor(exception, status);
    } else {
      error = errorCodeRespConstructor(exception, status);
      apm.captureError(exception);
    }

    apm.logger.error(error);
    response.status(status).json(error);
  }
}

function errorCodeRespConstructor(error: any, status: number): HttpError {
  const response = new HttpError();
  const statusMessage = Object.values(HTTP_RESPONSE_CODES).find(
    (code) => code.CODE == status,
  );
  response.success = false;
  response.error = {
    message:
      error?.message ??
      error?.response?.error ??
      statusMessage ??
      HTTP_RESPONSE_CODES.INTERNAL_SERVER_ERROR.MESSAGE,
    ...(error?.response?.message ? { details: error?.response?.message } : {}),
  };

  return response;
}

function healthCheckErrorRespConstructor(
  error: any,
  status: number,
): HttpError {
  const e = errorCodeRespConstructor(error, status);
  for (const key in config.HEALTH_CHECKS) {
    if (
      config.HEALTH_CHECKS?.[key] &&
      error?.response?.error?.[config.HEALTH_CHECKS[key]]?.status === 'down'
    ) {
      error.name = config.HEALTH_CHECK_ERRORS[key].NAME;
      error.message = config.HEALTH_CHECK_ERRORS[key].MESSAGE;
      break;
    }
  }

  e.error.details = error?.response?.error;

  apm.captureError(error);
  return e;
}
