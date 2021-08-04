import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedResponse } from './interface/authenticated-response.interface';
import { AuthService } from './auth.service';
import { GetUser } from './get-user.decorator';
import { User } from '../user/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  register(@Body() body: CreateUserDto): Promise<AuthenticatedResponse> {
    return this.authService.register(body);
  }

  @Post('/login')
  login(@Body() body: AuthCredentialsDto): Promise<AuthenticatedResponse> {
    return this.authService.login(body);
  }

  @Post('/refresh')
  async refresh(@Body() body: RefreshTokenDto): Promise<AuthenticatedResponse> {
    const { user, token } =
      await this.authService.createAccessTokenFromRefreshToken(
        body.refresh_token,
      );

    return {
      user,
      token,
      refresh_token: body.refresh_token,
    };
  }

  @Get('/me')
  @UseGuards(AuthGuard())
  me(@GetUser() user: User) {
    return user;
  }

  @Delete('/logout')
  async logout(@Body() body: RefreshTokenDto): Promise<void> {
    await this.authService.revokeRefreshToken(body.refresh_token);

    return;
  }
}
