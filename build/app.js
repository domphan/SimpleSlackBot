"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var express = require("express");
var HttpStatus = require("http-status-codes");
var morgan = require("morgan");
var redis = require("redis");
var RedisSMQ = require("rsmq");
var botRoute_1 = require("./routes/botRoute");
exports.app = express();
exports.app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
// Taken from https://gist.github.com/girliemac/d4837bfb6535e44611a4c9d069c241e6#file-snippet03-js
// Used to get the raw body of a request and attach it to the request object
var rawBodyBuffer = function (req, res, buf, encoding) {
    if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
    }
};
exports.app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
exports.app.use(bodyParser.json({ verify: rawBodyBuffer }));
var RedisClient = redis.createClient(process.env.REDIS_URL);
RedisClient.on('connect', function () {
    console.log('Redis client connected');
});
RedisClient.on('error', function (err) {
    console.log('Error: ' + err);
});
var rsmq = new RedisSMQ({
    host: "redis-mq",
    ns: "rsmq"
});
rsmq.createQueueAsync({ qname: 'eventqueue' })
    .then(function (resp) {
    if (resp === 1)
        console.log('event queue created');
})
    .catch(function (err) {
    if (err.name !== 'queueExists')
        console.log(err);
});
exports.app.use('/api/bot', botRoute_1.BotRouter);
exports.app.use(function (err, req, res, next) {
    if (err.message === 'AuthenticationError') {
        return res.status(HttpStatus.UNAUTHORIZED).send("Invalid signature");
    }
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Something went really wrong');
});
//# sourceMappingURL=app.js.map