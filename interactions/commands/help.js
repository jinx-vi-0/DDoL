import { SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get the list of commands available for use'),
    run: async (interaction) => {
        const helpMessage = `**Available Commands:**\n
        \`/potd\` - Shows the LeetCode Daily Challenge\n
        \`/random [difficulty]\` - Shows a random LeetCode problem (optional: specify difficulty)\n
        \`/user <username>\` - Shows user Info\n
        \`/streak <username>\` - Shows user Streak Info\n
        \`/topics\` - Shows a list of LeetCode topics to choose from\n
        \`/help\` - Shows this help message`;
        return interaction.reply({ content: helpMessage});
    }
}