import { Logger } from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { RefreshToken } from './refresh-token.entity';

@EntityRepository(RefreshToken)
export class RefreshTokenRepository extends Repository<RefreshToken> {
  logger = new Logger('RefreshTokenRepository');

  async createRefreshToken(user: User, ttl: number): Promise<RefreshToken> {
    const token = this.create();
    token.userId = user.id;

    const expiration = new Date();
    expiration.setTime(expiration.getTime() + ttl);
    token.expiresIn = expiration;

    return token.save();
  }

  async revokeRefreshToken(id: number) {
    return this.update(id, {
      isRevoked: true,
    });
  }
}
