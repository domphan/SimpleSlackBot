import bodyParser = require('body-parser');
import express = require('express');
import { Request, Response, NextFunction } from 'express';
import HttpStatus = require('http-status-codes');
import morgan = require('morgan');
import { BotRouter } from './routes/botRoute';

export const app = express();

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(bodyParser.json())

app.use('/api/bot', BotRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.message === 'AuthenticationError') {
        return res.status(HttpStatus.UNAUTHORIZED).send(`Invalid signature`);
    }
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Something went really wrong');
})