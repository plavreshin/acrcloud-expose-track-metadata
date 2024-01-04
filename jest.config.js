/** @type {import('ts-jest').JestConfigWithTsJest} */
const jestConfig = {
  // roots: ['./src'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};

export default jestConfig;
