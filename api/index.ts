import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';

let app: NestExpressApplication | null = null;

async function bootstrap(): Promise<NestExpressApplication> {
  if (app) {
    return app;
  }

  try {
    app = await NestFactory.create<NestExpressApplication>(AppModule);

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    app.enableCors({
      origin: clientUrl,
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type,Authorization',
    });

    await app.init();
    console.log('NestJS app initialized successfully');
  } catch (error) {
    console.error('Error initializing app:', error);
    throw error;
  }

  return app;
}

export default async (req: any, res: any) => {
  try {
    const nestApp = await bootstrap();
    const server = nestApp.getHttpAdapter().getInstance();
    
    return server(req, res);
  } catch (error) {
    console.error('Serverless handler error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

