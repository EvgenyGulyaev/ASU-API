const axios = require('axios');
const { url, messageError: message, choicesMsg, todayWeek } = require('./constants');

class Parser {
  constructor() {
    this.url = url;
    this.keyboard = {};
  }

  parseChoices(choices) {
    const buttons = choices.map(({ name }) => ({
      action: {
        type: 'text',
        payload: {
          button: name,
        },
        label: name
      },
      color: 'primary',
    }));
    this.keyboard = {
      one_time: false,
      buttons
    };
    return `${choicesMsg}\n`;
  }

  parseDataTable({ week, table }) {
    this.keyboard = {};
    let res = `${todayWeek} ${week} неделя \n`;

    for (let dayIndex = 2; dayIndex < table.length; dayIndex++) {
      for (let timeIndex = 0; timeIndex < table[dayIndex].length; timeIndex++) {
        const value = table[dayIndex][timeIndex];
        res += !timeIndex ? `День ${value} \n` :
          `${table[0][timeIndex]} ${table[1][timeIndex]} ${value} \n `
      }
    }
    return res
  }

  async scrapData(name) {
    const res = { message, keyboard: {} };
    const asuUrl = `${this.url}${encodeURIComponent(name)}`;
    try {
      const { data = {} } = await axios.get(asuUrl);
      const { choices = [], table = [] } = data;
      res.message = choices.length ? this.parseChoices(choices) : this.parseDataTable(table);
      res.keyboard = this.keyboard;
      return res;
    }
    catch (e) {
      console.error('error', e);
      return res
    }
  }
}

module.exports = new Parser();