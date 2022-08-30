import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaService } from './prisma/prisma.service';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);
  app.enableCors({
    credentials: true,
    origin:
      process.env.NODE_ENV === 'production'
        ? /https?:\/\/(([^/]+\.)?ar1\.dev)$/i
        : 'http://auth.devel:4040',
  });

  app.use(helmet());
  app.use(morgan('tiny'));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // will remove unvalidated fields
    }),
  );

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;

  await app.listen(port);

  logger.log(`App started on: ${await app.getUrl()}`);
}

bootstrap();
