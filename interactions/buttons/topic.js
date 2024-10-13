import { EmbedBuilder } from "discord.js";

const topics = [
    'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math',
    'Sorting', 'Greedy', 'Depth-First Search', 'Binary Search', 'Database',
    'Breadth-First Search', 'Tree', 'Matrix', 'Two Pointers', 'Bit Manipulation',
    'Stack', 'Design', 'Heap (Priority Queue)', 'Graph', 'Simulation'
];

export default {
    name: 'topic',
    run: async (interaction, lc = interaction.client.lc) => {
        await interaction.deferReply();

        const [,topicIndex,difficultyIndex] = interaction.customId.split("_")
        
        const difficulty = difficultyIndex === '0' ? null : difficultyIndex === '1' ? 'EASY' : difficultyIndex === '2' ? 'MEDIUM' : 'HARD' 
        const topic = topics[topicIndex]


        const topicQuestions = await lc.problems({
            categorySlug: '',
            skip: 0,
            limit: 300000,
            filters: { tags: [topic.toLowerCase().replace(/\s+/g, '-')], difficulty }
        });

        if (topicQuestions.questions.length === 0) {
            await interaction.editReply('No questions found for this topic.');
            return;
        }

        const randomQuestion = topicQuestions.questions[Math.floor(Math.random() * topicQuestions.questions.length)];

        const questionLink = `https://leetcode.com/problems/${randomQuestion.titleSlug}/`;
        const embed = new EmbedBuilder()
            .setTitle(`Random ${topic} Question: ${randomQuestion.title}`)
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