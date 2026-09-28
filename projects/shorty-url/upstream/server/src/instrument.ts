import 'dotenv/config';
import * as Sentry from '@sentry/node';

const dsn = process.env.SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.NODE_ENV ?? 'development',
  attachStacktrace: true,
  tracesSampleRate: 1.0,
});
