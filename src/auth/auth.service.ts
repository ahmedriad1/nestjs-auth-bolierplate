import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { SendMagicLinkDto } from './dto/send-magic-link.dto';
import { MagicService } from './magic.service';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { SessionService } from './session.service';
import { SessionType } from './interface/session.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { EncryptionService } from './encryption.service';
import { getMagicLinkTemplate } from '../email/templates/magic_link.template';

@Injectable()
export class AuthService {
  logger = new Logger('AuthService');

  constructor(
    // private readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly sessionService: SessionService,
    private readonly encryptionService: EncryptionService,
    private readonly magicService: MagicService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  private clearCookies(cookies: SessionType) {
    delete cookies.magicLinkVerified;
    delete cookies.magicToken;
    delete cookies.sessionId;
  }

  async sendMagicLink(body: SendMagicLinkDto, cookies: SessionType) {
    const url = this.configService.get('VERIFY_MAGIC_LINK_URL');
    const hostname = new URL(url).hostname;
    await this.emailService.verifyEmailAddress(body.email);
    const token = await this.magicService.createMagicToken(body.email);

    const user = await this.prismaService.user.findUnique({
      where: { email: body.email },
    });
    const magicLink = `${url}?token=${token}`;

    await this.emailService.sendEmail({
      to: body.email,
      from: 'auth@ar1.dev',
      subject: "Here's your Magic ✨ sign-in link",
      ...getMagicLinkTemplate({
        magicLink,
        user,
        hostname,
        email: body.email,
        domainUrl: `https://${hostname}`,
      }),
    });

    cookies.magicToken = this.encryptionService.encrypt(token);
    cookies.magicLinkVerified = false;

    return { message: 'Email sent successfully !' };
  }

  async verifyMagicToken(token: string, cookies: SessionType) {
    if (!token) throw new BadRequestException('token is required');
    const payload = await this.magicService.verifyToken(token);

    const decryptedMagicToken = cookies.magicToken
      ? this.encryptionService.decrypt(cookies.magicToken)
      : null;

    if (decryptedMagicToken !== token)
      throw new BadRequestException(
        'You must open the magic link on the same device it was created from for security reasons. Please request a new link.',
      );

    cookies.magicLinkVerified = true;

    const user = await this.prismaService.user.findUnique({
      where: { email: payload.email },
    });

    if (user) {
      // user exists, create session and return token with session id
      const session = await this.sessionService.createSession(user);
      cookies.sessionId = session.id;

      return { message: 'Logged in successfully !', user };
    }

    // handle signup
    return {
      message: 'Magic link verified, you can now sign up !',
      email: payload.email,
      awaitingSignup: true,
    };
  }

  async createUser(body: CreateUserDto, cookies: SessionType) {
    const payload = await this.magicService.verifyToken(
      this.encryptionService.decrypt(cookies.magicToken),
    );

    const email = payload.email;

    if (!cookies.magicLinkVerified || !email) {
      this.clearCookies(cookies);
      throw new UnauthorizedException('Invalid magic link');
    }

    const userForMagicLink = await this.prismaService.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (userForMagicLink) {
      // user exists, but they haven't clicked their magic link yet
      // we don't want to tell them that a user exists with that email though
      // so we'll invalidate the magic link and force them to try again.
      this.clearCookies(cookies);
      throw new UnauthorizedException('Invalid magic link');
    }

    const user = await this.prismaService.user.create({
      data: {
        email,
        ...body,
      },
    });

    const session = await this.sessionService.createSession(user);
    cookies.sessionId = session.id;

    return { message: 'Logged in successfully !', user };
  }

  async logout(cookies: SessionType) {
    if (cookies.sessionId) {
      await this.sessionService.deleteSession(cookies.sessionId);
      this.clearCookies(cookies);
    }
  }

  async updateMe(userId: string, data: UpdateMeDto) {
    return this.prismaService.user.update({ where: { id: userId }, data });
  }

  async deleteOtherSessions(userId: string, sessionId: string) {
    await this.sessionService.deleteOtherSessions(userId, sessionId);
  }
}
