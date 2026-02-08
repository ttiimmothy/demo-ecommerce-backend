import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import {VercelRequest, VercelResponse} from "@vercel/node";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // middleware
  const configService = app.get(ConfigService);
  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3001', 'https://demoecommerces.vercel.app', 'https://stripelearning.vercel.app', configService.get("FRONTEND_URL")],
    credentials: true,
  })
  // app.setGlobalPrefix('/api/v1');
  const port = 3002;
  await app.listen(port);
  console.log(`Server is running on port ${port}`);
  return app;
}

const configService = new ConfigService();

if (configService.get("NODE_ENV") !== 'production') {
  bootstrap();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await bootstrap();
  const server = app.getHttpAdapter().getInstance();
  return server(req, res);
}
