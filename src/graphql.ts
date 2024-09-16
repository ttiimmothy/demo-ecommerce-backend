import {VercelRequest, VercelResponse} from "@vercel/node";
import {bootstrap} from ".";

export default async (req: VercelRequest, res: VercelResponse) => {
  const app = await bootstrap();
  const server = app.getHttpAdapter().getInstance();
  return server(req, res);
};