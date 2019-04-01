import EventEmitter = require('events');
import { queueName } from '../../utils/redisConfig';
import { MEMBER_JOINED_CHANNEL, APP_MENTION } from './EventProducer';
import RedisSMQ = require('rsmq');


export class EventConsumer extends EventEmitter {
    private timeout: number;
    private rsmq;
    constructor(timeout = 100) {
        super();
        this.timeout = timeout;
        this.rsmq = new RedisSMQ({
            host: "redis-mq",
            ns: "rsmq"
        });
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
                } else {
                    console.log("no message here");
                }
            });
    }
    private welcomeNewUser = async () => {

    }

    private getWeather = async () => {

    }

    private unknownCommand = async () => {

    }
}

