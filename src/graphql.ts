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
  // const allowedOrigins = [
  //   'https://stripelearning.vercel.app',
  //   'https://demoecommerces.vercel.app',
  //   'http://localhost:3001',
  //   process.env.FRONTEND_URL,
  // ].filter(Boolean) as string[];

  // if (req.method === 'OPTIONS') {
  //   const origin = (req.headers.origin as string) || process.env.FRONTEND_URL || 'https://stripelearning.vercel.app';
  //   if (!allowedOrigins.includes(origin)) {
  //     res.status(403).end();
  //     return;
  //   }
  //   res.setHeader('Access-Control-Allow-Origin', origin);
  //   res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  //   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization');
  //   res.setHeader('Access-Control-Allow-Credentials', 'true');
  //   res.setHeader('Vary', 'Origin');
  //   res.status(200).end();
  //   return;
  // }
  try {
    const app = await bootstrap();
    const server = app.getHttpAdapter().getInstance();
    // // For non-preflight requests, echo allowed Origin so browser accepts responses.
    // const origin = req.headers.origin as string | undefined;
    // if (origin && allowedOrigins.includes(origin)) {
    //   res.setHeader('Access-Control-Allow-Origin', origin);
    //   res.setHeader('Access-Control-Allow-Credentials', 'true');
    //   res.setHeader('Vary', 'Origin');
    // }
    return server(req, res);
  } catch (error) {
    console.error('Error in serverless function:', error);
    res.status(500).send('Internal Server Error');
  }
};
