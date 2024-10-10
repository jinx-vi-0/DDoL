import { EmbedBuilder } from "discord.js";

export default {
    name: 'topic',
    run: async (interaction, lc = interaction.client.lc) => {
        const selectedTopic = interaction.customId.replace('topic_', '');
        await interaction.deferReply();

        const topicQuestions = await lc.problems({
            categorySlug: '',
            skip: 0,
            limit: 300000,
            filters: { tags: [selectedTopic] }
        });

        if (topicQuestions.questions.length === 0) {
            await interaction.editReply('No questions found for this topic.');
            return;
        }

        const randomQuestion = topicQuestions.questions[Math.floor(Math.random() * topicQuestions.questions.length)];

        const questionLink = `https://leetcode.com/problems/${randomQuestion.titleSlug}/`;
        const embed = new EmbedBuilder()
            .setTitle(`Random ${selectedTopic.replace(/-/g, ' ')} Question: ${randomQuestion.title}`)
            .setURL(questionLink)
            .setColor(0x0099FF)
            .addFields(
                { name: 'Difficulty', value: randomQuestion.difficulty, inline: true },
                { name: 'Link', value: `[Solve Problem](${questionLink})`, inline: true },
                { name: 'Acceptance Rate', value: `${randomQuestion.acRate.toFixed(2)}%`, inline: true }
            )
            .setFooter({ text: 'Good luck solving this problem!' });

        await interaction.editReply({ embeds: [embed], components: [] });
    }
}