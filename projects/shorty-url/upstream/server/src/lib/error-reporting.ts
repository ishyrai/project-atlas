import * as Sentry from '@sentry/node';

export function reportError(error: Error, details: Record<string, unknown>): void {
  if (!process.env.SENTRY_DSN) return;

  Sentry.withScope((scope) => {
    scope.setContext('diagnostic_details', details);
    Sentry.captureException(error);
  });
}
