import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';

let app: NestExpressApplication;

async function bootstrap(): Promise<NestExpressApplication> {
  if (app) {
    return app;
  }

  app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Setup CORS for Vercel
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  app.enableCors({
    origin: clientUrl,
    credentials: true,
  });

  await app.init();
  return app;
}

export default async (req: any, res: any) => {
  const nestApp = await bootstrap();
  const server = nestApp.getHttpAdapter().getInstance();
  
  return server(req, res);
};

