// NOTE: npm start 1150
// NOTE: 1150 is albumid
var fs = require('fs-extra'), request = require('request');
var colors = require('colors');
var albid=process.argv[2];
// console.log(process.argv[2]);
request.get({
    url: 'https://www.myanmarmp3.net/track/ProcessDataRequest/albid'.replace('albid',albid),
    headers: {
      referer: 'https://www.myanmarmp3.net'
    }
  },
  (error, response, json) => {
    if (error) {
      app.done(colors.red(error));
    } else if (response.statusCode !== 200) {
      app.done(colors.red(response.statusCode));
    } else {
      app.start(json);
    }
});
var app={
  json:{},
  trackList:{},
  trackCurrent:{},
  start:function(e){
    this.trackList=JSON.parse(e);
    try {
      fs.outputJsonSync('music/albid/album.json'.replace('albid',albid), this.trackList);
    } catch (e) {
      this.done(e);
    } finally {
      this.process();
    }
    // const data = fs.readJsonSync(file)
    // console.log(data.name)
  },
  process:function(){
    if (this.trackList.length){
      this.download(this.trackList.shift());
    } else {
      this.done('...completed!');
    }
  },
  download:function(e){
    request({
      uri:'https://www.myanmarmp3.net/track/ProcessNTrack/trkid'.replace('trkid',e.trkid),
      headers: {
        referer: 'https://www.myanmarmp3.net'
      }
    },
    (error, response, data) => {
      if (error) {
        this.done(colors.red(error));
      } else if (response.statusCode !== 200) {
        this.done(colors.red(response.statusCode));
      } else {
        this.done(colors.green(e.mtitle));
      }
      this.process();
    }).pipe(fs.createWriteStream('music/albid/title.mp3'.replace('albid',albid).replace('title',e.mtitle)));
  },
  done:function(msg){
    console.log(msg);
  }
};