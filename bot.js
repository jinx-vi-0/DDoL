import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { LeetCode } from 'leetcode-query';
import cron from 'node-cron';
import keepAlive from './keep_alive.js';
import dotenv from 'dotenv';
import leetcodeProblems from './problems.js';

dotenv.config();

// Create a new Discord client
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

    // Schedule daily LeetCode challenge message at 6 AM IST
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

    // Daily Problem of the Day (POTD)
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
    }

    // Random LeetCode Problem
    else if (command === ';random') {
        try {
            if (leetcodeProblems.length === 0) {
                return message.channel.send('No LeetCode problems available.');
            }
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
    }

    // LeetCode User Info
    else if (command === ';user' && args.length === 2) {
        const username = args[1];
        try {
            const contestInfo = await lc.user_contest_info(username);
            if (!contestInfo.userContestRanking) {
                return message.channel.send(`No contest data found for user: **${username}**`);
            }
            const responseMessage = `username : **${username}**\nContest : ${contestInfo.userContestRanking.attendedContestsCount}\nRating : ${Math.round(contestInfo.userContestRanking.rating)}\nTop : ${contestInfo.userContestRanking.topPercentage}%\nBadge : ${contestInfo.userContestRanking.badge ? contestInfo.userContestRanking.badge : 'No badge'}`;
            message.channel.send(responseMessage);
        } catch (error) {
            console.error('Error fetching user info:', error);
            message.channel.send('Sorry, I could not fetch the user info.');
        }
    }

    // Compare Two Users
    else if (command === ';compare' && args.length === 3) {
        const user1 = args[1];
        const user2 = args[2];
        try {
            const user1Info = await lc.user_contest_info(user1);
            const user2Info = await lc.user_contest_info(user2);

            if (!user1Info.userContestRanking || !user2Info.userContestRanking) {
                return message.channel.send(`Unable to find contest data for both users.`);
            }

            const responseMessage = `**Comparison of ${user1} and ${user2}:**\n
            **${user1}**:
            - Contests Attended: ${user1Info.userContestRanking.attendedContestsCount}
            - Rating: ${Math.round(user1Info.userContestRanking.rating)}
            - Top Percentage: ${user1Info.userContestRanking.topPercentage}%
            - Badge: ${user1Info.userContestRanking.badge ? user1Info.userContestRanking.badge : 'No badge'}

            **${user2}**:
            - Contests Attended: ${user2Info.userContestRanking.attendedContestsCount}
            - Rating: ${Math.round(user2Info.userContestRanking.rating)}
            - Top Percentage: ${user2Info.userContestRanking.topPercentage}%
            - Badge: ${user2Info.userContestRanking.badge ? user2Info.userContestRanking.badge : 'No badge'}`;
            message.channel.send(responseMessage);
        } catch (error) {
            console.error('Error comparing users:', error);
            message.channel.send('Sorry, I could not compare the users.');
        }
    }

    // LeetCode Streak
    else if (command === ';streak' && args.length === 2) {
        const username = args[1];
        try {
            const userInfo = await lc.user_profile(username);
            const streak = userInfo.streak;
            message.channel.send(`**${username}** is on a **${streak}** day streak!`);
        } catch (error) {
            console.error('Error fetching streak:', error);
            message.channel.send('Sorry, I could not fetch the streak.');
        }
    }

    // LeetCode Leaderboard
    else if (command === ';leaderboard') {
        // Implement leaderboard based on a custom data structure or LeetCode API if available.
        message.channel.send('Leaderboard feature is under construction.');
    }

    // Help Command
    else if (command === ';help') {
        const helpMessage = `**Available Commands:**\n
        \`;potd\` - Shows the LeetCode Daily Challenge\n
        \`;random\` - Shows a random LeetCode problem\n
        \`;user <username>\` - Shows user Info\n
        \`;compare <user1> <user2>\` - Compares two users\n
        \`;help\` - Shows help message`;
        message.channel.send(helpMessage);
    }
});

// Keep the bot running with Express
keepAlive();

// Login the bot with the token
client.login(process.env.TOKEN);
