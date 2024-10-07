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

function calculateStreak(submissionCalendar) {
    submissionCalendar = JSON.parse(submissionCalendar);
    const datesWithSubmissions = Object.entries(submissionCalendar)
        .filter(([ts, count]) => count > 0)
        .map(([ts]) => new Date(ts * 1000))
        .sort((a, b) => a - b); 
    
    if (datesWithSubmissions.length === 0) return 0;
 
    let currentStreak = 0;
    let hasSolvedToday = false;   
    const currentDate = new Date(); 
    const lastSubmissionDate = datesWithSubmissions[datesWithSubmissions.length - 1]; 
    // Check if the last submission was today
    if (lastSubmissionDate.setHours(0, 0, 0, 0) === currentDate.setHours(0, 0, 0, 0)) {
        hasSolvedToday = true;
        currentDate.setDate(currentDate.getDate() + 1);
    }
    // Calculate streak
    for (let i = datesWithSubmissions.length - 1; i >= 0; i--) {
        currentDate.setDate(currentDate.getDate() - 1);
        if (datesWithSubmissions[i].setHours(0, 0, 0, 0) === currentDate.setHours(0, 0, 0, 0)) {
            currentStreak += 1;
        } else {
            break;
        }
    }
    return {currentStreak, hasSolvedToday};
}

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
    } else if (command === ';user' && args.length === 2) {
        const username = args[1];
        try {
            const [userInfo, contestInfo] = await Promise.all([
                lc.user(username),
                lc.user_contest_info(username)
            ]);
            
            if (!userInfo.matchedUser) {
                message.channel.send(`User "${username}" not found.`);
                return;
            }
    
            const user = userInfo.matchedUser;
            const profile = user.profile;
            const submitStats = user.submitStats;
    
            const embed = new EmbedBuilder()
                .setColor('#FFD700')  // Gold color for the embed
                .setTitle(`LeetCode Profile: **${username}**`)
                .setThumbnail(profile.userAvatar)
                .addFields(
                    { name: '👤 Real Name', value: profile.realName || '*Not provided*', inline: true },
                    { name: '🏆 Ranking', value: profile.ranking ? profile.ranking.toString() : '*Not ranked*', inline: true },
                    { name: '🌍 Country', value: profile.countryName || '*Not provided*', inline: true },
                    { name: '🏢 Company', value: profile.company || '*Not provided*', inline: true },
                    { name: '🎓 School', value: profile.school || '*Not provided*', inline: true },
                    { name: '\u200B', value: '⬇️ **Problem Solving Stats**', inline: false },
                    { name: '🟢 Easy', value: `Solved: ${submitStats.acSubmissionNum[1].count} / ${submitStats.totalSubmissionNum[1].count}`, inline: true },
                    { name: '🟠 Medium', value: `Solved: ${submitStats.acSubmissionNum[2].count} / ${submitStats.totalSubmissionNum[2].count}`, inline: true },
                    { name: '🔴 Hard', value: `Solved: ${submitStats.acSubmissionNum[3].count} / ${submitStats.totalSubmissionNum[3].count}`, inline: true },
                    { name: '📊 Total', value: `Solved: ${submitStats.acSubmissionNum[0].count} / ${submitStats.totalSubmissionNum[0].count}`, inline: true }
                );
    
            // Add contest info
            if (contestInfo.userContestRanking) {
                embed.addFields(
                    { name: '🚩 **Contest Info**', value: `\`\`\`Rating: ${Math.round(contestInfo.userContestRanking.rating)}\nRanking: ${contestInfo.userContestRanking.globalRanking}\nTop: ${contestInfo.userContestRanking.topPercentage.toFixed(2)}%\nAttended: ${contestInfo.userContestRanking.attendedContestsCount}\`\`\`` }
                );
            }
    
            // Add badges if any
            if (user.badges && user.badges.length > 0) {
                const badgeNames = user.badges.map(badge => badge.displayName).join('\n•');
                embed.addFields({ name: '🏅 Badges', value: "•"+badgeNames, inline: false });
            }
    
            message.channel.send({ embeds: [embed] });
    
        } catch (error) {
            console.error('Error fetching user info:', error);
            message.channel.send('Sorry, I could not fetch the user info.');
        }
    } else if (command === ';streak' && args.length === 2) {
        const username = args[1];
        try {
            const user = await lc.user(username);
            let streakInfo = 0;
            let hasSolvedToday = false;
            if(user.matchedUser) {
                ({ currentStreak: streakInfo, hasSolvedToday } = calculateStreak(user.matchedUser.submissionCalendar));
            }
 
            let streakMessage;
            if (streakInfo > 0) {
                if (hasSolvedToday) {
                    streakMessage = `🎉  **${username}** has solved a problem for ${streakInfo} consecutive days! Great work, keep it up!  💪`;
                } else {
                    streakMessage = `⚠️  **${username}** has solved a problem for ${streakInfo} consecutive days! Solve today's problem to maintain your streak and prevent it from resetting!  🔄`;
                }
            } else {
                streakMessage = `❌  **${username}** does not have a streak yet. Start solving problems today to build your streak!  🚀`;
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
