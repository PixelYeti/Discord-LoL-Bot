const fs = require('fs');

class DataFile {
  constructor() {
    // Load file from file system
    this.dataContents = {};
    this.load();
  }

  save() {
    fs.writeFileSync(process.env.DATA_FILE_LOC, JSON.stringify(this.dataContents));
  }

  load() {
    this.dataContents = JSON.parse(fs.readFileSync(process.env.DATA_FILE_LOC, { encoding: 'utf8', flag: 'r' }));
  }

  addUser(discordUserId, lolUserObj) {
    this.dataContents[discordUserId] = lolUserObj;
  }

  removeUser(discordUserId) {
    delete this.dataContents[discordUserId];
  }
}

module.exports = new DataFile();
