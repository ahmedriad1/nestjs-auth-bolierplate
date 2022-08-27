import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UseGuards,
} from '@nestjs/common';
import { SessionType } from '../interface/session.interface';
import { SessionService } from '../session.service';

@Injectable()
export class GuestGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const cookies = request.session as SessionType;

    const sessionId = cookies?.sessionId;
    if (!sessionId) return true;

    try {
      await this.sessionService.getUserFromSessionId(sessionId);
      return false;
    } catch {
      delete cookies.sessionId;
      delete cookies.magicToken;
      delete cookies.magicLinkVerified;
      return true;
    }
  }
}

export const UseGuestGuard = () => UseGuards(GuestGuard);
