import { LeetCode } from "leetcode-query";
const lc = new LeetCode();
export default {
  name: "streak",
  description: "Check a user's streak.",
  aliases: ["commands", "cmds"], // Add aliases here
  async execute(client, message, args) {
    {
      if (args.length != 1) {
        return message.channel.send("Please provide a user.");
      }

      const username = args[0];
      console.log("Username:");
      try {
        const streakInfo = await lc.user(username);
        let streakMessage;
        if (streakInfo.consecutiveDays > 0) {
          streakMessage = `**${username}** has solved a problem for ${streakInfo.consecutiveDays} consecutive days! Keep it up!`;
        } else {
          streakMessage = `**${username}** does not have a streak yet. Start solving problems to build your streak!`;
        }
        message.channel.send(streakMessage);
      } catch (error) {
        console.error("Error fetching streak info:", error);
        message.channel.send("Sorry, I could not fetch the streak info.");
      }
    }
  },
};
