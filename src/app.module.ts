import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { DatabaseModule } from './database/database.module';
import { ProductModule } from './product/product.module';
import { ReviewModule } from './review/review.module';
import { OrderModule } from './order/order.module';
import { WebhookModule } from './webook/webhook.module';
// import {StaticModule} from "./middleware/static.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_URL: Joi.string().required(),
      }),
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: () => ({
        autoSchemaFile: true,
        path: '/api/v1/graphql',
        playground: true,
        // playground: {
        //   faviconUrl: "/favicon.ico"
        // },
        // implment express response (cookies)
        context: ({ req, res }) => ({ req, res }),
        cors: {
          origin: [
            'http://localhost:3001',
            'https://stripelearnging.vercel.app'
          ],
          credentials: true,
        },
        introspection: true
      }),
    }),
    DatabaseModule,
    UserModule,
    ProductModule,
    ReviewModule,
    OrderModule,
    WebhookModule,
    // StaticModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
