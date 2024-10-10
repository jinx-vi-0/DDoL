import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription(' Shows user Info')
        .addStringOption(
            (option) => option
                .setName('username')
                .setDescription('Unique username of user')
                .setRequired(true)
        ),
    run: async (interaction, lc=interaction.client.lc) => {
        await interaction.deferReply()
        const username = interaction.options.getString('username')

        const [userInfo, contestInfo] = await Promise.all([
            lc.user(username),
            lc.user_contest_info(username)
        ]);

        if (!userInfo.matchedUser) {
            return interaction.followUp({ content: `User "${username}" not found.`});
        }

        const user = userInfo.matchedUser;
        const profile = user.profile;
        const submitStats = user.submitStats;

        const embed = new EmbedBuilder()
            .setColor('#FFD700')  // Gold color for the embed
            .setTitle(`LeetCode Profile: **${username}**`)
            .setThumbnail(profile.userAvatar)
            .addFields(
                { name: '👤 Real Name', value: profile.realName || '*Not provided*', inline: true },
                { name: '🏆 Ranking', value: profile.ranking ? profile.ranking.toString() : '*Not ranked*', inline: true },
                { name: '🌍 Country', value: profile.countryName || '*Not provided*', inline: true },
                { name: '🏢 Company', value: profile.company || '*Not provided*', inline: true },
                { name: '🎓 School', value: profile.school || '*Not provided*', inline: true },
                { name: '\u200B', value: '⬇️ **Problem Solving Stats**', inline: false },
                { name: '🟢 Easy', value: `Solved: ${submitStats.acSubmissionNum[1].count} / ${submitStats.totalSubmissionNum[1].count}`, inline: true },
                { name: '🟠 Medium', value: `Solved: ${submitStats.acSubmissionNum[2].count} / ${submitStats.totalSubmissionNum[2].count}`, inline: true },
                { name: '🔴 Hard', value: `Solved: ${submitStats.acSubmissionNum[3].count} / ${submitStats.totalSubmissionNum[3].count}`, inline: true },
                { name: '📊 Total', value: `Solved: ${submitStats.acSubmissionNum[0].count} / ${submitStats.totalSubmissionNum[0].count}`, inline: true }
            );

        if (contestInfo.userContestRanking) {
            embed.addFields(
                { name: '🚩 **Contest Info**', value: `\`\`\`Rating: ${Math.round(contestInfo.userContestRanking.rating)}\nRanking: ${contestInfo.userContestRanking.globalRanking}\nTop: ${contestInfo.userContestRanking.topPercentage.toFixed(2)}%\nAttended: ${contestInfo.userContestRanking.attendedContestsCount}\`\`\`` }
            );
        }

        if (user.badges && user.badges.length > 0) {
            const badgeNames = user.badges.map(badge => badge.displayName).join('\n•');
            embed.addFields({ name: '🏅 Badges', value: "•" + badgeNames, inline: false });
        }

        return interaction.followUp({ embeds: [ embed ]})
    }
}