import * as core from '@actions/core';

/**
 * Log levels for structured logging
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
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
export class Logger {
  private readonly component: string;
  private readonly defaultContext: LogContext;

  constructor(component: string, defaultContext: LogContext = {}) {
    this.component = component;
    this.defaultContext = defaultContext;
  }

  /**
   * Creates a child logger with additional context
   */
  withContext(context: LogContext): Logger {
    return new Logger(this.component, { ...this.defaultContext, ...context });
  }

  /**
   * Formats a structured log message with key-value pairs
   */
  private formatMessage(message: string, context: LogContext = {}): string {
    const mergedContext = { ...this.defaultContext, ...context };
    const contextPairs = Object.entries(mergedContext)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join(' ');

    const componentPrefix = `component=${JSON.stringify(this.component)}`;
    return contextPairs
      ? `${componentPrefix} ${contextPairs} msg=${JSON.stringify(message)}`
      : `${componentPrefix} msg=${JSON.stringify(message)}`;
  }

  /**
   * Debug level logging
   */
  debug(message: string, context: LogContext = {}): void {
    core.debug(this.formatMessage(message, context));
  }

  /**
   * Info level logging
   */
  info(message: string, context: LogContext = {}): void {
    core.info(this.formatMessage(message, context));
  }

  /**
   * Warning level logging
   */
  warn(message: string, context: LogContext = {}): void {
    core.warning(this.formatMessage(message, context));
  }

  /**
   * Error level logging
   */
  error(message: string, context: LogContext = {}): void {
    core.error(this.formatMessage(message, context));
  }
}

/**
 * Creates a logger instance for a specific component
 */
export function createLogger(component: string, context: LogContext = {}): Logger {
  return new Logger(component, context);
}

/**
 * Default loggers for common components
 */
export const logger = {
  docker: createLogger('docker'),
  github: createLogger('github'),
  version: createLogger('version'),
  action: createLogger('action'),
};
