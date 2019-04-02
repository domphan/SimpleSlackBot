# Slackbot Final Thoughts

## Architecutre

The motivation for this architecture was to keep the bot simple, while addressing a possible need to scale, so the architecture I previously discussed has been implemented. It uses an __Express backend__ along with a __redis message queue__. The backend has 3 classes: EventController, EventProducer, EventConsumer. The __EventController__ has an __EventProducer__ which handles the business logic of adding a message to the queue. The message, being the response body from Slack's event subscription. The EventController also verifies the slack challenge verification. The __EventConsumer__ runs and polls the queue in a specified time interval and processes the messages, then posts to the Slack webhook.

## Deployment
This app was deployed on __AWS EC2__ and uses a redis instance on __Redis Cloud__. The reason I decided to use AWS was because I ran out of google cloud credits. Just kidding, well, that's partially true. I've been meaning to learn AWS, so this was a great opportunity. Other free options like Heroku only allow free users to spin up a Dyno for 18 hours a day. Google Cloud's free tier only allows for a backend to run for 9 hours a day. AWS allows me 750 hours a month, which is great for a small scale app like this. I used Redis Cloud instead of AWS Elasticache because I had it setup already from a previous project.

## Further development

The slack bot works, but there's much to be done to make it more robust from the user and developer's perspective. I think the way I implemented the user command parsing is sort of brittle. It relies on the user to change spaces to underscores and provide an optional country code. I would develop it further so spaces are allowed. The way OpenWeather processes city names is strange too. I thought that that it would default to USA just like zip codes, but it doesn't, so a country code is needed for a more precise location. I also want to go and develop an option to use zipcodes in the command as well.

On the development side, I would first start by using a redis instance with persistence. My redis labs subscription is free, so there's no persistence, so if something happens, whatever is in the queue is lost. This is also my first time using a message queue and implementing a Consumer, so I'm not actually sure if what I created is the most optimal, but it polls the queue every second, which might be slow under load. I think some kind of dynamic polling could be implemented when the queue is over a certain size.

The error handling is really weak as well. I'm mostly console logging everything. I did handle some use cases though, in the event that a user provided a bad city/country combo, I send them a chat providing feedback that their command wasn't able to be understood.