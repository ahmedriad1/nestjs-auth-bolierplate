import { ConfigService } from '@nestjs/config';
import { SentryModuleOptions } from '@xiifain/nestjs-sentry';

export const getSentryOptions = (
  config: ConfigService,
): SentryModuleOptions => ({
  dsn: config.get('SENTRY_DNS'),
  tracesSampleRate: 0.3,
  debug: config.get('NODE_ENV') !== 'production',
  environment: config.get('NODE_ENV'),
});
