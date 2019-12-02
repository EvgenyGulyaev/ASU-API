const p = require('./index');

(async () => {
  const data = await p.scrapData('ктмо1-1');
  console.log('data',  data );
})();
