import { Body, Controller, Headers, Post, Res } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('api/v1/stripe')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('/webhook')
  webhook(@Body() body, @Headers() headers, @Res() response) {
    const event = body;
    const endpointSecret = process.env.STRIPE_WEBHOOK_KEY;
    if (endpointSecret) {
      try {
        this.webhookService.webhook(event, endpointSecret, body, headers);
      } catch (error) {
        console.log(`⚠️  Webhook signature verification failed.`, error.message);
        return response.sendStatus(400);
      }
    }
    // code 200
    response.send();
  }
}
