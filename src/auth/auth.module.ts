import { ConfigService } from '@nestjs/config';
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtConfigService } from '../config/jwt-config.service';
import { UserModule } from '../user/user.module';
import { RefreshTokenService } from './refresh-token.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TokenService } from './token.service';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      useClass: JwtConfigService,
      inject: [ConfigService],
    }),
    forwardRef(() => UserModule),
  ],
  controllers: [AuthController],
  providers: [RefreshTokenService, TokenService, AuthService, JwtStrategy],
  exports: [RefreshTokenService],
})
export class AuthModule {}
