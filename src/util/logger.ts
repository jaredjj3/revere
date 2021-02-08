import * as winston from 'winston';

export const logger = winston.createLogger({
  format: winston.format.combine(winston.format.simple(), winston.format.colorize()),
  transports: [new winston.transports.Console()],
});
