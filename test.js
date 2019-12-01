const p = require('./index');

(async () => {
  const data = await p.scrapData('Беспалов');
  console.log('data',  data );
})();
