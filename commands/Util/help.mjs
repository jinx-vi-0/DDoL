import { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from "discord.js";

export default {
  name: "help",
  description: "Displays a list of available commands and their descriptions.",
  aliases: ["commands", "cmds"], // Add aliases here
  async execute(client, message, args) {
    try {
      const { commands } = client;
      let perPage = 12; // Number of commands to display per page
      let page = parseInt(args[0]) || 1; // Get the requested page from arguments

      const totalPages = Math.ceil(commands.size / perPage);

      if (page < 1 || page > totalPages) {
        return message.reply(
          "Invalid page number. Please provide a valid page number."
        );
      }

      const helpEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Command List")
        .setDescription(
          "Here is a list of available commands and their descriptions:"
        )
        .setTimestamp();

      const fields = await getFieldsForPage(commands, page, perPage);
      helpEmbed.addFields(fields);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("Previous")
          .setStyle("Primary"),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Next")
          .setStyle("Primary"),
        new ButtonBuilder()
          .setCustomId("compact")
          .setLabel("All Commands")
          .setStyle("Primary")
      );

      const messageComponents = [row];

      const sentMessage = await message.channel.send({
        embeds: [helpEmbed],
        components: messageComponents,
      });

      const collector = sentMessage.createMessageComponentCollector({
        filter: (interaction) =>
          interaction.customId === "previous" ||
          interaction.customId === "compact" ||
          interaction.customId === "next",
        time: 300000,
        dispose: true,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.customId === "previous") {
          page = Math.max(page - 1, 1);
          const updatedFields = await getFieldsForPage(commands, page, perPage);
          helpEmbed.setFields(updatedFields);
          interaction.update({ embeds: [helpEmbed] });
        } else if (interaction.customId === "next") {
          page = Math.min(page + 1, totalPages);
          const updatedFields = await getFieldsForPage(commands, page, perPage);
          helpEmbed.setFields(updatedFields);
          interaction.update({ embeds: [helpEmbed] });
        } else if (interaction.customId === "compact") {
          const compactFields = await getCompactFields(commands);
          helpEmbed.spliceFields(0, helpEmbed.data.fields.length); // Clear all fields
          let description = "";
          console.log("compactFields:", compactFields);
          compactFields.forEach((field, index) => {
            description += `${field.name}, `;
          });
          helpEmbed.setDescription(description);
          interaction.update({ embeds: [helpEmbed] });
        }
      });
    } catch (error) {
      console.error("An error occurred:", error);
    }

    async function getFieldsForPage(commands, page, perPage) {
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const fields = [];

      const commandsArray = Array.from(client.commands.values());

      commandsArray.forEach((command, index) => {
        if (index >= startIndex && index < endIndex) {
          const field = {
            name: `**__${index + 1}. ${command.name}__**`,
            value: `**Description:** ${
              command.description || "No description provided"
            }\n**Aliases:** ${
              command.aliases &&
              Array.isArray(command.aliases) &&
              command.aliases.length > 0
                ? `${command.aliases.join(", ")}\n--------------------- `
                : "None\n ---------------------"
            }`,
            inline: false,
          };

          fields.push(field);
        }
      });

      return fields;
    }

    async function getCompactFields() {
      const fields = [];
      const commandsArray = Array.from(client.commands.values());

      commandsArray.forEach(async (command, index) => {
        const field = {
          name: `${command.name}`,
        };

        fields.push(field);
      });

      return fields;
    }
  },
};
