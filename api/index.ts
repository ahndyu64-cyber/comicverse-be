import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';

let app: NestExpressApplication;

async function bootstrap() {
  app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Setup CORS for Vercel
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  app.enableCors({
    origin: clientUrl,
    credentials: true,
  });

  await app.init();
}

export default async (req: any, res: any) => {
  if (!app) {
    await bootstrap();
  }

  // Use the underlying Express instance directly
  return new Promise((resolve, reject) => {
    app.getHttpAdapter().getInstance()(req, res, (err?: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
};
