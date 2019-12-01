const axios = require('axios');
const { url, messageError: message, choicesMsg, todayWeek } = require('./constants');

class Parser {
  constructor() {
    this.url = url;
  }

  parseChoices(choices){
    return `${choicesMsg}\n` + choices.reduce((messageRes, { name }) => messageRes + name + '\n ', '');
  }

  parseDataTable({week, table}){
    let res = `${todayWeek} ${week} неделя \n`;

    for(let dayIndex = 2; dayIndex < table.length; dayIndex++ ) {
      for(let timeIndex = 0; timeIndex < table[dayIndex].length; timeIndex++ ) {
        const value = table[dayIndex][timeIndex];
        res += !timeIndex ? `День ${value} \n` :
          `${table[0][timeIndex]} ${table[1][timeIndex]} ${value} \n `
      }
    }
    return res
  }

  async scrapData(name) {
    const res = { message };
    const asuUrl = `${this.url}${encodeURIComponent(name)}`;
    try {
      const { data = {} } = await axios.get(asuUrl);
      const { choices = [], table = [] } = data;
      res.message = choices.length ? this.parseChoices(choices) : this.parseDataTable(table);
      return res;
    }
    catch (e) {
      console.error('error', e);
      return res
    }
  }
}

module.exports = new Parser();