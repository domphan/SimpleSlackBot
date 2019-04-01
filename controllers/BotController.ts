import { NextFunction, Request, Response } from 'express';


export class BotController {
    public testMe = (req: Request, res: Response, next: NextFunction) => {
        return res.json({ message: 'hello' })
    }
}