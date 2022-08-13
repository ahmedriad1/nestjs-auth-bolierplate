import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';

// export const getJwtOptions = (
//   configService: ConfigService,
// ): JwtModuleOptions => ({
//   secret: configService.get('JWT_SECRET'),
//   signOptions: {
//     expiresIn: +configService.get<number>('JWT_TTL') || 3600,
//   },
// });
@Injectable()
export class JwtConfigService implements JwtOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createJwtOptions(): JwtModuleOptions {
    return {
      secret: this.configService.get('JWT_SECRET'),
      signOptions: {
        expiresIn: +this.configService.get<number>('JWT_TTL') || 3600,
      },
    };
  }
}
