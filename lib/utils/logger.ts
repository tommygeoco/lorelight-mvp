/**
 * Error logging utility for production-ready error handling
 *
 * Usage:
 * ```typescript
 * import { logger } from '@/lib/utils/logger'
 *
 * // Basic logging
 * logger.error('Failed to fetch data', error)
 * logger.warn('Deprecated API usage')
 * logger.info('User logged in')
 *
 * // With context
 * logger.error('Failed to create campaign', error, {
 *   userId: user.id,
 *   campaignName: name
 * })
 * ```
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug'

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  level: LogLevel
  message: string
  error?: Error | unknown
  context?: LogContext
  timestamp: string
  userAgent?: string
  url?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isServer = typeof window === 'undefined'

  /**
   * Log error messages
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    this.log('error', message, error, context)
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, undefined, context)
  }

  /**
   * Log info messages
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, undefined, context)
  }

  /**
   * Log debug messages (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      this.log('debug', message, undefined, context)
    }
  }

  /**
   * Core logging implementation
   */
  private log(
    level: LogLevel,
    message: string,
    error?: Error | unknown,
    context?: LogContext
  ): void {
    const logEntry: LogEntry = {
      level,
      message,
      error,
      context,
      timestamp: new Date().toISOString(),
    }

    // Add browser context if client-side
    if (!this.isServer) {
      logEntry.userAgent = navigator.userAgent
      logEntry.url = window.location.href
    }

    // Development: console output with formatting
    if (this.isDevelopment) {
      this.logToConsole(logEntry)
      return
    }

    // Production: send to error tracking service
    this.logToService(logEntry)
  }

  /**
   * Console logging for development
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.level.toUpperCase()}]`

    switch (entry.level) {
      case 'error':
        console.error(prefix, entry.message, entry.error, entry.context)
        break
      case 'warn':
        console.warn(prefix, entry.message, entry.context)
        break
      case 'info':
        console.info(prefix, entry.message, entry.context)
        break
      case 'debug':
        console.debug(prefix, entry.message, entry.context)
        break
    }
  }

  /**
   * Send logs to external service (production)
   */
  private logToService(entry: LogEntry): void {
    // Note: Error tracking service integration pending (Sentry, LogRocket, etc.)
    // Add service integration here when ready for production monitoring
    // For now, only log errors to console in production
    if (entry.level === 'error') {
      console.error('[ERROR]', entry.message, entry.error)
    }

    // Future: Send to external service
    // try {
    //   fetch('/api/logs', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(entry)
    //   })
    // } catch (err) {
    //   // Fail silently in production
    // }
  }

}

// Export singleton instance
export const logger = new Logger()

/**
 * Helper for logging async errors with context
 */
export async function withErrorLogging<T>(
  fn: () => Promise<T>,
  errorMessage: string,
  context?: LogContext
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    logger.error(errorMessage, error, context)
    throw error
  }
}