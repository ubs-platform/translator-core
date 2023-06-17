/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  "resetMocks": false,
  "setupFiles": ["jest-localstorage-mock"]
};