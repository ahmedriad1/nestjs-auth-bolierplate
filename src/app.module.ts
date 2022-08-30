import { HttpModule } from '@nestjs/axios';
import { HttpException, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SentryInterceptor, SentryModule } from '@xiifain/nestjs-sentry';
import { CookieSessionModule } from 'nestjs-cookie-session';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { getCookieSessionOptions } from './config/cookie-session.config';
import { getSentryOptions } from './config/sentry.config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CookieSessionModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getCookieSessionOptions,
    }),
    AuthModule,
    PrismaModule,
    HttpModule,
    SentryModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getSentryOptions,
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useFactory: () =>
        new SentryInterceptor({
          filters: [
            {
              type: HttpException,
              filter: (exception: HttpException) => 500 > exception.getStatus(), // Only report 500 errors
            },
          ],
        }),
    },
  ],
})
export class AppModule {}
