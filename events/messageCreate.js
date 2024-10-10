import { REST, Routes } from 'discord.js'

export default async (message, client=message.client) => {
    if (message.author.bot) return;

    const args = message.content.split(' ');
    const command = args[0].toLowerCase();

    if (command === ';register') {
        if (message.author.id !== process.env.DEVELOPER_ID) return;

        let type = args[1]
        if (type == 'guild') {
            let guildId = args[2] || message.guild.id

            const rest = new REST().setToken(process.env.TOKEN);
            await rest.put(
                Routes.applicationGuildCommands(client.user.id, guildId),
                { body: Array.from(client.commands.values()).map(cmd => cmd.data.toJSON()) }
            )
                .then(() => message.channel.send(`✅ Added (**${client.commands.size}**) commands in guild (\`${guildId}\`)`))
                .catch((error) => message.channel.send(`❌ Failed to register command due to: \`${error}\``))

        } else if (type == 'global') {
            const rest = new REST().setToken(process.env.TOKEN);
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: Array.from(client.commands.values()).map(cmd => cmd.data.toJSON()) }
            )
                .then(() => message.channel.send(`✅ Added (${client.commands.size}) commands to all the guilds, it may take time to show in all guilds.`))
                .catch((error) => message.channel.send(`❌ Failed to register command due to: \`${error}\``))
        } else {
            return message.channel.send(`Invalid Syntax, Use \`;register guild/global (guildId:optinal)\``)
        }
    }
}