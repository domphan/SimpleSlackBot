import { NextFunction, Request, Response } from 'express';
import { queueName } from '../../utils/redisConfig';
import { ReqWithRawBody } from './BotInterfaces';
import RedisSMQ = require('rsmq');
import nconf = require('nconf');
import redis = require('redis');

export const MEMBER_JOINED_CHANNEL = 'member_joined_channel';
export const APP_MENTION = 'app_mention';

export class EventProducer {
  private rsmq;
  constructor() {
    nconf.argv().env().file('keys.json');
    const redisEndpoint = nconf.get('redis_endpoint');
    const redisPort = nconf.get('redis_port');
    const redisPW = nconf.get('redis_pw');
    const RedisClient = redis.createClient({
      port: redisPort,
      host: redisEndpoint,
      password: redisPW
    });

    this.rsmq = new RedisSMQ({
      client: RedisClient,
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
