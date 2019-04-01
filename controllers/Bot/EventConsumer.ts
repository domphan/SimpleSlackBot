import axios, { AxiosResponse } from 'axios';
import EventEmitter = require('events');
import nconf = require('nconf');
import { queueName } from '../../utils/redisConfig';
import { MEMBER_JOINED_CHANNEL, APP_MENTION } from './EventProducer';
import RedisSMQ = require('rsmq');

export class EventConsumer extends EventEmitter {
    private webhookURL: string;
    private timeout: number;
    private rsmq;
    constructor(timeout = 100) {
        super();
        this.timeout = timeout;
        this.rsmq = new RedisSMQ({
            host: "redis-mq",
            ns: "rsmq"
        });
        nconf.argv().env().file('keys.json');
        this.webhookURL = nconf.get('webhook');
    }

    public checkMsgQueue = () => {
        setTimeout(() => this.emit('consumingEvent'), this.timeout);
    }

    public onCheck = (callback) => {
        this.on('consumingEvent', callback);
    }

    public handleEvent = async () => {
        this.rsmq.receiveMessageAsync({ qname: queueName })
            .then((resp) => {
                if (resp.id) {
                    console.log("message received", resp);
                    const message = JSON.parse(resp.message);
                    switch (message.event.type) {
                        // case APP_MENTION:
                        // case MEMBER_JOINED_CHANNEL:
                        default:
                            this.unknownCommand(resp.id);
                    }
                } else {
                    console.log("no message here");
                }
            });
    }
    private welcomeNewUser = async () => {

    }

    private getWeather = async () => {

    }

    private unknownCommand = async (messageID) => {
        let response: AxiosResponse = await axios.post(this.webhookURL, { text: 'Hi, I don\'t understand your command' });
        if (response.status >= 200 && response.status < 400) {
            this.rsmq.deleteMessage({
                qname: queueName,
                id: messageID
            }, (err, resp) => {
                if (resp === 1) {
                    console.log('message deleted');
                } else {
                    console.log('message not found');
                }
            })
        }
    }
}

