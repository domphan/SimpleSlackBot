import axios, { AxiosResponse } from 'axios';
import EventEmitter = require('events');
import nconf = require('nconf');
import { queueName } from '../../utils/redisConfig';
import { MEMBER_JOINED_CHANNEL, APP_MENTION } from './EventProducer';
import RedisSMQ = require('rsmq');
import redis = require('redis');
import { runInNewContext } from 'vm';

const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather?q='

export interface CommandInterface {
  action: string,
  city: string,
  country: string
}

export class EventConsumer extends EventEmitter {
  private webhookURL: string;
  private timeout: number;
  private apiKey: string;
  private rsmq;
  constructor(timeout = 100) {
    super();
    this.timeout = timeout;
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
    nconf.argv().env().file('keys.json');
    this.apiKey = nconf.get('weather_api_key');
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
          // console.log("message received", resp);
          const message = JSON.parse(resp.message);
          switch (message.event.type) {
            case APP_MENTION:
              this.weatherBotCommand(resp);
              break;
            case MEMBER_JOINED_CHANNEL:
              this.welcomeCommand(resp);
              break;
            default:

          }
        } else {
          // console.log("no message here");
        }
      });
  }
  private welcomeCommand = async (messageObj) => {
    const response: AxiosResponse = await axios.post(this.webhookURL,
      {
        text: `Welcome to the channel!
            Get the weather by mentioning me with the parameters city and/or country code
            example: @WeatherBot san_jose us`
      }
    );
    if (response.status >= 200 && response.status < 400) {
      this.delMsgFromQueue(messageObj.id);
    }
  }

  private weatherBotCommand = async (messageObj) => {
    const { text } = JSON.parse(messageObj.message).event;
    console.log(text);
    const commands = await this.parseMention(text);
    if (commands['action'] !== 'weather' || !commands['city']) {
      return this.unknownCommand(messageObj);
    }

    this.getWeather(commands['city'], commands['country']);
    this.delMsgFromQueue(messageObj.id);
  }

  private parseMention = (text): object => {
    const commands = text.split(' ');
    return {
      action: commands[1],
      city: commands[2],
      country: commands[3]
    };
  }
  private getWeather = async (city: string, country: string) => {
    const urlsafeCity = city.replace('_', '%20');
    let formattedCountry = '';
    if (country !== '') {
      formattedCountry = ',' + country;
    }
    const response = await axios.get(`${WEATHER_URL}${urlsafeCity}${formattedCountry}&APPID=${this.apiKey}`)
      .catch(err => this.sendErrorResponse());
    if (response) {
      const { temp, humidity, temp_min, temp_max } = response.data.main;
      const { country } = response.data.sys;
      const webhookResponse = await axios.post(this.webhookURL, {
        text: `Looks like it's ${this.kelvinToFarenheit(temp)}F ` +
          `outside in ${city.replace('_', ' ')}, ${country} (country)\n` +
          `Today's high is ${this.kelvinToFarenheit(temp_max)}F\n` +
          `Today's low is ${this.kelvinToFarenheit(temp_min)}F\n` +
          `Humidity is at ${humidity} %`
      }).catch(err => {
        throw Error('Unable to post to slack');
      });
    }

  }


  private sendErrorResponse = async () => {
    const response: AxiosResponse = await axios.post(this.webhookURL,
      {
        text: `Hi, I couldn\'t find that weather data for you.
Did you make sure to use underscores instead of spaces in the city name?
Maybe try adding the country code too.`
      }
    );
  }

  private kelvinToFarenheit = (kelvinTemp) => {
    return (kelvinTemp * (9 / 5) - 459.67).toFixed(2);
  }

  private unknownCommand = async (messageObj) => {
    const response: AxiosResponse = await axios.post(this.webhookURL,
      {
        text: `Hi, I don\'t understand your command\n` +
          `usage: @weatherbot weather {CITY} {COUNTRYCODE}\n` +
          `Spaces in cities must be replaced with an underscore\n` +
          `Country code list must be in ALPHA-2 (ISO 3166) format `
      }
    );
    if (response.status >= 200 && response.status < 400) {
      this.delMsgFromQueue(messageObj.id);
    }
  }

  private delMsgFromQueue = async (messageID) => {
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

