const axios = require('axios');

const intDivide = (a, b) => (a / b) >> 0;

const get = (path) => axios.request({
  url: path,
  headers: {
    Accepts: 'application/json',
    'X-Riot-Token': process.env.RIOT_API_TOKEN,
  },
  method: 'GET',
});

const put = (path, body) => axios.request({
  url: path,
  headers: {
    Accepts: 'application/json',
    'Content-Type': 'application/json',
    'X-Riot-Token': process.env.RIOT_API_TOKEN,
  },
  data: JSON.stringify(body),
  method: 'PUT',
});

const post = (path, body) => axios.post({
  url: path,
  headers: {
    Accepts: 'application/json',
    'Content-Type': 'application/json',
    'X-Riot-Token': process.env.RIOT_API_TOKEN,
  },
  data: JSON.stringify(body),
  method: 'POST',
});

const _delete = (path) => axios.delete({
  url: path,
  headers: {
    Accepts: 'application/json',
    'X-Riot-Token': process.env.RIOT_API_TOKEN,
  },
  method: 'DELETE',
});

const rejectNon2xxResponses = (promise) => promise.then(
  (response) => (intDivide(response.status, 100) === 2 ? response
    : Promise.reject(response)),
);

const convertToJson = (promise) => promise.then((data) => data.json());

const getSummonerByName = (name) => rejectNon2xxResponses(
  get(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}`),
);

const getMatchList = (accountId, beginIndex = 0, endIndex = 100) => rejectNon2xxResponses(
  get(`https://euw1.api.riotgames.com/lol/match/v4/matchlists/by-account/${accountId}?beginIndex=${beginIndex}&endIndex=${endIndex}`),
);

const getMatchInfo = (matchId) => rejectNon2xxResponses(
  get(`https://euw1.api.riotgames.com/lol/match/v4/matches/${matchId}`),
);

module.exports = {
  convertToJson, getSummonerByName, getMatchList, getMatchInfo,
};
