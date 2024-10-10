import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('potd')
        .setDescription('Shows the LeetCode Daily Challenge'),
    run: async (interaction, lc=interaction.client.lc) => {
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

        return interaction.reply({ embeds: [embed] });
    }
}