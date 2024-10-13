import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
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
        .setDescription('Shows a list of LeetCode topics to choose from')
        .addStringOption(
            (option) => option
                .setName('difficulty')
                .setDescription('Difficulty of the random question found based on topic')
                .addChoices(
                    { name: 'random', value: '0' },
                    { name: 'easy', value: '1' },
                    { name: 'medium', value: '2' },
                    { name: 'hard', value: '3' }
                )
                .setRequired(false)
        ),
    run: async (interaction) => {
        const difficulty = interaction.options.getString('difficulty') || '0'
        const chunkedTopics = LeetCodeUtility.chunkArray(topics, 5); 

        const rows = chunkedTopics.map(chunk =>
            new ActionRowBuilder().addComponents(
                chunk.map((topic) => 
                    new ButtonBuilder()
                        .setCustomId(`topic_${topics.indexOf(topic)}_${difficulty}`)
                        .setLabel(topic)
                        .setStyle(ButtonStyle.Secondary)
                )
            )
        );

        const embed = new EmbedBuilder()
            .setDescription('**Choose a topic to get a random question**')
            .setColor(0xfea116)

        return interaction.reply({ embeds: [ embed ], components: rows })
    }
}