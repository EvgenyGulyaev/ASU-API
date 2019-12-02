const p = require('./index');

(async () => {
  const data = await p.scrapData('ктмо');
  console.log('data',  data );
})();
