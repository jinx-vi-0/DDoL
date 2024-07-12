import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { LeetCode } from 'leetcode-query';
import cron from 'node-cron';
import keepAlive from './keep_alive.js';
import dotenv from 'dotenv';
import leetcodeProblems from './problems.js';

dotenv.config();

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
                channel.send(response);
            } else {
                console.error('Channel not found');
            }
        } catch (error) {
            console.error('Error fetching LeetCode daily challenge:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const args = message.content.split(' ');
    const command = args[0].toLowerCase();

    if (command === ';potd') {
        try {
            const daily = await lc.daily();
            const questionLink = `https://leetcode.com${daily.link}`;
            const responseMessage = `**LeetCode Daily Challenge ${daily.date}:**\n**${daily.question.title}** : ${questionLink}`;
            message.channel.send(responseMessage);
        } catch (error) {
            console.error('Error fetching LeetCode daily challenge:', error);
            message.channel.send('Sorry, I could not fetch the LeetCode daily challenge question.');
        }
    } else if (command === ';random') {
        try {
            const randomIndex = Math.floor(Math.random() * leetcodeProblems.length);
            let problem = leetcodeProblems[randomIndex];
            let selectedProblem = problem.toLowerCase().replace(/ /g, '-');
            const questionLink = `https://leetcode.com/problems/${selectedProblem}`;
            const responseMessage = `**Problem:** **${problem}** :\n${questionLink}`;
            message.channel.send(responseMessage);
        } catch (error) {
            console.error('Error fetching random LeetCode question:', error);
            message.channel.send('Sorry, I could not fetch a random LeetCode question.');
        }
    } else if (command === ';user' && args.length === 2) {
        const username = args[1];
        try {
            const contestInfo = await lc.user_contest_info(username);
            const responseMessage = `username : **${username}**\nContest : ${contestInfo.userContestRanking.attendedContestsCount}\nRating : ${contestInfo.userContestRanking.rating}\nTop : ${contestInfo.userContestRanking.topPercentage}%\nBadge : ${contestInfo.userContestRanking.badge ? contestInfo.userContestRanking.badge : 'No badge'}`;
            message.channel.send(responseMessage);
        } catch (error) {
            console.error('Error fetching user info:', error);
            message.channel.send('Sorry, I could not fetch the user info.');
        }
    } else if (command === ';help') {
        const helpMessage = `**Available Commands:**\n
        \`;potd\` - Shows the LeetCode Daily Challenge\n
        \`;random\` - Shows a random LeetCode problem\n
        \`;user <username>\` - Shows user Info\n
        \`;help\` - Shows help message`;
        message.channel.send(helpMessage);
    }
});

keepAlive();

client.login(process.env.TOKEN);
