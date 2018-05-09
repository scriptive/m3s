
// npm install colors --save-dev
// npm install xmldom --save-dev
// npm install jsdom --save-dev
// npm install mysql --save-dev
// npm install fs-extra --save-dev
// npm install request --save-dev
// npm i browser-id3-writer --save-dev
npm install node-id3 --save-dev

var fs = require('fs'), request = require('request');

request.get({
    url: 'https://www.myanmarmp3.net/track/ProcessDataRequest/1016',
    headers: {
      referer: 'https://www.myanmarmp3.net'
    }
  }, (err, res, data) => {
    if (err) {
      console.log('Error:', err);
    } else if (res.statusCode !== 200) {
      console.log(res);
    } else {
      console.log(res);
    }
});
// request.get({
//     url: 'https://www.myanmarmp3.net/track/ProcessDataRequest/390'
//   }, (err, res, data) => {
//     if (err) {
//       console.log('Error:', err);
//     } else if (res.statusCode !== 200) {
//       console.log(res);
//     } else {
//       console.log('??');
//     }
// });


// request({
//   uri:'https://www.myanmarmp3.net/track/ProcessDataRequest/39',
//   headers: {referer: 'https://www.myanmarmp3.net'}
// },
// function (error, response, body) {
//   if (!error && response.statusCode == 200) {
//     console.log(body);
//   }
// });
/*
request({
  uri:'https://www.myanmarmp3.net/track/ProcessNTrack/2028',
  headers: {referer: 'https://www.myanmarmp3.net'}
},
function (error, response, data) {
  if (!error && response.statusCode == 200) {
    console.log('??');
  }
}).pipe(fs.createWriteStream('abc.tmp.mp3'));
*/



/*
https://www.myanmarmp3.net/track/ProcessNTrack/254
https://www.myanmarmp3.net/track/ProcessDataRequest/390
https://www.myanmarmp3.net/track/ProcessDataRequest/23
https://www.myanmarmp3.net/track/ProcessRequest/23

https://www.myanmarmp3.net/albums/GetRating?id=390



209.95.63.124:443

var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) console.log(xhr);
};
xhr.open("GET", "https://www.myanmarmp3.net/track/ProcessDataRequest/390", true);
xhr.send();

var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) console.log(xhr);
};
xhr.open("GET", "https://www.myanmarmp3.net/track/ProcessNTrack/254", true);
xhr.withCredentials = true;
xhr.send();
*/