import axios from 'axios'

function calculateStreak(submissionCalendar) {
    submissionCalendar = JSON.parse(submissionCalendar);

    const datesWithSubmissions = Object.entries(submissionCalendar)
        .filter(([ts, count]) => count > 0)
        .map(([ts]) => new Date(ts * 1000))
        .sort((a, b) => a - b);

    if (datesWithSubmissions.length === 0) return 0;

    let currentStreak = 0;
    let hasSolvedToday = false;
    const currentDate = new Date();
    const lastSubmissionDate = datesWithSubmissions[datesWithSubmissions.length - 1];
    // Check if the last submission was today
    if (lastSubmissionDate.setHours(0, 0, 0, 0) === currentDate.setHours(0, 0, 0, 0)) {
        hasSolvedToday = true;
        currentDate.setDate(currentDate.getDate() + 1);
    }
    // Calculate streak
    for (let i = datesWithSubmissions.length - 1; i >= 0; i--) {
        currentDate.setDate(currentDate.getDate() - 1);
        if (datesWithSubmissions[i].setHours(0, 0, 0, 0) === currentDate.setHours(0, 0, 0, 0)) {
            currentStreak += 1;
        } else {
            break;
        }
    }
    return { currentStreak, hasSolvedToday };
}

async function fetchLeetCodeProblems() {
    try {
        const response = await axios.get('https://leetcode.com/api/problems/all/');
        return response.data.stat_status_pairs.filter(problem => !problem.paid_only);
    } catch (error) {
        console.error('Error fetching LeetCode problems:', error);
    }
}

function chunkArray(array, size) {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
        chunked.push(array.slice(i, i + size));
    }
    return chunked;
}


export default {
    calculateStreak,
    fetchLeetCodeProblems,
    chunkArray
}