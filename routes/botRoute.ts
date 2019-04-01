import { NextFunction, Request, Response, Router } from 'express';
import { BotController } from '../controllers/BotController';
import { ReqWithRawBody } from '../controllers/BotInterfaces';

export const BotRouter = Router();
const Bot = new BotController();

BotRouter.get('/', (req: ReqWithRawBody, res: Response, next: NextFunction) => {
    Bot.testMe(req, res, next);
});

BotRouter.post('/', (req: ReqWithRawBody, res: Response, next: NextFunction) => {
    Bot.handleChallenge(req, res, next);
});

