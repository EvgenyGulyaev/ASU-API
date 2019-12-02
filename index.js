const axios = require('axios');
const _sortBy = require('lodash/sortBy');
const _chunk = require('lodash/chunk');
const {
  url,
  messageError: message,
  choicesMsg,
  todayWeek,
  curWeek,
  nextWeek,
  today,
  tomorrow
} = require('./constants');
const { gem, calendar, currentGroup, free } = require('./emojis')

const sort = (name) => {
  const [first, second] = name.split('-');
  return (+first[first.length - 1] * 100) + +second;
};

const getDay = () => {
  const date = new Date();
  const day = date.getDay();
  if (!day) return 8;
  return 1 + day;
}

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

  parseDataToWeek(table, res) {
    for (let dayIndex = 2; dayIndex < table.length; dayIndex++) {
      for (let timeIndex = 0; timeIndex < table[dayIndex].length; timeIndex++) {
        const value = table[dayIndex][timeIndex] || `${free} ${free} ${free}`;
        res += !timeIndex ? `${gem} ${value} ${gem} \n` :
          `${table[0][timeIndex]} ${table[1][timeIndex]} ${value} \n `
      }
      res += '\n'
    }
    return res
  }

  parseDataTable({ week, table, name }, type) {
    this.keyboard = {};
    let res = `${currentGroup} Ваш запрос: ${name} ${currentGroup} \n`;
    res += `${calendar} ${todayWeek} ${week} неделя семестра ${calendar} \n \n`;

    if (type === curWeek || type === nextWeek) {
      return this.parseDataToWeek(table, res)
    }

    let day = getDay();

    if (type === today) {
      const tableData = [table[0], table[1], table[day]];
      return this.parseDataToWeek(tableData, res);
    }

    if (type === tomorrow) {
      day = day > 7 ? 3 : day + 1;
      const tableData = [table[0], table[1], table[day]];
      return this.parseDataToWeek(tableData, res);
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

  async getWeek() {
    try {
      const { data } = await axios.get(`${url}group=1.htm`);
      const { table = {} } = data;
      const { week } = table;
      return week;
    }
    catch (e) {
      console.error('error', e);
      return 0;
    }
  }

  async scrapData(name, type = curWeek, id = null) {
    const res = { message, keyboard: {} };
    let reqUrl = await this.generateUrl(name);
    const day = getDay();
    if ((day > 7 && type === tomorrow) || type === nextWeek) {
      const weekNumber = await this.getWeek();
      reqUrl = `${url}group=${id}&week=${weekNumber + 1}`;
    }
    try {
      const { data = {} } = await axios.get(reqUrl);
      const { choices = [], table = {} } = data;
      res.message = choices.length ? this.parseChoices(choices) : this.parseDataTable(table, type);
      res.keyboard = this.keyboard;
      return res;
    }
    catch (e) {
      console.error('error', e);
      return res
    }
  }

  async checkExist(name) {
    let reqUrl = await this.generateUrl(name);
    const res = { name: '', group: '' };
    try {
      const { data = {} } = await axios.get(reqUrl);
      const { table = {}, choices = [] } = data;
      if (choices.length) {
        return {
          choices: {
            message: this.parseChoices(choices),
            keyboard: this.keyboard,
          },
          ...res
        }
      }
      const { name = '', group = '' } = table;
      return { name, group };
    }
    catch (e) {
      console.error('error', e);
      return res
    }
  }
}

module.exports = new Parser();