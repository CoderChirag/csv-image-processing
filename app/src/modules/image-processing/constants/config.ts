import { HTTP_RESPONSE_CODES } from 'src/constants';

export const IMAGE_PROCESSING_CONFIG = {
  API_TAGS: {
    IMAGE_PROCESSING: 'Image Processing',
  },
  CSV_FILES_COUNT_LIMIT: 1,
  CSV_FILE_SIZE_LIMIT: 5 * 1024 * 1024, //5 MB
  PROVIDERS: {
    SCHEDULING: 'IMAGE_PROCESSING_SCHEDULING_SERVICE',
    STATUS: 'IMAGE_PROCESSING_STATUS_SERVICE',
    HTTP_CLIENT: 'IMAGE_PROCESSING_HTTP_CLIENT',
  },
  FAILURES: {
    FILE_NOT_UPLOADED: {
      MESSAGE: 'File not present in request body',
      CODE: HTTP_RESPONSE_CODES.UNPROCESSABLE_ENTITY.CODE,
    },
  },
};
