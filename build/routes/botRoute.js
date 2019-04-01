"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var BotController_1 = require("../controllers/Bot/BotController");
exports.BotRouter = express_1.Router();
var Bot = new BotController_1.BotController();
exports.BotRouter.get('/', function (req, res, next) {
    Bot.testMe(req, res, next);
});
exports.BotRouter.post('/', function (req, res, next) {
    Bot.handleChallenge(req, res, next);
});
//# sourceMappingURL=botRoute.js.map