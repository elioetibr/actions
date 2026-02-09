import * as core from '@actions/core';
import { handleSuccess, handleError } from './handlers';

// Mock the @actions/core module
jest.mock('@actions/core');

describe('Handlers', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleSuccess', () => {
    test('should log a success message using core.debug with structured format', () => {
      // Act
      handleSuccess();

      // Assert
      expect(core.debug).toHaveBeenCalledTimes(1);
      expect(core.debug).toHaveBeenCalledWith(expect.stringContaining('component="action"'));
      expect(core.debug).toHaveBeenCalledWith(
        expect.stringContaining('msg="Action completed successfully"'),
      );
      expect(core.debug).toHaveBeenCalledWith(expect.stringContaining('status="success"'));
    });
  });

  describe('handleError', () => {
    test('should log and set failure status with structured error message for Error instance', () => {
      // Arrange
      const testError = new Error('Test error message');

      // Act
      handleError(testError);

      // Assert
      expect(core.error).toHaveBeenCalledTimes(1);
      expect(core.error).toHaveBeenCalledWith(
        expect.stringContaining('error="Test error message"'),
      );
      expect(core.error).toHaveBeenCalledWith(expect.stringContaining('errorType="Error"'));
      expect(core.setFailed).toHaveBeenCalledWith('Action failed with error: Test error message.');
      expect(core.setFailed).toHaveBeenCalledTimes(1);
    });

    test('should log and set failure status for non-Error types', () => {
      // Arrange
      const nonErrorCases = ['string error', 123, { custom: 'error object' }, null, undefined];

      // Test each non-Error case
      nonErrorCases.forEach(errorCase => {
        jest.clearAllMocks();

        // Act
        handleError(errorCase);

        // Assert
        expect(core.error).toHaveBeenCalledTimes(1);
        expect(core.error).toHaveBeenCalledWith(
          expect.stringContaining('errorType="UnhandledError"'),
        );
        expect(core.setFailed).toHaveBeenCalledWith(
          `Unhandled error happened during execution: ${errorCase}`,
        );
      });
    });

    test('should not set failed when setFailed option is false', () => {
      const testError = new Error('Test error');

      handleError(testError, { setFailed: false });

      expect(core.error).toHaveBeenCalledTimes(1);
      expect(core.setFailed).not.toHaveBeenCalled();
    });

    test('should rethrow error when rethrow option is true', () => {
      const testError = new Error('Test error');

      expect(() => handleError(testError, { rethrow: true })).toThrow(testError);
      expect(core.error).toHaveBeenCalledTimes(1);
      expect(core.setFailed).toHaveBeenCalledTimes(1);
    });

    test('should include additional context in log message', () => {
      const testError = new Error('Test error');

      handleError(testError, { context: { operation: 'test', retryCount: 3 } });

      expect(core.error).toHaveBeenCalledWith(expect.stringContaining('operation="test"'));
      expect(core.error).toHaveBeenCalledWith(expect.stringContaining('retryCount=3'));
    });
  });
});
