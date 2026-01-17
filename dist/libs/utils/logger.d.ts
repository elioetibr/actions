/**
 * Log levels for structured logging
 */
export declare enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error"
}
/**
 * Context for structured log entries
 */
export interface LogContext {
    [key: string]: string | number | boolean | undefined;
}
/**
 * Structured logger following Kubernetes-style logging patterns
 * Provides key-value pair logging for better observability
 */
export declare class Logger {
    private readonly component;
    private readonly defaultContext;
    constructor(component: string, defaultContext?: LogContext);
    /**
     * Creates a child logger with additional context
     */
    withContext(context: LogContext): Logger;
    /**
     * Formats a structured log message with key-value pairs
     */
    private formatMessage;
    /**
     * Debug level logging
     */
    debug(message: string, context?: LogContext): void;
    /**
     * Info level logging
     */
    info(message: string, context?: LogContext): void;
    /**
     * Warning level logging
     */
    warn(message: string, context?: LogContext): void;
    /**
     * Error level logging
     */
    error(message: string, context?: LogContext): void;
}
/**
 * Creates a logger instance for a specific component
 */
export declare function createLogger(component: string, context?: LogContext): Logger;
/**
 * Default loggers for common components
 */
export declare const logger: {
    docker: Logger;
    github: Logger;
    version: Logger;
    action: Logger;
};
//# sourceMappingURL=logger.d.ts.map