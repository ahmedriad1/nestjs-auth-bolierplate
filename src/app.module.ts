import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CookieSessionModule } from 'nestjs-cookie-session';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CookieSessionModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
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
      },
    }),
    AuthModule,
    PrismaModule,
    HttpModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
