import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import { LeetCode } from "leetcode-query";
import cron from "node-cron";
import keepAlive from "./keep_alive.js";
import dotenv from "dotenv";
import { loadCommands } from "./handler.js"; // Import the command handler
const lc = new LeetCode();
import axios from "axios";
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection(); // Initialize command collection

loadCommands(client); // Load commands

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Schedule the cron job for LeetCode daily challenge
  cron.schedule(
    "0 6 * * *",
    async () => {
      try {
        const daily = await lc.daily();
        const channel = client.channels.cache.get(process.env.CHANNEL_ID);
        if (channel) {
          const questionLink = `https://leetcode.com${daily.link}`;
          const response = `@everyone **LeetCode Daily Challenge ${daily.date}:**\n**${daily.question.title}** : ${questionLink}`;
          channel.send(response);
        } else {
          console.error("Channel not found");
        }
      } catch (error) {
        console.error("Error fetching LeetCode daily challenge:", error);
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith(";")) {
    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    console.log(`Received command: ${commandName}`);
    console.log("commandAlias:", client.commands);

    const command =
      client.commands.get(commandName) ||
      client.commands.find(
        (c) => c.aliases && c.aliases.includes(commandName.toLowerCase())
      );

    if (!command) return;
    if (command) {
      try {
        console.log("Executing command:", command.name);
        await command.execute(client, message, args);
      } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);
        message.reply("There was an error executing that command.");
      }
    }
  }
});

keepAlive();

client.login(process.env.TOKEN);
