/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['./src'],
  moduleDirectories: ['packages', 'node_modules'],
  transform: {
    'node_modules/(magic-transport)/.+\\.js?$': 'ts-jest'
  },
  transformIgnorePatterns: ['node_modules/(?!(magic-transport))'],
  collectCoverage: true,
  coverageReporters: ['text']
}
