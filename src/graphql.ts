import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let app;

async function bootstrap() {
  if (!app) {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    app = await NestFactory.create(AppModule, adapter, {
      logger: ['error', 'warn'],
    })
    app.enableCors({
      origin: ['https://demoecommerces.vercel.app', 'https://stripelearning.vercel.app'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'X-Requested-With, Content-Type, Accept, Authorization',
      credentials: true,
    });

    // Apply middleware to handle the custom path
    app.use('/api/v1/graphql', (req, res, next) => {
      // Strip '/api/v1' from the URL so that GraphQL can process it correctly
      req.url = req.url.replace('/api/v1', '');
      next();
    });

    await app.init();
  }
  return app;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  try {
    const app = await bootstrap();
    const server = app.getHttpAdapter().getInstance();
    return server(req, res);
  } catch (error) {
    console.error('Error in serverless function:', error);
    res.status(500).send('Internal Server Error');
  }
};
