import { NextFunction, Request, Response, Router } from 'express';
import { BotController } from '../controllers/Bot/BotController';
import { ReqWithRawBody } from '../controllers/Bot/BotInterfaces';

export const BotRouter = Router();
const Bot = new BotController();

BotRouter.get('/', (req: ReqWithRawBody, res: Response, next: NextFunction) => {
  Bot.testMe(req, res, next);
});

BotRouter.post('/', (req: ReqWithRawBody, res: Response, next: NextFunction) => {
  Bot.handleChallenge(req, res, next);
});



