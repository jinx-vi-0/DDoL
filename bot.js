const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { LeetCode } = require('leetcode-query');
const cron = require('node-cron');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel
    ]
});

const lc = new LeetCode();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    cron.schedule('0 6 * * *', async () => {
        try {
            const daily = await lc.daily();
            const channel = client.channels.cache.get(process.env.CHANNEL_ID);
            if (channel) {
                const questionLink = `https://leetcode.com${daily.link}`;
                const response = `@everyone **LeetCode Daily Challenge Question for ${daily.date}:**\n**${daily.question.title}** : ${questionLink}`;
                channel.send(response);
            } else {
                console.error('Channel not found');
            }
        } catch (error) {
            console.error('Error fetching LeetCode daily challenge:', error);
        }
    });
});

client.on('messageCreate', async (message) => {
    if (message.content === '/potd') {
        try {
            const daily = await lc.daily();
            const questionLink = `https://leetcode.com${daily.link}`;
            const responseMessage = `@everyone **LeetCode Daily Challenge Question for ${daily.date}:**\n**${daily.question.title}** : ${questionLink}`;
            message.channel.send(responseMessage);
        } catch (error) {
            console.error('Error fetching LeetCode daily challenge:', error);
            message.channel.send('Sorry, I could not fetch the LeetCode daily challenge question.');
        }
    }
});

client.login(process.env.TOKEN);
