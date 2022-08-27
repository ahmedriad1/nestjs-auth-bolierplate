import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Session,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SendMagicLinkDto } from './dto/send-magic-link.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { GetUser } from './get-user.decorator';
import { UseAuthGuard } from './guards/auth.guard';
import { UseGuestGuard } from './guards/guest.guard';
import { SessionType } from './interface/session.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/send_magic_link')
  @UseGuestGuard()
  send(@Body() body: SendMagicLinkDto, @Session() session: SessionType) {
    return this.authService.sendMagicLink(body, session);
  }

  @Get('/verify')
  @UseGuestGuard()
  verify(@Query('token') token: string, @Session() session: SessionType) {
    return this.authService.verifyMagicToken(token, session);
  }

  @Post('/signup')
  @UseGuestGuard()
  signup(@Body() body: CreateUserDto, @Session() session: SessionType) {
    return this.authService.createUser(body, session);
  }

  @Get('/me')
  @UseAuthGuard()
  me(@GetUser() user: User) {
    return user;
  }

  @Patch('/update')
  @UseAuthGuard()
  update(@GetUser() user: User, @Body() body: UpdateMeDto) {
    return this.authService.updateMe(user.id, body);
  }

  @Delete('/logout')
  @UseAuthGuard()
  async logout(@Session() session: SessionType): Promise<void> {
    await this.authService.logout(session);

    return;
  }
}
