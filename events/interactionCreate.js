export default async (interaction, client=interaction.client) => {
    if (interaction.isCommand()) {
        let command = client.commands.get(interaction.commandName)
        if (!command) return;

        await command.run(interaction).catch((error) => {
            console.log(error)
            return interaction.channel.send(`❌ Failed to execute the command due to internal error`)
        })
    } else if(interaction.isButton()) {
        let button = client.buttons.get(interaction.customId.split("_")[0])
        if(!button) return;

        await button.run(interaction).catch((error) => {
            console.log(error)
            return interaction.channel.send(`❌ Failed to handle the interaction due to internal error`)
        })
    }
}