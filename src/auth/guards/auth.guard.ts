import { EncryptionService } from '../encryption.service';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionType } from '../interface/session.interface';
import { SessionService } from '../session.service';
import { MagicService } from '../magic.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly sessionService: SessionService,
    private readonly encryptionService: EncryptionService,
    private readonly magicService: MagicService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const cookies = request.session as SessionType;

    const sessionId = cookies?.sessionId;

    if (!sessionId) {
      if (cookies.magicLinkVerified) {
        // to check on our frontend the /auth/me route when the user is not authenticated but is awaiting signup
        let email;
        try {
          const token = this.encryptionService.decrypt(cookies.magicToken);
          const payload = await this.magicService.verifyToken(token);
          email = payload.email;
        } catch {
          delete cookies.magicToken;
          delete cookies.magicLinkVerified;
          throw new UnauthorizedException('Invalid magic link');
        }

        // link is verified, but user needs to complete signup
        throw new UnauthorizedException({
          message: 'Magic link is verified, you can now sign up !',
          email,
          awaitingSignup: true,
        });
      }

      // link is not verified yet
      throw new UnauthorizedException('Invalid session');
    }

    try {
      const user = await this.sessionService.getUserFromSessionId(sessionId);
      request.user = user;
      return true;
    } catch {
      delete cookies.sessionId;
      delete cookies.magicToken;
      delete cookies.magicLinkVerified;
      throw new UnauthorizedException('Invalid session');
    }
  }
}

export const UseAuthGuard = () => UseGuards(AuthGuard);
