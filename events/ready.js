import { EmbedBuilder, bold } from "discord.js";
import cron from 'node-cron'
import axios from "axios";


export default async (client, lc = client.lc) => {
    console.log(`Logged in as ${client.user.tag}!`);

    cron.schedule('0 6 * * *', async () => {
        const channel = client.channels.cache.get(process.env.CHANNEL_ID);
        if (!channel) return console.error(`Failed to find channel for daily challenge (${channel})`)

        const { question, link, date } = await lc.daily();

        const embed = new EmbedBuilder()
            .setTitle(question.title)
            .setURL(`https://leetcode.com${link}`)
            .setColor(0xfea116)
            .addFields(
                { name: 'Difficulty', value: question.difficulty, inline: true },
                { name: 'Link', value: `[Click Here](https://leetcode.com${link})`, inline: true },
                /* Show 3 topics in each line for better formatting */
                { name: 'Topic', value: question.topicTags.map((x, i) => (i % 3 === 0 && i !== 0 ? '\n' : '') + x.name).join(', ') }
            )

        return channel.send({
            content: bold(`@everyone, LeetCode Daily Challenge: \`${date}\``),
            embeds: [embed]
        })
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    })

   // New function to fetch upcoming contests
   async function getUpcomingContests() {
    try {
        const response = await axios.post('https://leetcode.com/graphql', {
            query: `{
                topTwoContests {
                    title
                    startTime
                    duration
                }
            }`
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });


        return response.data.data.topTwoContests.map(contest => ({
            ...contest,
            start_time: new Date(contest.startTime * 1000),
            href: `https://leetcode.com/contest/${contest.title.toLowerCase().replace(/\s+/g, '-')}`
        }));
        } catch (error) {
            console.error('Failed to fetch upcoming contests:', error);
            return [];
        }
    }


    // Function to schedule reminders for contests
    async function scheduleContestReminders() {
        const contests = await getUpcomingContests();
        // console.log("Working" , contests);
        contests.forEach(contest => {
            const reminderTime = new Date(contest.start_time.getTime() - 60 * 60 * 1000); // 1 hour before
            const now = new Date();


            if (reminderTime > now) {
                const delay = reminderTime.getTime() - now.getTime();
                console.log("Original Delay =>" , delay);
                setTimeout(() => sendContestReminder(contest), delay);
                console.log(`Scheduled reminder for ${contest.title} at ${reminderTime}`);
            }
        });
    }


    // Function to send contest reminder
    async function sendContestReminder(contest) {


        const embed = new EmbedBuilder()
            .setTitle(contest.title)
            .setURL(contest.href)
            .setColor(0xfea116)
            .addFields(
                { name: 'Start Time', value: contest.start_time.toUTCString(), inline: true },
                { name: 'Duration', value: `${contest.duration / 60} minutes`, inline: true },
                { name: 'Link', value: `[Join Contest](${contest.href})` }
            )
            .setFooter({ text: 'Contest starts in 1 hour!' });


        await client.guilds.cache.forEach(guild => {           
            guild.channels.cache.forEach(channel => {
                    if (channel.name == 'general'){
                        channel.send({
                            content: bold(`@everyone, Upcoming LeetCode Contest Reminder!`),
                            embeds: [embed]
                        });
                    }
            });
        });
    }


    // Schedule initial reminders
    await scheduleContestReminders();


    // Refresh contest schedule every Friday
    cron.schedule('0 0 * * 5', scheduleContestReminders, {
        scheduled: true,
        timezone: "UTC"
    });
}
