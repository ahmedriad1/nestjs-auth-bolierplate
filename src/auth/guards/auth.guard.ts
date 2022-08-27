import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionType } from '../interface/session.interface';
import { SessionService } from '../session.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const cookies = request.session as SessionType;

    const sessionId = cookies?.sessionId;
    if (!sessionId) throw new UnauthorizedException('Invalid session');

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
