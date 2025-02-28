import { HTTP_RESPONSE_CODES } from 'src/constants';

export const CSV_ENTITY_CONFIG = {
  ALLOWED_MIME_TYPE: 'text/csv',
  EXPECTED_HEADERS: ['S. No.', 'Product Name', 'Input Image Urls'],
};

export const CSV_ENTITY_FAILURES = {
  INCORRECT_FILE_FORMAT: {
    MESSAGE: 'Incorrect file format. Only CSV files are allowed.',
    CODE: HTTP_RESPONSE_CODES.UNPROCESSABLE_ENTITY.CODE,
  },
  CSV_PARSE_ERROR: {
    MESSAGE: 'CSV file parsing error.',
    CODE: HTTP_RESPONSE_CODES.UNPROCESSABLE_ENTITY.CODE,
  },
  INVALID_PRODUCT_DATA: {
    MESSAGE: 'Invalid product data.',
    CODE: HTTP_RESPONSE_CODES.UNPROCESSABLE_ENTITY.CODE,
  },
};
