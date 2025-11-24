export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {},
  transformIgnorePatterns: [
    '/node_modules/(?!(node-fetch|fetch-blob|formdata-polyfill)/)'
  ],
  testMatch: ['**/__tests__/**/*.test.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  extensionsToTreatAsEsm: ['.jsx'],
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
};
