import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const config: Config = {
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // Uncomment if you have a setup file

  testEnvironment: 'node', // Use 'node' environment for API route testing
  preset: 'ts-jest', // Use ts-jest preset
  
  // Explicitly define where to find test files (without using __tests__ directory)
  testMatch: [
    "**/?(*.)+(test|spec).[jt]s?(x)"
  ],
  
  moduleNameMapper: {
    // Handle module aliases (if you have them in tsconfig.json)
    // Example: '^@/components/(.*)$': '<rootDir>/src/components/$1',
    // Adjust according to your project structure and tsconfig paths
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'], // Ignore build and dependency folders
  transform: {
    // Use babel-jest to transpile tests with the next/babel preset
    // https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  // Increase the default timeout if your tests involve network requests or long operations
  testTimeout: 30000, // 30 seconds timeout for all tests (can be overridden per test)
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
