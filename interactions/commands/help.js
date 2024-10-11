import { SlashCommandBuilder, EmbedBuilder, CommandInteraction} from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get the list of commands available for use'),
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @returns 
     */
    run: async (interaction, client=interaction.client) => {
        const embed = new EmbedBuilder()
            .setDescription(`Hey __${interaction.user.displayName}__ 👋, I am a discord bot which integrates with LeetCode to provide daily challenges, random problems, user information, and more.\n`)
            .setColor(0xD1006C)
            .addFields(
                ...client.commands.map(command => ({ name: `> /${command.data.name}`, value: `${command.data.description}`, inline: true })),
                { name: '‎', value: 'Please consider giving me a ⭐ on GitHub ([DDoL](https://github.com/jinx-vi-0/DDoL)) to show your support!'}
            )
        return interaction.reply({ embeds: [ embed ] });
    }
}