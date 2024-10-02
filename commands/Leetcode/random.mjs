import leetcodeProblems from "../../problems.js";

export default {
  name: "random",
  description: "Shows a random LeetCode problem",
  aliases: ["rng"], // Add aliases here
  execute(client, message, args) {
    try {
      const randomIndex = Math.floor(Math.random() * leetcodeProblems.length);
      let problem = leetcodeProblems[randomIndex];
      let selectedProblem = problem.toLowerCase().replace(/ /g, "-");
      const questionLink = `https://leetcode.com/problems/${selectedProblem}`;
      const responseMessage = `**Problem:** **${problem}** :\n${questionLink}`;
      message.channel.send(responseMessage);
    } catch (error) {
      console.error("Error fetching random LeetCode question:", error);
      message.channel.send(
        "Sorry, I could not fetch a random LeetCode question."
      );
    }
  },
};
