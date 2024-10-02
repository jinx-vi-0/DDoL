import { LeetCode } from "leetcode-query";
const lc = new LeetCode();

export default {
  name: "potd",
  description: "Shows the LeetCode Daily Challenge",
  async execute(client, message, args) {
    try {
      const daily = await lc.daily();
      const questionLink = `https://leetcode.com${daily.link}`;
      const responseMessage = `**LeetCode Daily Challenge ${daily.date}:**\n**${daily.question.title}** : ${questionLink}`;
      message.channel.send(responseMessage);
    } catch (error) {
      console.error("Error fetching LeetCode daily challenge:", error);
      message.channel.send(
        "Sorry, I could not fetch the LeetCode daily challenge question."
      );
    }
  },
};
