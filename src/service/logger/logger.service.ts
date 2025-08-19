import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as path from 'path';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'error.json'),
          maxsize: 5_000_000,
          //   maxFiles: 10,
          level: 'error',
        }),
      ],
    });
  }

  log(message: string, data?: any) {
    this.logger.info({ message, data });
  }

  error(message: string, trace?: string, data?: any) {
    this.logger.error({
      message,
      trace,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  warn(message: string, data?: any) {
    this.logger.warn({ message, data });
  }

  debug?(message: string, data?: any) {
    this.logger.debug({ message, data });
  }

  verbose?(message: string, data?: any) {
    this.logger.verbose({ message, data });
  }
}
