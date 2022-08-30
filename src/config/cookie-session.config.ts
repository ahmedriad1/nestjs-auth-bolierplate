import { ConfigService } from '@nestjs/config';
import { NestCookieSessionOptions } from 'nestjs-cookie-session';

export const getCookieSessionOptions = (
  configService: ConfigService,
): NestCookieSessionOptions => {
  const isProd = configService.get('NODE_ENV') === 'production';

  return {
    session: {
      httpOnly: true,
      secure: isProd,
      domain: isProd ? '.ar1.dev' : undefined,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 365 * 100, // 100 years
      secret: configService.get('SESSION_SECRET'),
    },
  };
};
