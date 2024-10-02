import { LeetCode } from "leetcode-query";
const lc = new LeetCode();

export default {
  name: "user",
  description: "Fetch LeetCode user information",
  aliases: ["profile"], // Add aliases here
  async execute(client, message, args) {
    if (args.length !== 1) {
      return message.channel.send("Please provide a valid LeetCode username.");
    }

    const username = args[0];

    try {
      const contestInfo = await lc.user_contest_info(username);
      const responseMessage = `username : **${username}**\nContest : ${
        contestInfo.userContestRanking.attendedContestsCount
      }\nRating : ${Math.round(contestInfo.userContestRanking.rating)}\nTop : ${
        contestInfo.userContestRanking.topPercentage
      }%\nBadge : ${
        contestInfo.userContestRanking.badge
          ? contestInfo.userContestRanking.badge
          : "No badge"
      }`;
      message.channel.send(responseMessage);
    } catch (error) {
      console.error("Error fetching user info:", error);
      message.channel.send("Sorry, I could not fetch the user info.");
    }
  },
};
