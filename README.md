# ASU-API
Данная библиотека предназначена для работы с http://ictis.sfedu.ru/rasp/

## Установка 
Используя npm:    
`npm install asu-api --save`


Используя yarn:     
`yarn add asu-api`

##Пример 
```js
const p = require('asu-api');

(async () => {
  const data = await p.scrapData('Беспалов');
  console.log('data',  data );
})();

```