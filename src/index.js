const Discord = require('discord.js');
const { getSummonerByName, getMatchList, getMatchInfo } = require('./utils/rest');

require('dotenv').config();

const client = new Discord.Client();

client.once('ready', () => {
  console.log('Ready!');
});

const messageRegex = /^(.*?)\sv\s(.*?)$/gi;

client.on('message', async (message) => {
  const users = {};

  if (!message.content.startsWith('!outdamaged')) {
    return;
  }

  const stripped = message.content.split('!outdamaged ')[1];
  const groups = messageRegex.exec(stripped);

  const summonerPromises = groups.slice(1, 3).map(
    (username) => getSummonerByName(encodeURI(username)),
  );

  const summonerResponses = await Promise.allSettled(summonerPromises);
  const erroredSummoners = summonerResponses.filter(
    (resp) => resp.status === 'rejected',
  );
  if (erroredSummoners.length > 0) {
    await message.channel.send('Unable to retrieve summoner information');
    return;
  }

  const userObjs = summonerResponses.filter(
    (resp) => resp.status === 'fulfilled',
  ).map((resp) => resp.value.data);
  userObjs.forEach((user) => {
    users[user.accountId] = {
      user,
      highestDamage: 0,
      totalDamage: 0,
    };
  });

  const matchResponses = await Promise.allSettled(
    userObjs.map((user) => getMatchList(user.accountId)),
  );
  const erroredMatches = matchResponses.filter(
    (resp) => resp.status === 'rejected',
  );

  if (erroredMatches.length > 0) {
    await message.channel.send(JSON.stringify(userObjs));
    return;
  }

  // Get last 8 shared matches
  const matchIdsOne = matchResponses.filter(
    (resp) => resp.status === 'fulfilled',
  )[0].value.data.matches.map(
    (match) => match.gameId,
  );
  const matchIdsTwo = matchResponses.filter(
    (resp) => resp.status === 'fulfilled',
  )[1].value.data.matches.map(
    (match) => match.gameId,
  );

  let commonGameIds = matchIdsOne.filter((id) => matchIdsTwo.includes(id));
  if (commonGameIds.length === 0) {
    await message.channel.send(
      'Cannot find common matches for the two players in their last 100 games',
    );
    return;
  }

  commonGameIds = commonGameIds.slice(0, Math.min(8, commonGameIds.length));

  const matchObjResponses = await Promise.allSettled(
    commonGameIds.map((matchId) => getMatchInfo(matchId)),
  );
  const erroredMatchObjResponses = matchObjResponses.filter(
    (resp) => resp.status === 'rejected',
  );
  if (erroredMatchObjResponses.length > 0) {
    await message.channel.send('Error retrieving match information');
    return;
  }

  matchObjResponses.filter((resp) => resp.status === 'fulfilled')
    .forEach((resp) => {
      const matchObj = resp.value.data;
      const userOne = matchObj.participantIdentities.find(
        (identity) => identity.player.accountId === Object.keys(users)[0],
      );
      const userTwo = matchObj.participantIdentities.find(
        (identity) => identity.player.accountId === Object.keys(users)[1],
      );

      // Search participants and get damage
      const userOneTotalDamage = matchObj.participants
        .find((participant) => participant.participantId === userOne.participantId)
        .stats
        .totalDamageDealt;

      const userTwoTotalDamage = matchObj.participants
        .find((participant) => participant.participantId === userTwo.participantId)
        .stats
        .totalDamageDealt;

      users[userOne.player.accountId].totalDamage += userOneTotalDamage;
      users[userTwo.player.accountId].totalDamage += userTwoTotalDamage;

      if (userOneTotalDamage > userTwoTotalDamage) {
        users[userOne.player.accountId].highestDamage += 1;
      } else if (userTwoTotalDamage > userOneTotalDamage) {
        users[userTwo.player.accountId].highestDamage += 1;
      }
    });

  const userKeys = Object.keys(users);

  let stringBuilder = '';

  stringBuilder += `In ${users[userKeys[0]].user.name} and ${users[userKeys[1]].user.name} last ${commonGameIds.length} games together`;

  let maxUserAccountId;
  if (users[userKeys[0]].highestDamage > users[userKeys[1]].highestDamage) {
    maxUserAccountId = userKeys[0];
  } else if (users[userKeys[1]].highestDamage
      > users[userKeys[0]].highestDamage) {
    maxUserAccountId = userKeys[1];
  }

  if (maxUserAccountId === undefined) {
    stringBuilder += '\nThey have both done the exact same amount of damage!';
  } else {
    stringBuilder += `\n${users[maxUserAccountId].user.name} has done more damage in ${users[maxUserAccountId].highestDamage} of those games!`;
  }

  stringBuilder += `\n\nTotal Damage:\n${users[Object.keys(
    users,
  )[0]].user.name} - ${users[Object.keys(
    users,
  )[0]].totalDamage}\n${users[Object.keys(
    users,
  )[1]].user.name} - ${users[userKeys[1]].totalDamage}`;

  await message.channel.send(stringBuilder);
});

client.login(process.env.DISCORD_BOT_TOKEN);
