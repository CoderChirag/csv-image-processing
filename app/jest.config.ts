module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: './',
  verbose: true,
  silent: false,
  testEnvironment: 'node',
  testRegex: '.spec.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  coveragePathIgnorePatterns: [],
  collectCoverageFrom: ['src/**/*.ts'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'test-results.xml',
      },
    ],
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['json', 'html', 'lcov', 'text', 'cobertura'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
  },
  setupFiles: ['<rootDir>/tests/mocks/index.ts'],
};
