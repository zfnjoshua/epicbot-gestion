const fs = require('fs');
const https = require('https');

const file = fs.createWriteStream('antichannel.js');
const request = https.get('https://144.91.116.45/home/gestions/millenium/commands/protect/antichannel.js', (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Download completed.');
  });
});

request.on('error', (error) => {
  console.error(`Problem with the request: ${error.message}`);
});
