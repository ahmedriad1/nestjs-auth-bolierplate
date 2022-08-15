import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthenticatedResponse } from './interface/authenticated-response.interface';
import { Injectable, Logger } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { TokenService } from './token.service';
// import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthService {
  logger = new Logger('AuthService');

  constructor(
    // private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async register(body: CreateUserDto): Promise<AuthenticatedResponse> {
    const user = await this.userService.store(body);
    const token = await this.tokenService.generateAccessToken(user);
    const refresh_token = await this.tokenService.generateRefreshToken(user);
    return { user, token, refresh_token };
  }

  async login(body: AuthCredentialsDto): Promise<AuthenticatedResponse> {
    const user = await this.userService.validateUserCredentials(body);
    const token = await this.tokenService.generateAccessToken(user);
    const refresh_token = await this.tokenService.generateRefreshToken(user);
    return { user, token, refresh_token };
  }

  async updateMe(id: string, body: UpdateMeDto) {
    return this.userService.update(id, body);
  }
}
