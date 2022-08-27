import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtConfigService } from '../config/jwt-config.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MagicService } from './magic.service';
import { EmailModule } from 'src/email/email.module';
import { SessionService } from './session.service';
import { EncryptionService } from './encryption.service';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    JwtModule.registerAsync({
      useClass: JwtConfigService,
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MagicService, SessionService, EncryptionService],
})
export class AuthModule {}
