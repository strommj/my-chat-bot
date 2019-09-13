// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler } = require('botbuilder');
const { QnAMaker } = require('botbuilder-ai');
const darkSkyApi = require('dark-sky-api');
const request = require('request');

class MyBot extends ActivityHandler {
    constructor() {
        super();

        try {
            this.qnaMaker = new QnAMaker({
                knowledgeBaseId: process.env.knowledgeBaseId,
                endpointKey: process.env.endpointKey,
                host: process.env.host
            });
        } catch (err) {
            console.warn(`QnAMaker Exception: ${ err } Check your QnAMaker configuration in .env`);
        }

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            // var strSplit = context.split(" ");

            if (!process.env.knowledgeBaseId || !process.env.endpointKey || !process.env.host) {
                let unconfiguredQnaMessage = 'NOTE: \r\n' + 
                    "Whoops, something went wrong!  All my nuts and bolts aren't in the right place.  Try again later!"

                await context.sendActivity(unconfiguredQnaMessage)
            } else {
                console.log('Calling QnA Maker');

                const qnaresults = await this.qnaMaker.getAnswers(context);

                if (qnaresults[0] && qnaresults[0].answer == "weather search") {
                    // Add call to a weather API here
                    await context.sendActivity("Its raining everywhere!  Sorry, that's Seattle for ya.  Try the gym maybe?");
                } else if (qnaresults[0]) {
                    await context.sendActivity(qnaresults[0].answer);
                } else {
                    await context.sendActivity("Sorry, I don't understand.  Perhaps try rephrasing your question, like: 'Where can I climb near Seattle?'");
                }

                await next();
            }
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity('Hello and welcome!');
                    await context.sendActivity('I give reccommendations on Climbing and Bouldering near Seattle, WA');
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.MyBot = MyBot;
