import { EmbedBuilder, bold } from "discord.js";
import cron from 'node-cron'

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
}