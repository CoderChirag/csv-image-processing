import { MockModels } from 'tests/mocks/models/models.mock';

// Mock providers.DB_SERVICES.DOCUMENT_STORAGE ('DOCUMENT_STORAGE_DB_SERVICE')
export const MockDbService = {
  models: MockModels,
  isConnected: jest.fn(),
};
