import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

let app: any;

export default async (req, res) => {
  if (!app) {
    app = await NestFactory.create(AppModule);
    await app.init();
  }

  const { method, url, headers, body } = req;
  const rawBody = body || '';

  app.getHttpAdapter().getInstance()(req, res);
};
