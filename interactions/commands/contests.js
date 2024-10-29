import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { createRequire } from 'module';
const require = createRequire(import.meta.url); 
const https = require('https'); 

function formatTimeLeft(contestTime) {
    const now = new Date();
    const contestDate = new Date(contestTime);
    const timeDiff = contestDate - now;

    if (timeDiff < 0) return "Contest has started";

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    let timeString = "";
    if (days > 0) timeString += `${days}d `;
    if (hours > 0) timeString += `${hours}h `;
    if (minutes > 0) timeString += `${minutes}m`;

    return timeString.trim() || "Less than a minute";
}

// Helper function to make an HTTPS GET request
function fetchData(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';

            // A chunk of data has been received
            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                // console.log("Raw response data:", data);

                try {
                    // Check if the content type is JSON or text
                    const contentType = response.headers['content-type'];
                    if (contentType && contentType.includes('application/json')) {
                        // If it's JSON, parse it directly
                        const parsedData = JSON.parse(data);
                        resolve(parsedData);
                    } else if (contentType && contentType.includes('text/plain')) {
                        // If it's plain text, attempt to parse as JSON-like string
                        const parsedData = JSON.parse(data);
                        resolve(parsedData);
                    } else {
                        console.error("Unexpected content type:", contentType);
                        reject(new Error('Response is not JSON or text'));
                    }
                } catch (error) {
                    console.error('Error parsing data:', error);
                    reject(new Error('Error parsing data'));
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}


export default {
    data: new SlashCommandBuilder()
        .setName('contests')
        .setDescription('Shows upcoming LeetCode contests'),
    run: async (interaction) => {
        await interaction.deferReply();

        try {
            const url = 'https://contest-hive.vercel.app/api/leetcode'; // Your HTTP URL
            const response = await fetchData(url);
            const contests = response.data;

            if (!contests || contests.length === 0) {
                return interaction.editReply('No upcoming contests found.');
            }

            const embed = new EmbedBuilder()
                .setTitle('Upcoming LeetCode Contests')
                .setColor(0xD1006C)
                .setDescription('Here are the upcoming LeetCode contests:')
                .setTimestamp();

            contests.forEach((contest, index) => {
                // Skip if contest has ended
                if (new Date(contest.startTime) < new Date()) return;

                // Clean up the URL by removing 'undefined'
                let cleanedUrl = contest.url ? contest.url.replace('undefined', '') : '';
                
                // Format contest duration to hours and minutes
                const duration = contest.duration / 60; 
                const hours = Math.floor(duration / 60);
                const minutes = duration % 60;
                const durationStr = `${hours}h ${minutes}m`;

                embed.addFields({
                    name: `${index + 1}. ${contest.title}`,
                    value: `
                        **Starts In:** ${formatTimeLeft(contest.startTime)}
                        **Duration:** ${durationStr}
                        **Date:** <t:${Math.floor(new Date(contest.startTime).getTime() / 1000)}:F>
                        **Link:** [Contest Link](https://leetcode.com/contest/${cleanedUrl})

                    `,
                    inline: false
                });
            });

            embed.setFooter({ 
                text: 'Pro Tip: Don\'t forget to register for the contests!'
            });

            return interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error fetching contests:', error);
            return interaction.editReply('Sorry, there was an error fetching the contest information. Please try again later.');
        }
    }
};
