import { resolve } from 'node:path';
import pino from 'pino';
import { env } from '../config/env.js';

/**
 * Structured JSON logging. On Vercel stdout is already collected and parsed, so
 * no transport/pretty-printer is configured in production.
 */
const options: pino.LoggerOptions = {
  level: env.LOG_LEVEL,
  base: { service: 'shorty-api', env: env.NODE_ENV },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'passwordHash',
      '*.password',
      '*.passwordHash',
      'refreshToken',
      '*.refreshToken',
      'ADMIN_JWT_SECRET',
      'DBPASS',
    ],
    censor: '[redacted]',
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
};

const streamLevel: pino.Level = env.LOG_LEVEL === 'silent' ? 'fatal' : env.LOG_LEVEL;
const streams: pino.StreamEntry[] = [{ level: streamLevel, stream: pino.destination(1) }];

if (!process.env.VERCEL) {
  streams.push({
    level: streamLevel,
    stream: pino.destination({ dest: resolve(process.cwd(), 'logs', 'app.log'), mkdir: true, sync: false }),
  });
}

export const logger = pino(options, pino.multistream(streams));

export type Logger = typeof logger;
