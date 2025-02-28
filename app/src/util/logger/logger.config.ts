import { randomUUID } from 'node:crypto';
import _ from 'lodash';
import apm from 'elastic-apm-node';
import pino from 'pino';
import tracer from 'cls-rtracer';
import { Params as PinoParams } from 'nestjs-pino';
import { config } from 'src/constants';

const headersToRemove = [
  'Request.headers["x-authorization"]',
  'Request.headers["x-user-detail"]',
  'Request.headers["Authorization"]',
  'Request.headers["accept"]',
  'Request.headers["accept-encoding"]',
  'Request.headers["accept-language"]',
  'Request.headers["cache-control"]',
  'Request.headers["connection"]',
  'Request.headers["content-length"]',
  'Request.headers["content-type"]',
  'Request.headers["host"]',
  'Request.headers["origin"]',
  'Request.headers["user-agent"]',
  'Request.headers["referer"]',
  'Request.headers["upgrade-insecure-requests"]',
  'Request.headers["x-forwarded-for"]',
  'Request.headers["x-forwarded-proto"]',
  'Request.headers["x-requested-with"]',
  'Request.headers["x-powered-by"]',
  'Request.headers["etag"]',
  'Request.headers["x-authorization"]',
  'Request.headers["postman-token"]',
  'Request.headers["x-powered-by"]',
  'Request.headers["x-real-ip"]',
  'Request.headers["x-forwarded-host"]',
  'Request.headers["x-forwarded-port"]',
  'Request.headers["x-forwarded-scheme"]',
  'Request.headers["x-scheme"]',
];

const maskedLoggerKeys = {
  paths: [...headersToRemove],
  remove: true,
};

const formatters = {
  log(object: Record<string, unknown>): Record<string, unknown> {
    const trace = apm?.currentTraceIds;
    const reqId = tracer.id();

    if (!trace) return object;

    const traceContext = {
      traceId: trace['trace.id'],
      spanId: trace['span.id'],
      transactionId: trace['transaction.id'],
      reqId,
    };

    return { ...object, traceContext };
  },
};

export const loggerConfigurations: PinoParams = {
  pinoHttp: {
    logger: pino({ formatters }),
    // this configurations are for object masking to hide sensitive info
    redact: maskedLoggerKeys,
    //For customizing default key names customAttributeKeys can be passed with key as the old attribute name and value as the new name .
    customAttributeKeys: {
      req: 'Request',
      res: 'Response',
      err: 'Error',
      responseTime: 'Response Time',
    },
    autoLogging: {
      ignore: (req) =>
        Boolean(
          req?.url?.startsWith(
            `/${config.APP.GLOBAL_API_PREFIX}/${config.APP.HEALTH_CHECK_ROUTES_PREFIX}`,
          ),
        ),
    },
    customSuccessMessage: () => 'Request completed',
    customLogLevel: (_req, res, error) => {
      if (res.statusCode >= 400 && res.statusCode < 500) return 'warn';
      if (res.statusCode >= 500 || error) return 'error';
      return 'info';
    },
    // formatters,
    genReqId: function (req: any, res: any) {
      const id =
        req.get('X-Request-Id') ||
        apm?.currentTraceIds['trace.id'] ||
        randomUUID();
      res.header('X-Request-Id', id);
      apm.setLabel('X-Request-Id', id);
      return id;
    },
  },
};
