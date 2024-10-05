import leetcodeProblems2 from "../../problems.js";
let leetcodeProblems = [];
import axios from "axios";
async function fetchLeetCodeProblems() {
  try {
    const response = await axios.get("https://leetcode.com/api/problems/all/");
    leetcodeProblems = response.data.stat_status_pairs.filter(
      (problem) => !problem.paid_only
    );
  } catch (error) {
    console.error("Error fetching LeetCode problems:", error);
  }
}
export default {
  name: "random",
  description: "Shows a random LeetCode problem",
  aliases: ["rng"], // Add aliases here
  async execute(client, message, args) {
    try {
      let difficulty = args[1] ? args[1].toLowerCase() : null;
      const difficultyLevel = { easy: 1, medium: 2, hard: 3 };
      if (leetcodeProblems.length === 0) {
        await fetchLeetCodeProblems();
      }
      let filteredProblems = leetcodeProblems;

      // If difficulty is provided, filter problems by difficulty
      if (difficulty && difficultyLevel[difficulty]) {
        filteredProblems = leetcodeProblems.filter(
          (problem) => problem.difficulty.level === difficultyLevel[difficulty]
        );
      }
      // If no problems match the difficulty, notify the user
      if (filteredProblems.length === 0) {
        message.channel.send(
          `Sorry, I couldn't find any LeetCode problems with the specified difficulty level: ${difficulty}`
        );
        return;
      }

      const randomIndex = Math.floor(Math.random() * filteredProblems.length);
      const problem = filteredProblems[randomIndex].stat;
      console.log("problem:", problem);
      const questionLink = `https://leetcode.com/problems/${problem.question__title_slug}/`;
      const responseMessage = `**Problem:** **${problem.question__title}** :\n${questionLink} `;

      message.channel.send(responseMessage);
    } catch (error) {
      console.error("Error fetching random LeetCode question:", error);
      message.channel.send(
        "Sorry, I could not fetch a random LeetCode question."
      );
    }
  },
};
