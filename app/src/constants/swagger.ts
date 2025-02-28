import { config } from './config';

export const SWAGGER = {
  TITLE: 'csv-image-processing-service',
  DESCRIPTION: 'Service for CSV Image Processing',
  VERSION: '1.0',
  SERVER_URL: config.APP.SERVER_URL,
  DOCUMENTATION_PATH: '/api/docs',
  JSON_DOCUMENTATION_PATH: '/api/docs-json',
  API_TAGS: {
    INTERNAL: 'Internal',
  },
};
