/**
 * Logger estruturado para a aplicação
 * Evita exposição de stack traces em produção
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatLog(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  info(message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context || '');
    } else {
      console.log(this.formatLog(entry));
    }
  }

  warn(message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || '');
    } else {
      console.warn(this.formatLog(entry));
    }
  }

  error(message: string, error?: Error | unknown, context?: Record<string, any>) {
    const entry: LogEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    // Em desenvolvimento, mostrar stack trace completo
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context || '');
    } else {
      // Em produção, apenas mensagem de erro (sem stack trace)
      if (error instanceof Error) {
        entry.error = {
          message: error.message,
          // Stack trace apenas em desenvolvimento
        };
      }
      console.error(this.formatLog(entry));
    }
  }

  debug(message: string, context?: Record<string, any>) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }
}

export const logger = new Logger();
