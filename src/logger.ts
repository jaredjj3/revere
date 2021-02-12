import * as winston from 'winston';

export const logger = winston.createLogger({
  format: winston.format.combine(winston.format.simple()),
  transports: [new winston.transports.Console()],
});
