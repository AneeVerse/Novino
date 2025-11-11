/**
 * Centralized logging utility for the application
 * Provides structured logging with different levels
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  /**
   * Format log message with timestamp and context
   */
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  /**
   * Log error messages
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const logMessage = this.formatMessage(LogLevel.ERROR, message, context);
    console.error(logMessage);
    
    if (error) {
      console.error('Error details:', error.message);
      if (this.isDevelopment && error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }

    // In production, you might want to send errors to a monitoring service
    // Example: Sentry, LogRocket, etc.
    if (!this.isDevelopment) {
      // TODO: Send to error monitoring service
      // this.sendToMonitoringService(message, error, context);
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void {
    const logMessage = this.formatMessage(LogLevel.WARN, message, context);
    console.warn(logMessage);
  }

  /**
   * Log info messages
   */
  info(message: string, context?: LogContext): void {
    const logMessage = this.formatMessage(LogLevel.INFO, message, context);
    console.log(logMessage);
  }

  /**
   * Log debug messages (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const logMessage = this.formatMessage(LogLevel.DEBUG, message, context);
      console.log(logMessage);
    }
  }

  /**
   * Log authentication events
   */
  auth(event: string, userId?: string, context?: LogContext): void {
    this.info(`Auth: ${event}`, {
      userId,
      ...context
    });
  }

  /**
   * Log security events
   */
  security(event: string, context?: LogContext): void {
    this.warn(`Security: ${event}`, context);
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Error handler for API routes
 */
export function handleApiError(
  error: any,
  operation: string,
  context?: LogContext
): {
  message: string;
  error?: string;
  statusCode: number;
} {
  logger.error(`Error in ${operation}`, error, context);

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV !== 'production';

  if (error.name === 'ValidationError') {
    return {
      message: 'Validation error',
      error: error.message,
      statusCode: 400
    };
  }

  if (error.name === 'MongoError' && error.code === 11000) {
    return {
      message: 'Duplicate entry',
      error: isDevelopment ? error.message : undefined,
      statusCode: 409
    };
  }

  if (error.name === 'JsonWebTokenError') {
    return {
      message: 'Invalid token',
      statusCode: 401
    };
  }

  if (error.name === 'TokenExpiredError') {
    return {
      message: 'Token expired',
      statusCode: 401
    };
  }

  // Generic error
  return {
    message: 'Internal server error',
    error: isDevelopment ? error.message : undefined,
    statusCode: 500
  };
}

/**
 * Sanitize error for client response
 */
export function sanitizeError(error: any): any {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  if (isDevelopment) {
    return {
      message: error.message,
      stack: error.stack,
      ...error
    };
  }

  // In production, only return safe information
  return {
    message: error.message || 'An error occurred'
  };
}

