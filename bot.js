import { Client, GatewayIntentBits, Partials,EmbedBuilder } from 'discord.js';
import { LeetCode } from 'leetcode-query';
import cron from 'node-cron';
import keepAlive from './keep_alive.js';
import axios from 'axios';
import dotenv from 'dotenv';

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

async function fetchLeetCodeProblems() {
    try {
        const response = await axios.get('https://leetcode.com/api/problems/all/');
        leetcodeProblems = response.data.stat_status_pairs.filter(problem => !problem.paid_only);
    } catch (error) {
        console.error('Error fetching LeetCode problems:', error);
    }
}


const lc = new LeetCode();
let leetcodeProblems = []

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
    
            const embed = new EmbedBuilder()
                .setTitle(`LeetCode Daily Challenge - ${daily.date}`)
                .setURL(questionLink)
                .setDescription(`**${daily.question.title}**`)
                .setColor(0xD1006C)
                .addFields(
                    { name: 'Difficulty', value: daily.question.difficulty, inline: true },
                    { name: 'Link', value: `[Click here](${questionLink})`, inline: true }
                )
                .setFooter({ text: 'Good luck solving today\'s problem!' });
    
            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching LeetCode daily challenge:', error);
            message.channel.send('Sorry, I could not fetch the LeetCode daily challenge question.');
        }
    } else if (command === ';random') {
        try {
            let difficulty = args[1] ? args[1].toLowerCase() : null;
            const difficultyLevel = { 'easy': 1, 'medium': 2, 'hard': 3 };
            const difficultyColors = { 'easy': 0x00FF00, 'medium': 0xFFFF00, 'hard': 0xFF0000 }; // Green, Yellow, Red
    
            if (leetcodeProblems.length === 0) {
                await fetchLeetCodeProblems();
            }
    
            let filteredProblems = leetcodeProblems;
    
            if (difficulty && difficultyLevel[difficulty]) {
                filteredProblems = leetcodeProblems.filter(problem => problem.difficulty.level === difficultyLevel[difficulty]);
            }
    
            if (filteredProblems.length === 0) {
                message.channel.send(`Sorry, I couldn't find any LeetCode problems with the specified difficulty level: ${difficulty}`);
                return;
            }
    
            const randomIndex = Math.floor(Math.random() * filteredProblems.length);
            const problem = filteredProblems[randomIndex].stat;
            const questionLink = `https://leetcode.com/problems/${problem.question__title_slug}/`;

            const embedColor = difficulty ? difficultyColors[difficulty] : 0x7289DA; // Default is Discord's blue

            const embed = new EmbedBuilder()
                .setTitle(`${problem.question__title}`)
                .setURL(questionLink)
                .setColor(embedColor)
                .addFields(
                    { name: 'Difficulty', value: difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : 'N/A', inline: true },
                    { name: 'Link', value: `[Solve Problem](${questionLink})`, inline: true },
                    { name: 'Acceptance Rate', value: `${problem.total_acs} / ${problem.total_submitted} (${(problem.total_acs / problem.total_submitted * 100).toFixed(2)}%)`, inline: true }
                )
                .setFooter({ text: 'Good luck!' });
    
            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching random LeetCode question:', error);
            message.channel.send('Sorry, I could not fetch a random LeetCode question.');
        }
    }else if (command === ';user' && args.length === 2) {
        const username = args[1];
        try {
            const contestInfo = await lc.user_contest_info(username);
            const responseMessage = `username : **${username}**\nContest : ${contestInfo.userContestRanking.attendedContestsCount}\nRating : ${Math.round(contestInfo.userContestRanking.rating)}\nTop : ${contestInfo.userContestRanking.topPercentage}%\nBadge : ${contestInfo.userContestRanking.badge ? contestInfo.userContestRanking.badge : 'No badge'}`;
            message.channel.send(responseMessage);
        } catch (error) {
            console.error('Error fetching user info:', error);
            message.channel.send('Sorry, I could not fetch the user info.');
        }
    } else if (command === ';streak' && args.length === 2) {
        const username = args[1];
        try {
            const streakInfo = await lc.user(username);
            let streakMessage;
            if (streakInfo.consecutiveDays > 0) {
                streakMessage = `**${username}** has solved a problem for ${streakInfo.consecutiveDays} consecutive days! Keep it up!`;
            } else {
                streakMessage = `**${username}** does not have a streak yet. Start solving problems to build your streak!`;
            }
            message.channel.send(streakMessage);
        } catch (error) {
            console.error('Error fetching streak info:', error);
            message.channel.send('Sorry, I could not fetch the streak info.');
        }
    }
    else if (command === ';help') {
        const helpMessage = `**Available Commands:**\n
        \`;potd\` - Shows the LeetCode Daily Challenge\n
        \`;random\` - Shows a random LeetCode problem\n
        \`;user <username>\` - Shows user Info\n
        \`;streak <username>\` - Shows user Streak Info
        \`;help\` - Shows help message`;
        message.channel.send(helpMessage);
    }
});

keepAlive();

client.login(process.env.TOKEN);
