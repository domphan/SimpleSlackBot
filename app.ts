import bodyParser = require('body-parser');
import express = require('express');
import { NextFunction, Request, Response } from 'express';
import HttpStatus = require('http-status-codes');
import morgan = require('morgan');
import nconf = require('nconf');
import redis = require('redis');
import RedisSMQ = require('rsmq');
import { BotRouter } from './routes/botRoute';
import { EventConsumer } from './controllers/Bot/EventConsumer';


export const app = express();
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// Taken from https://gist.github.com/girliemac/d4837bfb6535e44611a4c9d069c241e6#file-snippet03-js
// Used to get the raw body of a request and attach it to the request object
const rawBodyBuffer = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
};

app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
app.use(bodyParser.json({ verify: rawBodyBuffer }));

nconf.argv().env().file('keys.json');
const redisEndpoint = nconf.get('redis_endpoint');
const redisPort = nconf.get('redis_port');
const redisPW = nconf.get('redis_pw');

const RedisClient = redis.createClient({
  port: redisPort,
  host: redisEndpoint,
  password: redisPW
});

RedisClient.on('connect', () => {
  console.log('Redis client connected');
});
RedisClient.on('error', (err) => {
  console.log('Error: ' + err);
});

const eventConsumer = new EventConsumer(1000);
eventConsumer.onCheck(() => {
  eventConsumer.handleEvent();
  eventConsumer.checkMsgQueue();
})
eventConsumer.checkMsgQueue();

const rsmq = new RedisSMQ({
  client: RedisClient,
  ns: "rsmq"
});

rsmq.createQueueAsync({ qname: 'eventqueue' })
  .then((resp) => {
    if (resp === 1) console.log('event queue created')
  })
  .catch((err) => {
    if (err.name !== 'queueExists') console.log(err);
  });

app.use('/api/bot', BotRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.message === 'AuthenticationError') {
    return res.status(HttpStatus.UNAUTHORIZED).send(`Invalid signature`);
  }
  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Something went really wrong');
})