import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { LeetCode } from 'leetcode-query';

import KeepAlive from './utility/KeepAlive.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel
    ]
});

client.lc = new LeetCode()

client.commands = new Collection()
client.buttons = new Collection()

/**
 * Load all the slash commands
 */

fs.readdirSync('./interactions/commands').filter(file => file.endsWith('.js')).forEach(file => {
    import(`./interactions/commands/${file}`).then(({ default: command }) => {
        client.commands.set(command.data.name, command);
    }).catch(error => console.error(`Failed to load command ${file}:`, error));
});

fs.readdirSync('./interactions/buttons').filter(file => file.endsWith('.js')).forEach(file => {
    import(`./interactions/buttons/${file}`).then(({ default: button }) => {
        client.buttons.set(button.name, button);
    }).catch(error => console.error(`Failed to load button  ${file}:`, error));
});


/**
 * Load all events
 */
fs.readdirSync('./events').filter(file => file.endsWith('.js')).forEach((file) => {
    import(`./events/${file}`).then(({ default: event }) => {
        client.on(file.split(".")[0], (...args) => event(...args))
    })
})

KeepAlive();

client.login(process.env.TOKEN);
