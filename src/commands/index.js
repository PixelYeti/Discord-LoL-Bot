const help = require('./help');
const outdamaged = require('./outdamaged');

const commands = {
  help,
  outdamaged,
};

module.exports = async (client, msg) => {
  const args = msg.content.split(' ');
  if (args.length === 0 || args[0].charAt(0) !== '!') return;
  const command = args.shift().substr(1);

  if (Object.keys(commands).includes(command)) {
    commands[command](client, msg, args);
  }
};
