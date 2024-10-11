import { SlashCommandBuilder } from "discord.js";
import LeetCodeUtility from "../../utility/LeetCode.js";


export default {
    data: new SlashCommandBuilder()
        .setName('streak')
        .setDescription('Shows user Streak Info')
        .addStringOption(
            (option) => option
                .setName('username')
                .setDescription('Unique username of user')
                .setRequired(true)
    ),
    run: async (interaction, lc=interaction.client.lc) => {
        await interaction.deferReply()

        const username = interaction.options.getString('username')
        const user = await lc.user(username);

        let streakInfo = 0;
        let hasSolvedToday = false;

        if (user.matchedUser) {
            ({ currentStreak: streakInfo, hasSolvedToday } = LeetCodeUtility.calculateStreak(user.matchedUser.submissionCalendar));
        }

        let streakMessage;
        if (streakInfo > 0) {
            if (hasSolvedToday) {
                streakMessage = `🎉  **${username}** has solved a problem for ${streakInfo} consecutive days! Great work, keep it up!  💪`;
            } else {
                streakMessage = `⚠️  **${username}** has solved a problem for ${streakInfo} consecutive days! Solve today's problem to maintain your streak and prevent it from resetting!  🔄`;
            }
        } else {
            streakMessage = `❌  **${username}** does not have a streak yet. Start solving problems today to build your streak!  🚀`;
        }

        return interaction.followUp(streakMessage);

    }
}