import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const logger = new Logger('main');

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // will remove unvalidated fields
    }),
  );

  const configService = app.get(ConfigService);
  const PORT = +configService.get('PORT') || 3000;

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  try {
    await app.listen(PORT);
    logger.log(`Server running on ${await app.getUrl()}`);
  } catch (err) {
    logger.error(err);
  }
}

bootstrap();
