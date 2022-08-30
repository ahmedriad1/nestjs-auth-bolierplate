import { PrismaService } from './prisma/prisma.service';
import {
  Controller,
  Get,
  Head,
  InternalServerErrorException,
  Logger,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { HttpService } from '@nestjs/axios';

@Controller()
export class AppController {
  private logger = new Logger(AppController.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  @Head('/')
  index() {
    return true;
  }

  @Get('/healthcheck')
  async healthCheck(@Req() req: Request) {
    const host = req.headers['X-Forwarded-Host'] ?? req.headers.host;

    try {
      await Promise.all([
        this.prismaService.user.count(),
        this.httpService.axiosRef.head(`http://${host}`).then((res) => {
          if (res.statusText !== 'OK') return Promise.reject(res);
        }),
      ]);
      return 'OK';
    } catch (error: unknown) {
      this.logger.error('healthcheck ❌', { error });
      throw new InternalServerErrorException();
    }
  }
}
