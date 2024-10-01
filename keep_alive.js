// keep_alive.js
import express from 'express';

const app = express();

// Route to keep the bot running
app.get('/', (req, res) => {
    res.send('Bot is running!');
});

// Listen on port
const keepAlive = () => {
    app.listen(3000, () => {
        console.log('Server is ready.');
    });
};

export default keepAlive;
