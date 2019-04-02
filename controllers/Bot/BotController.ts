import crypto = require('crypto');
import { NextFunction, Request, Response } from 'express';
import { OK, UNAUTHORIZED } from 'http-status-codes';
import nconf = require('nconf');
import timingSafeCompare = require('tsscmp');
import { ReqWithRawBody } from './BotInterfaces';
import { EventProducer } from './EventProducer';

const eventProducer = new EventProducer();

export class BotController {
  public testMe = async (req: ReqWithRawBody, res: Response, next: NextFunction) => {
    res.json({ message: "hello" })
  }

  public handleChallenge = async (req: ReqWithRawBody, res: Response, next: NextFunction) => {
    if (req.body.challenge) {
      return res.json({ challenge: req.body.challenge });
    }
    if (!await this.verifyRequest(req)) {
      res.status(UNAUTHORIZED).json({ message: 'Request could not be verified' })
    }
    res.status(OK).json({ message: 'success' });
    // produce a message to queue
    eventProducer.createEventMsg(req.body);
  }

  private verifyRequest = async (req: ReqWithRawBody) => {
    nconf.argv().env().file('keys.json');
    const signatureFromSlack = req.headers['x-slack-signature'] as string;
    const signingSecret: string = nconf.get('signing_secret');
    const versionNumber = (req.headers['x-slack-signature'] as string).split('=', 1);
    const timestamp: number = parseInt(req.headers['x-slack-request-timestamp'] as string, 10);
    const hmac: crypto.Hmac = crypto.createHmac('sha256', signingSecret);
    const mySignature = `${versionNumber}=` + hmac
      .update(`${versionNumber}:${timestamp}:${req.rawBody}`, 'utf8')
      .digest('hex');
    // Check for a timing attack
    const time = Math.floor(new Date().getTime() / 1000);
    if (Math.abs(time - timestamp) > 60 * 5) {
      return false;
    }
    return timingSafeCompare(mySignature, signatureFromSlack);
  }
}
