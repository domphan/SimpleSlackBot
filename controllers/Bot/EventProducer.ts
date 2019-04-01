import { NextFunction, Request, Response } from 'express';
import { queueName } from '../../utils/redisConfig';
import { ReqWithRawBody } from './BotInterfaces';
import RedisSMQ = require('rsmq');

export const MEMBER_JOINED_CHANNEL = 'member_joined_channel';
export const APP_MENTION = 'app_mention';

export class EventProducer {
    private rsmq;
    constructor() {
        this.rsmq = new RedisSMQ({
            host: "redis-mq",
            ns: "rsmq"
        });

    }

    public createEventMsg = (message) => {
        this.rsmq.sendMessageAsync({
            qname: queueName,
            message: JSON.stringify(message)
        })
            .then((resp) => {
                if (resp) {
                    console.log("message sent. ID: ", resp);
                }
            })
    }
}
