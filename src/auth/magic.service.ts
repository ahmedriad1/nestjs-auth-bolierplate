import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface TokenPayload {
  email: string;
}

@Injectable()
export class MagicService {
  constructor(private readonly jwtService: JwtService) {}

  async createMagicToken(email: string) {
    return this.jwtService.signAsync(
      {
        nonce:
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15),
        email,
      },
      {
        issuer: 'MagicLinkServer',
        expiresIn: '30m',
      },
    );
  }

  async verifyToken(token: string) {
    try {
      return this.jwtService.verifyAsync<TokenPayload>(token);
    } catch (error: unknown) {
      throw new BadRequestException('Invalid magic link');
    }
  }
}
