module.exports = async (client, msg, args) => {
  await msg.channel.send('**Damage Bot**\n'
    + '- `!dbhelp` - Shows this message\n'
    + '- `!outdamaged <player 1 name> v <player 2 name>` - Query the damage for a set of players based on their LoL summoner names');
};
