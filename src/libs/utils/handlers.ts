import * as core from '@actions/core';
import { createLogger } from './logger';

const logger = createLogger('action');

/**
 * Options for error handling
 */
export interface ErrorHandlerOptions {
  /** Whether to mark the action as failed */
  setFailed?: boolean;
  /** Whether to re-throw the error */
  rethrow?: boolean;
  /** Additional context for logging */
  context?: Record<string, string | number | boolean>;
}

/**
 * Extracts error message from unknown error type
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Logs a success message when the action completes successfully
 */
export function handleSuccess(): void {
  logger.debug('Action completed successfully', { status: 'success' });
}

/**
 * Unified error handler for the action
 * @param error - The error object to be processed
 * @param options - Configuration options for error handling
 */
export function handleError(error: unknown, options: ErrorHandlerOptions = {}): void {
  const { setFailed = true, rethrow = false, context = {} } = options;
  const errorMessage = getErrorMessage(error);
  const isKnownError = error instanceof Error;

  logger.error('Action failed', {
    ...context,
    error: errorMessage,
    errorType: isKnownError ? 'Error' : 'UnhandledError',
  });

  if (setFailed) {
    const failureMessage = isKnownError
      ? `Action failed with error: ${errorMessage}.`
      : `Unhandled error happened during execution: ${errorMessage}`;
    core.setFailed(failureMessage);
  }

  if (rethrow) {
    throw error;
  }
}
