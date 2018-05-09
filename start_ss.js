// NOTE: npm start 1150,282
// NOTE: 1150 is albumid
var fs = require('fs-extra'),
request = require('request'),
jsdom = require('jsdom'),
colors = require('colors'),
NodeID3 = require('node-id3');



var albumId=process.argv[2];
var domainName = 'https://www.myanmarmp3.net';
const { JSDOM } = jsdom;



// https://www.myanmarmp3.net/mm/albums/pull/282/


// var abc = 'http://www.myanmarmp3.net/images/albumpic/va-a-kyin-nar-in-arr.jpg'.split('.').pop();
// console.log(abc);
// var albumId = process.argv[2].split(',');
// console.log(albumId);
// if (albumId.length > 1) {
//   console.log('multi');
// } else {
//   console.log('single');
// }
// return;
// request.get({
//     url: 'domainName/mm/albums/pull/albumId'.replace('domainName',domainName).replace('albumId',albumId),
//     headers: {
//       referer: 'domainName'.replace('domainName',domainName)
//     }
//   },
//   (error, response, html) => {
//     if (error) {
//       app.msg(colors.red(error));
//     } else if (response.statusCode !== 200) {
//       app.msg(colors.red(response.statusCode));
//     } else {
//       app.msg('working...');
//       const dom = new JSDOM(html);
//       var albumArt = dom.window.document.querySelector("div#albumwrap>div.albumimg>img").getAttribute("src");
//       var albumName = dom.window.document.querySelector("div#albumwrap>div.albumdesc>div#albuminfo>div.h1m").textContent;
//       app.info.albumArt=albumArt;
//       app.info.albumId=albumId;
//       app.info.albumName=albumName;
//       app.info.tracks=[];
//       dom.window.document.querySelectorAll("#GridTracks>table>tbody>tr").forEach(function(e,i){
//         var trkNumber =i+1;
//         var trks = e.getElementsByTagName('td');
//         var trkId =trks[1].querySelector('div').getAttribute('id');
//         var trkTitle =trks[1].querySelector('div').textContent.trim();
//         var trkArtists=[];
//
//         trks[2].querySelectorAll('a').forEach(function(e){
//           trkArtists.push(e.textContent.trim());
//         });
//         app.info.tracks.push({
//           trackId: trkId,
//           artist: trkArtists,
//           album: albumName,
//           title: trkTitle,
//           track: trkNumber
//         });
//       });
//       app.startAlbum();
//     }
// });

var app={
  task:[],
  info:{
    // art:'',
    // album:'',
    // track:[
    //   {
    //     artist: '',
    //     album: '',
    //     title: '',
    //     year: '',
    //     track: '',
    //   }
    // ]
  },
  json:{},
  trackList:{},
  trackCurrent:{},
  int:function(param){
    this.task = param.split(',');
    // console.log(albumId);
    // if (this.task.length > 1) {
    //   console.log('multi');
    // } elseif (this.task.length == 1){
    //   console.log('single');
    // } else {
    //   this.msg('...has nothing todo!');
    // }
    if (this.task.length >= 1) {
      this.msg('working...');
      console.log('requestAlbum');
    } else {
      this.msg('...has nothing todo!');
    }
  },
  requestAlbum:function(){
    request.get({
        url: 'domainName/mm/albums/pull/albumId'.replace('domainName',domainName).replace('albumId',albumId),
        headers: {
          referer: 'domainName'.replace('domainName',domainName)
        }
      },
      (error, response, html) => {
        if (error) {
          this.msg(colors.red(error));
        } else if (response.statusCode !== 200) {
          this.msg(colors.red(response.statusCode));
        } else {
          // this.msg('working...');
          const dom = new JSDOM(html);
          var albumArt = dom.window.document.querySelector("div#albumwrap>div.albumimg>img").getAttribute("src");
          var albumName = dom.window.document.querySelector("div#albumwrap>div.albumdesc>div#albuminfo>div.h1m").textContent;
          this.info.albumArt=albumArt;
          this.info.albumId=albumId;
          this.info.albumName=albumName;
          this.info.tracks=[];
          dom.window.document.querySelectorAll("#GridTracks>table>tbody>tr").forEach(function(e,i){
            var trkNumber =i+1;
            var trks = e.getElementsByTagName('td');
            var trkId =trks[1].querySelector('div').getAttribute('id');
            var trkTitle =trks[1].querySelector('div').textContent.trim();
            var trkArtists=[];

            trks[2].querySelectorAll('a').forEach(function(e){
              trkArtists.push(e.textContent.trim());
            });
            this.info.tracks.push({
              trackId: trkId,
              artist: trkArtists,
              album: albumName,
              title: trkTitle,
              track: trkNumber
            });
          });
          this.responseAlbum();
        }
    });
  },
  responseAlbum:function(){
    // this.trackList=JSON.parse(e);
    try {
      fs.outputJsonSync('./music/albumId/album.json'.replace('albumId',this.info.albumId), this.info);
      var artExtension = this.info.albumArt.split('.').pop();
      var albumArt = 'art.extension'.replace('extension',artExtension);
      var albumArtLocal = './music/albumId/albumArt'.replace('albumId',this.info.albumId).replace('albumArt',albumArt);
      this.art(albumArtLocal).pipe(fs.createWriteStream(albumArtLocal));
    } catch (e) {
      this.msg(e);
    } finally {
      this.process();
    }
    // const data = fs.readJsonSync(file)
    // console.log(data.name)
  },
  process:function(){

    if (this.info.tracks.length){
      this.mp3(this.info.tracks.shift());
    } else {
      this.msg('...completed!');
    }
  },
  mp3:function(e){
    request({
      uri:'domainName/track/ProcessNTrack/trackId'.replace('domainName',domainName).replace('trackId',e.trackId),
      headers: {
        referer: 'domainName'.replace('domainName',domainName)
      }
    },
    (error, response, data) => {
      if (error) {
        this.msg(colors.red(error));
      } else if (response.statusCode !== 200) {
        this.msg(colors.red(response.statusCode));
      } else {
        this.msg(colors.green(e.title));
      }
      this.id3(e);
      // this.process();
    }).pipe(fs.createWriteStream('./music/albumId/track.mp3'.replace('albumId',this.info.albumId).replace('track',e.track)));
  },
  art:function(e){
    return request({
      uri:'domainNamealbumArt'.replace('domainName',domainName).replace('albumArt',this.info.albumArt),
      headers: {
        referer: 'domainName'.replace('domainName',domainName)
      }
    },
    (error, response, data) => {
      this.info.albumArt=e;
    });
  },
  id3:function(e){
    // TODO: 1443, 250,33,413,1079,1081-,1010-,1368-,32-,868-,??1051-,1223-,
    // TODO: 871-,1512-,??1339-,1009-,870-,1507-,1487-,869-,1549-,1019-,1492, (1368,1339,1413,1395,1407)
    var file = './music/albumId/track.mp3'.replace('albumId',this.info.albumId).replace('track',e.track);
    let tags = {
      TIT2:  e.title,
      TPE1:  e.artist,
      TALB:  e.album,
      APIC: this.info.albumArt,
      TRCK:  e.track

      // TIT2:  e.title
      // TPE1:  e.artist
      // TALB:  e.album
      // TYER:  2004
      // TRCK:  e.track
      // TCON:  'letId'
      // TBPM:  128
      // WPAY:  'https://google.com'
      // TKEY:  'Fbm'
    };

    NodeID3.create(tags, function(frame) {
      // console.log('?1');
    });
    NodeID3.write(tags, file, (err, buffer)=>{
      // console.log('?2');
      this.process();
    });
  },
  msg:function(e){
    console.log(e);
  }
}.int(process.argv[2]);