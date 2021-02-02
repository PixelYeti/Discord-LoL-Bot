const Discord = require('discord.js');
const commands = require('./commands');

// require('./utils/dataFile');
require('dotenv').config();

const client = new Discord.Client();

client.once('ready', async () => {
  console.log('Ready!');
  await client.user.setPresence({ activity: { type: 'LISTENING', name: '!dbhelp' }, status: 'online' });
});

client.on('message', (msg) => commands(client, msg));

client.login(process.env.DISCORD_BOT_TOKEN);
