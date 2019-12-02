const p = require('./index');

(async () => {
  const check = await p.checkExist('ктмо1-1');
  console.log('check', check );
  const data = await p.scrapData('ктмо1-1', 'nextWeek','55.htm',14);
  console.log('data',  data );
})();
