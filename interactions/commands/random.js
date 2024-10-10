import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import LeetCodeUtility from "../../utility/LeetCode.js";
import fs from 'fs'

export default {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Shows the LeetCode Daily Challenge')
        .addStringOption((option) => option
            .setName('difficulty')
            .setDescription('Mention how hard you want problem to be')
            .addChoices({ name: 'easy', value: '1' }, { name: 'medium', value: '2' }, { name: 'hard', value: '3' })
            .setRequired(true)
        ),
    run: async (interaction) => {
        await interaction.deferReply()
        const difficulty = parseInt(interaction.options.getString('difficulty'));

        let problems = JSON.parse(fs.readFileSync('./cache/problems.json'))

        if (!problems.length) { /** fetch problems and save them */
            problems = await LeetCodeUtility.fetchLeetCodeProblems();
            fs.writeFileSync('./cache/problems.json', JSON.stringify(problems))
        }

        let filteredProblems = problems.filter(problem => problem.difficulty.level === difficulty);

        if (filteredProblems.length === 0) {
            return await interaction
                .followUp(`Sorry, I couldn't find any LeetCode problems with the given difficulty level`);
        }

        const randomIndex = Math.floor(Math.random() * filteredProblems.length);
        const problem = filteredProblems[randomIndex].stat;
        const questionLink = `https://leetcode.com/problems/${problem.question__title_slug}/`;

        const embedColor = difficulty == 1 ? 0x00FF00 : difficulty == 2 ? 0xFFFF00 : 0xFF0000 

        const embed = new EmbedBuilder()
            .setTitle(`${problem.question__title}`)
            .setURL(questionLink)
            .setColor(embedColor)
            .addFields(
                { name: 'Difficulty', value: difficulty === 1 ? 'Easy' : difficulty === 2 ? 'Medium' : 'Hard', inline: true },
                { name: 'Link', value: `[Solve Problem](${questionLink})`, inline: true },
                { name: 'Acceptance Rate', value: `${problem.total_acs} / ${problem.total_submitted} (${(problem.total_acs / problem.total_submitted * 100).toFixed(2)}%)`, inline: true }
            )
            .setFooter({ text: 'Good luck!' });


        return interaction.followUp({ embeds: [ embed ]})
    }
}