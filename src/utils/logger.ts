type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
}

class Logger {
  private formatMessage(level: LogLevel, message: string): LogMessage {
    return {
      level,
      message,
      timestamp: new Date().toLocaleTimeString('ja-JP', {
        timeZone: 'Asia/Tokyo',
        hour12: false
      }),
    };
  }

  private log(level: LogLevel, message: string): void {
    const logMessage = this.formatMessage(level, message);

    switch (level) {
      case 'debug':
        console.debug(`[${logMessage.timestamp}] DEBUG:`, message);
        break;
      case 'info':
        console.info(`[${logMessage.timestamp}] INFO:`, message);
        break;
      case 'warn':
        console.warn(`[${logMessage.timestamp}] WARN:`, message);
        break;
      case 'error':
        console.error(`[${logMessage.timestamp}] ERROR:`, message);
        break;
    }
  }

  debug(message: string): void {
    this.log('debug', message);
  }

  info(message: string): void {
    this.log('info', message);
  }

  warn(message: string): void {
    this.log('warn', message);
  }

  error(message: string): void {
    this.log('error', message);
  }
}

export const logger = new Logger();
