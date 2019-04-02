# Slackbot Design Doc

## Purpose
The intent of this documentation is to gather key concepts of a Slack bot and describing my implementation. This design doc is not a hard guideline of what I'm going to attempt, rather it represents the direction I'm trying to go. I will have a final design doc going over my design decisions to hopefully show my thought process after this project is completed.

## Slackbot Concepts

#### Bot Config
A Slack Bot is actually a Slack App, so I initialized a Slack App and added a bot user.

#### Events API
Even though the RTM API was listed as a technical doc, I believe the Events API is a better choice for this simple slack bot. Using the RTM API requires having open socket for each channel listening for some kind of command. This requires processing ALL the messages coming in through the socket as opposed to only listening for certain events, like a user initiating a bot command. 

#### Signing Verification
Slack provides a way to authenticate that a request came from Slack. The bot will verify that the signature based on each event sent matches the signing secret.


#### Webhook
This is how my bot will communicate to Slack in response to user commands asking for the weather. It allows us to push data in as opposed to initiating a request after a specific event. It allows the bot to get real-time data without having to allocate resources to make a request for data every second.

## Architecture
The __main objective__ of the architecture is to create a slack bot that can __handle real-life scaling issues__ like many users using it at once. Perhaps maybe even servicing multiple Slack workspaces.

It's easier to scale a webhook handler compared to a websocket handler because I wouldn't have to handle multiple connections from multiple channels.

Since webhooks are meant to be responded to with a 200 OK quickly, the bot will respond with that, then add the task to a queue. I'm going to use __RedisSMQ as the message queue__ and my server will consume the event and handle it.

__Why Express?__ The main reason: I'm most familiar using it for developing APIs. Upon doing more research on other options like Flask and Django, the value that Express has __handling asynchronous events__ became very apparent because Flask can only handle one request as a time without other depedencies for asynchronous request handling, like asyncio.

## Command
@weatherbot [command, city, country]