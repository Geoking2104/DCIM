import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors({
    origin: (process.env.CORS_ORIGINS || 'https://dcim-web.vercel.app,http://localhost:3000').split(','),
    credentials: true,
    allowedHeaders: ['content-type', 'authorization', 'x-tenant'],
  });
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Topology Service on :${port}/graphql · Keycloak ${process.env.KEYCLOAK_ISSUER || 'off'}`);
}

void bootstrap();
