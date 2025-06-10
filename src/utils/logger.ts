import winston from 'winston';
import morgan from 'morgan';
import { Request, Response, NextFunction } from 'express';

const loggerFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: 'info',
  format: loggerFormat,
  transports: [
    new winston.transports.Console({
      format: loggerFormat,
      stderrLevels: ['error', 'warn', 'info', 'debug'],
    }),
  ],
});

export const morganConfig = morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
});

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error('Error:', { error: err.message, stack: err.stack });
  next(err);
}; 