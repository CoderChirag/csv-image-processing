export const HTTP_RESPONSE_CODES = {
  BAD_REQUEST: {
    CODE: 400,
    MESSAGE: 'Bad request',
  },
  UNAUTHORIZED: {
    CODE: 401,
    MESSAGE: 'Unauthorized',
  },
  FORBIDDEN: {
    CODE: 403,
    MESSAGE: 'Forbidden',
  },
  NOT_FOUND: {
    CODE: 404,
    MESSAGE: 'Not found',
  },
  PAYLOAD_TOO_LARGE: {
    CODE: 413,
    MESSAGE: 'Payload too large',
  },
  UNPROCESSABLE_ENTITY: {
    CODE: 422,
    MESSAGE: 'Unprocessable entity',
  },
  DEPENDENCY_FAILED: {
    CODE: 424,
    MESSAGE: 'Dependency failed',
  },
  PRECONDITION_REQUIRED: {
    CODE: 428,
    MESSAGE: 'Precondition required',
  },
  INTERNAL_SERVER_ERROR: {
    CODE: 500,
    MESSAGE: 'Internal server error',
  },
};
