import { ConfigService } from '@nestjs/config';
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UserRepository } from '../user/user.repository';
import { getJwtOptions } from '../config/jwtOptions';
import { RefreshTokenRepository } from './refresh-token.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      useFactory: getJwtOptions,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserRepository, RefreshTokenRepository]),
    forwardRef(() => UserModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtModule, JwtStrategy],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
