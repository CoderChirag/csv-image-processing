import { HTTP_RESPONSE_CODES } from 'src/constants';

export const REQUEST_REPOSITORY_FAILURES = {
  REQUEST_NOT_FOUND: {
    CODE: HTTP_RESPONSE_CODES.NOT_FOUND.CODE,
    MESSAGE: 'Request with the given request id not found',
  },
};
