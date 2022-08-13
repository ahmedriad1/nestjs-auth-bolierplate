import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  logger = new Logger('JwtAuthGuard');

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, _info) {
    if (err || !user) throw err || new UnauthorizedException();

    return user;
  }
}

export const UseJwtAuthGuard = () => UseGuards(JwtAuthGuard);
