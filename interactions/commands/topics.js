import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import LeetCodeUtility from "../../utility/LeetCode.js";

const topics = [
    'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math',
    'Sorting', 'Greedy', 'Depth-First Search', 'Binary Search', 'Database',
    'Breadth-First Search', 'Tree', 'Matrix', 'Two Pointers', 'Bit Manipulation',
    'Stack', 'Design', 'Heap (Priority Queue)', 'Graph', 'Simulation'
];

export default {
    data: new SlashCommandBuilder()
        .setName('topics')
        .setDescription('Shows a list of LeetCode topics to choose from'),
    run: async (interaction) => {
        const chunkedTopics = LeetCodeUtility.chunkArray(topics, 5); 

        const rows = chunkedTopics.map(chunk =>
            new ActionRowBuilder().addComponents(
                chunk.map(topic =>
                    new ButtonBuilder()
                        .setCustomId(`topic_${topic.toLowerCase().replace(/\s+/g, '-')}`)
                        .setLabel(topic)
                        .setStyle(ButtonStyle.Secondary)
                )
            )
        );

        return interaction.reply({ content: 'Choose a topic to get a random question:', components: rows })
    }
}