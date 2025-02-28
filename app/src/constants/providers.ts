export const providers = {
  REPOSITORIES: {
    REQUEST: 'REQUESTS_REPOSITORY',
  },
  ENTITIES: {},
  SERVICES: {
    CONFIGURATION: 'CONFIGURATION_SERVICE',
    LOGGER: 'LOGGER_SERVICE',
    DB: 'DB_SERVICE',
    REPOSITORY: 'REPOSITORY_SERVICE',
  },
} as const;
