export default {
  name: "help",
  description: "List all available commands",
  execute(client, message, args) {
    const helpMessage = `**Available Commands:**\n
          \`;potd\` - Shows the LeetCode Daily Challenge\n
          \`;random\` - Shows a random LeetCode problem\n
          \`;user <username>\` - Shows user Info\n
          \`;help\` - Shows help message`;

    message.channel.send(helpMessage);
  },
};
