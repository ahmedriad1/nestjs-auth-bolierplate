import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { RefreshTokenService } from './refresh-token.service';

export interface RefreshTokenPayload {
  jti: string;
  sub: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  async generateAccessToken(user: User): Promise<string> {
    return this.jwtService.sign({ id: user.id }, { subject: user.id });
  }

  async generateRefreshToken(user: User): Promise<string> {
    const expiresIn = +this.configService.get<number>('JWT_REFRESH_TTL');

    const token = await this.refreshTokenService.createRefreshToken(
      user,
      expiresIn,
    );

    return this.jwtService.sign(
      { id: user.id },
      {
        expiresIn,
        subject: user.id,
        jwtid: token.id,
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      },
    );
  }

  private async resolveRefreshToken(encoded: string) {
    const payload = await this.decodeRefreshToken(encoded);
    const token = await this.getStoredTokenFromRefreshTokenPayload(payload);

    if (!token || token.isRevoked || !token.user)
      throw new UnauthorizedException('Invalid refresh token');

    return token;
  }

  async createAccessTokenFromRefreshToken(
    refreshToken: string,
  ): Promise<{ user: User; token: string }> {
    const { user } = await this.resolveRefreshToken(refreshToken);

    const token = await this.generateAccessToken(user);

    return { user, token };
  }

  private async decodeRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayload> {
    try {
      return this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async getStoredTokenFromRefreshTokenPayload(
    payload: RefreshTokenPayload,
    options: { user: boolean } = { user: true },
  ) {
    const tokenId = payload.jti;

    if (!tokenId) throw new UnauthorizedException('Invalid refresh token');

    const token = await this.refreshTokenService.getRefreshToken(
      tokenId,
      options.user,
    );

    if (token.user) delete token.user.password;
    return token;
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const decoded = await this.decodeRefreshToken(refreshToken);

    const token = await this.getStoredTokenFromRefreshTokenPayload(decoded, {
      user: false,
    });

    if (!token || token.isRevoked)
      throw new UnauthorizedException('Invalid refresh token');

    await this.refreshTokenService.revokeRefreshToken(token.id);
    return;
  }
}
