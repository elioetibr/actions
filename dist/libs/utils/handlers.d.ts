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
 * Logs a success message when the action completes successfully
 */
export declare function handleSuccess(): void;
/**
 * Unified error handler for the action
 * @param error - The error object to be processed
 * @param options - Configuration options for error handling
 */
export declare function handleError(error: unknown, options?: ErrorHandlerOptions): void;
/**
 * Handles error reporting for the action (sets failed status)
 * @param error - The error object to be processed
 * @deprecated Use handleError() instead
 */
export declare function catchErrorAndSetFailed(error: unknown): void;
/**
 * Handles error reporting and re-throws the error
 * @param error - The error object to be processed
 * @deprecated Use handleError() instead
 */
export declare function errorHandler(error: unknown): void;
//# sourceMappingURL=handlers.d.ts.map