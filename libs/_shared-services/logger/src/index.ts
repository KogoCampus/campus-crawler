import { createLogger, LoggerConfig } from '@KogoCampus/logger';

const config: LoggerConfig = {
  severity: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
};

const logger = createLogger(config);

export default logger;
