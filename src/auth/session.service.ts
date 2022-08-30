import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionService {
  constructor(private readonly prismaService: PrismaService) {}
  private EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 365; // 1 year

  async createSession(user: User) {
    return this.prismaService.session.create({
      data: {
        expirationDate: new Date(Date.now() + this.EXPIRATION_TIME),
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }

  async getUserFromSessionId(sessionId: string) {
    const session = await this.prismaService.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session) throw new NotFoundException('User not found !');

    if (Date.now() > session.expirationDate.getTime()) {
      await this.deleteSession(sessionId);
      throw new BadRequestException(
        'Session expired. Please request a new magic link.',
      );
    }

    // if there's less than six months left, extend the session
    const sixMonths = 1000 * 60 * 60 * 24 * 30 * 6;
    if (Date.now() + sixMonths > session.expirationDate.getTime()) {
      const newExpirationDate = new Date(Date.now() + this.EXPIRATION_TIME);
      await this.prismaService.session.update({
        data: { expirationDate: newExpirationDate },
        where: { id: sessionId },
      });
    }

    return session.user;
  }

  async deleteSession(id: string) {
    return this.prismaService.session.delete({ where: { id } });
  }

  async deleteOtherSessions(userId: string, currentSessionId: string) {
    return this.prismaService.session.deleteMany({
      where: { userId, NOT: { id: currentSessionId } },
    });
  }
}
