/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.{ts,tsx,js,jsx}',
        // Global Coverage
        '!**/coverage/**',
        '!**/dist/**',
        // Exclude common barrel file patterns
        '!src/**/index.{ts,tsx,js,jsx}',
        '!src/**/*.barrel.{ts,js}',
        '!src/**/*.exports.{ts,js}',
        '!src/**/exports/**',
        // Exclude tools directory (built separately with Vite)
        '!src/tools/**',
        '!src/agents/**',
        // Exclude other non-logic files
        '!src/**/*.examples.{ts,tsx,js,jsx}',
        '!src/**/*.d.ts',
        '!src/**/*.stories.{ts,tsx,js,jsx}',
        '!src/**/*.test.{ts,tsx,js,jsx}',
        '!src/**/*.spec.{ts,tsx,js,jsx}',
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/scripts/',
        '/dist/',
        '/tools/',
        '/agents/',
        '\\.barrel\\.(ts|js)$',
        '/exports\\.(ts|js)$',
        '/barrel\\.(ts|js)$',
        '\\.examples\\.(ts|js)$',
        '\\.d\\.ts$',
    ],
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
      global: {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: 95,
      },
    },
    roots: ['<rootDir>/src'],
    testMatch: [
        '**/__tests__/**/*.{js,ts}',
        '**/?(*.)+(spec|test).{js,ts}',
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    verbose: true,
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.json',
            },
        ],
    },
    transformIgnorePatterns: [
        'node_modules/(?!(js-yaml)/)',
    ],
    testTimeout: 30000,
    clearMocks: true,
    restoreMocks: true,
};
