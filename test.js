const p = require('./index');

(async () => {
  const data = await p.scrapData('ктмо1-1', 'nextWeek','55.htm',14);
  console.log('data',  data );
})();
