import { Injectable, Logger } from '@nestjs/common';
import { RefreshToken, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RefreshTokenService {
  logger = new Logger('RefreshTokenService');

  constructor(private readonly prisma: PrismaService) {}

  async getRefreshToken(id: string, withUser = false) {
    return this.prisma.refreshToken.findUnique({
      where: { id },
      include: { user: withUser },
    });
  }

  async createRefreshToken(user: User, ttl: number): Promise<RefreshToken> {
    const expiration = new Date();
    expiration.setTime(expiration.getTime() + ttl);

    const token = await this.prisma.refreshToken.create({
      data: {
        user: { connect: { id: user.id } },
        expiresIn: expiration,
      },
    });

    return token;
  }

  async revokeRefreshToken(id: string) {
    return this.prisma.refreshToken.update({
      where: { id },
      data: { isRevoked: true },
    });
  }
}
