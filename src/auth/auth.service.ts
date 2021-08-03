import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './../user/dto/create-user.dto';
import { AuthenticatedResponse } from './interface/authenticated-response.interface';
import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../user/user.repository';
import { JwtPayload } from './interface/jwt-payload.interface';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from 'src/user/user.entity';

@Injectable()
export class AuthService {
  logger = new Logger('AuthService');

  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(body: CreateUserDto): Promise<AuthenticatedResponse> {
    const user = await this.userRepository.register(body);
    const payload: JwtPayload = { id: user.id };
    const token = await this.jwtService.sign(payload);
    const refresh_token = await this.generateRefreshToken(user);
    return { user, token, refresh_token };
  }

  async login(body: AuthCredentialsDto): Promise<AuthenticatedResponse> {
    const user = await this.userRepository.validateUserCredentials(body);
    const payload: JwtPayload = { id: user.id };
    const token = await this.jwtService.sign(payload);
    const refresh_token = await this.generateRefreshToken(user);
    return { user, token, refresh_token };
  }

  async generateRefreshToken(user: User): Promise<string> {
    const token = await this.jwtService.sign(
      { id: user.id },
      {
        expiresIn: +this.configService.get<number>('JWT_REFRESH_TTL'),
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        subject: String(user.id),
      },
    );

    return token;
  }

  async createAccessTokenFromRefreshToken(
    refresh_token: string,
  ): Promise<{ token: string; user: User }> {
    try {
      const { id } = await this.jwtService.verify(refresh_token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      const user = await this.userRepository.findOne(id);
      delete user.password;
      const token = await this.jwtService.sign({ id: user.id });
      return { user, token };
    } catch (e) {
      this.logger.error(e);
      throw new UnprocessableEntityException('Invalid refresh token !');
    }
  }
}
