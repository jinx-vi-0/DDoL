import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { LeetCode } from 'leetcode-query';
import cron from 'node-cron';
import keepAlive from './keep_alive.js';
import dotenv from 'dotenv';
import leetcodeProblems from './problems.js';

dotenv.config();

const COMMAND_PREFIX = ';';
const TIMEZONE = "Asia/Kolkata";

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
                const response = `@everyone **LeetCode Daily Challenge ${daily.date}:**\n**${daily.question.title}** : ${questionLink}`;
                await channel.send(response);
            } else {
                console.error('Channel not found');
            }
        } catch (error) {
            console.error('Error fetching LeetCode daily challenge:', error.message);
        }
    }, {
        scheduled: true,
        timezone: TIMEZONE
    });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const args = message.content.split(' ');
    const command = args[0].toLowerCase();

    try {
        if (command === `${COMMAND_PREFIX}potd`) {
            const daily = await lc.daily();
            const questionLink = `https://leetcode.com${daily.link}`;
            const responseMessage = `**LeetCode Daily Challenge ${daily.date}:**\n**${daily.question.title}** : ${questionLink}`;
            await message.channel.send(responseMessage);
        } else if (command === `${COMMAND_PREFIX}random`) {
            const randomIndex = Math.floor(Math.random() * leetcodeProblems.length);
            const problem = leetcodeProblems[randomIndex];
            const selectedProblem = problem.toLowerCase().replace(/ /g, '-');
            const questionLink = `https://leetcode.com/problems/${selectedProblem}`;
            const responseMessage = `**Problem:** **${problem}** :\n${questionLink}`;
            await message.channel.send(responseMessage);
        } else if (command === `${COMMAND_PREFIX}user` && args.length === 2) {
            const username = args[1];
            const contestInfo = await lc.user_contest_info(username);
            const responseMessage = `username : **${username}**\nContest : ${contestInfo.userContestRanking.attendedContestsCount}\nRating : ${Math.round(contestInfo.userContestRanking.rating)}\nTop : ${contestInfo.userContestRanking.topPercentage}%\nBadge : ${contestInfo.userContestRanking.badge || 'No badge'}`;
            await message.channel.send(responseMessage);
        } else if (command === `${COMMAND_PREFIX}help`) {
            const helpMessage = `**Available Commands:**\n
            \`${COMMAND_PREFIX}potd\` - Shows the LeetCode Daily Challenge\n
            \`${COMMAND_PREFIX}random\` - Shows a random LeetCode problem\n
            \`${COMMAND_PREFIX}user <username>\` - Shows user info\n
            \`${COMMAND_PREFIX}help\` - Shows help message`;
            await message.channel.send(helpMessage);
        }
    } catch (error) {
        console.error('Error processing command:', error.message);
        await message.channel.send('An error occurred while processing your command.');
    }
});

keepAlive();

client.login(process.env.TOKEN);
