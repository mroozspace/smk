export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export type LogContext =
  | 'background'
  | 'popup'
  | 'contentScript'
  | 'utils'
  | 'errorHandler';

// Development mode is enabled when running npm run dev (webpack --mode=development)
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export class Logger {
  constructor(private readonly context: LogContext) {}

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}][${this.context}][${level}] ${message}`;
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (!IS_DEVELOPMENT) return;

    const formattedMessage = this.formatMessage(level, message);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, data || '');
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, data || '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, data || '');
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, data || '');
        break;
    }
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }
}
