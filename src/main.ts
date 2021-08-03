import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('main');

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // will remove unvalidated fields
    }),
  );

  const configService = app.get(ConfigService);
  const PORT = +configService.get('PORT') || 3000;

  try {
    await app.listen(PORT);
    logger.log(`Server running on ${await app.getUrl()}`);
  } catch (err) {
    logger.error(err);
  }
}

bootstrap();
