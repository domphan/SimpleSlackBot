import { NextFunction, Request, Response, Router } from 'express';
import { BotController } from '../controllers/BotController';

export const BotRouter = Router();
const Bot = new BotController();

BotRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
    Bot.testMe(req, res, next);
})