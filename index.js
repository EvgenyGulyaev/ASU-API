const axios = require('axios');
const _sortBy = require('lodash/sortBy');
const _chunk = require('lodash/chunk');
const { url, messageError: message, choicesMsg, todayWeek } = require('./constants');
const { gem, calendar, currentGroup, free } = require('./emojis')

const sort = (name) => {
  const [first, second] = name.split('-');
  return (+first[first.length - 1] * 100) + +second;
};

class Parser {
  constructor() {
    this.url = `${url}query=`;
    this.keyboard = {};
  }

  parseChoices(choices) {
    const sortedChoices = _sortBy(choices, [({ name }) => sort(name)]);
    const buttons = sortedChoices.map(({ name }, i) => ({
      action: {
        type: 'text',
        payload: { button: `${i} button` },
        label: name
      },
      color: 'primary',
    }));
    this.keyboard = {
      one_time: true,
      buttons: _chunk(buttons, 4)
    };
    return choicesMsg;
  }

  parseDataTable({ week, table, name }) {
    this.keyboard = {};
    let res = `${currentGroup} Ваш запрос: ${name} ${currentGroup} \n`;
    res += `${calendar} ${todayWeek} ${week} неделя семестра ${calendar} \n \n`;

    for (let dayIndex = 2; dayIndex < table.length; dayIndex++) {
      for (let timeIndex = 0; timeIndex < table[dayIndex].length; timeIndex++) {
        const value = table[dayIndex][timeIndex] || `${free} ${free} ${free}`;
        res += !timeIndex ? `${gem} ${value} ${gem} \n` :
          `${table[0][timeIndex]} ${table[1][timeIndex]} ${value} \n `
      }
      res+= '\n'
    }
    return res
  }

  async generateUrl(name) {
    const asuUrl = `${this.url}${encodeURIComponent(name)}`;
    if (+name.split('-')[1] === 1) {
      const { data = {} } = await axios.get(asuUrl);
      const { choices = [] } = data;
      const { group } = choices.find(({ name }) => +name.split('-')[1] === 1);
      return `${url}group=${group}`;
    }
    return asuUrl;
  }

  async scrapData(name) {
    const res = { message, keyboard: {} };
    const reqUrl = await this.generateUrl(name);
    try {
      const { data = {} } = await axios.get(reqUrl);
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