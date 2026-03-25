import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({ origin: true, credentials: true });

  const portRaw = process.env.PORT ?? '5001';
  const port = Number.parseInt(portRaw, 10);
  if (!Number.isFinite(port)) {
    throw new Error(`Invalid PORT value: ${portRaw}`);
  }

  try {
    await app.listen(port);
  } catch (err: any) {
    if (err?.code === 'EADDRINUSE') {
      // eslint-disable-next-line no-console
      console.error(
        `Port ${port} is already in use. Stop the other process or set PORT to a free port in apps/backend/.env`,
      );
      process.exit(1);
    }
    throw err;
  }
}

bootstrap();
