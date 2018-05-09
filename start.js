/*
NOTE: how to download album
Multi
$ npm start 1150,282
Single
$ npm start 1150

NOTE: how to download artist
single(solo)=S
$ npm start S=12
couple=C
$ npm start C=12
various = V
$ npm start V=12
*/
var fs = require('fs-extra'),
request = require('request'),
jsdom = require('jsdom'),
colors = require('colors'),
NodeID3 = require('node-id3');
/*
badan: [63,736,737,738]
254,1318,148
775,80,939
57,575,304,23,24,327,495
*/

// var albumId=process.argv[2];
var domainName = 'https://www.myanmarmp3.net';
const { JSDOM } = jsdom;


var app={
  task:[],
  info:{
    // albumArt:'',
    // albumId:'',
    // albumName:'',
    // tracks:[
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
  init:function(param){
    if (param.indexOf('=') !== -1) {
      this.msg('working on Artist...');
      var tmp = param.split('=');
      this.info.artistId = tmp[1];
      this.info.artistType = tmp[0];
      this.info.artistPage = 1;
      this.requestArtist();
    } else {
      this.task = param.split(',');
      // this.info = {};
      if (this.task.length) {
        this.msg('working on Album....');
        this.next();
      } else {
        this.msg('...has nothing todo!');
      }
    }
  },
  next:function(){
    this.info = {};
    if (this.task.length){
      this.info.albumId=this.task.shift();
      this.requestAlbum();
    } else {
      this.msg('...completed!');
    }
  },
  requestArtist:function(){
    request.get({
        url: 'domainName/mm/Artists/Browse/artistId?albType=artistType&Albums-page=artistPage'.replace('domainName',domainName)
        .replace('artistId',this.info.artistId)
        .replace('artistType',this.info.artistType)
        .replace('artistPage',this.info.artistPage),
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
          const dom = new JSDOM(html);
          dom.window.document.querySelectorAll("div#Albums>table>tbody>tr").forEach((e,i)=>{
            var a = e.getElementsByTagName('td')[0].querySelector('a');
            // var albumNames =  a.textContent;
            // console.log(albumNames);
            var albumIds = a.getAttribute('href').split('/')[4];
            this.task.push(albumIds);
          });
          var nextPage = dom.window.document.querySelectorAll("div.t-pager > a")[2];
          if (nextPage.getAttribute('href') == '#') {
            // NOTE: process to Album
            this.msg('processing total Albums...'.replace('total',this.task.length));
            this.next();
          } else {
            // NOTE: process to nextPage
            this.info.artistPage++;
            this.requestArtist();
          }
        }
    });
  },
  requestAlbum:function(){
    request.get({
        url: 'domainName/mm/albums/pull/albumId'.replace('domainName',domainName).replace('albumId',this.info.albumId),
        headers: {
          referer: 'domainName'.replace('domainName',domainName)
        }
      },
      (error, response, html) => {
        if (error) {
          this.msg(colors.red(error));
          this.next();
        } else if (response.statusCode !== 200) {
          this.msg(colors.red(response.statusCode));
          this.next();
        } else {
          const dom = new JSDOM(html);
          var albumArt = dom.window.document.querySelector("div#albumwrap>div.albumimg>img").getAttribute("src");
          var albumName = dom.window.document.querySelector("div#albumwrap>div.albumdesc>div#albuminfo>div.h1m").textContent;
          dom.window.document.querySelectorAll("div#albumwrap>div.albumdesc>div#albuminfo>div.descbox>ul>li").forEach((e,i)=>{
            var typeKey = e.querySelector("img").getAttribute("alt");
            var typeValue = e.children[1].textContent.trim();
            // var typeValue = e.querySelector("span").textContent;
            // console.log(typeKey,typeValue);
            // console.log(typeKey,e.children[1].textContent);
            // if (typeKey=='Album Type') {
            // } else if (typeKey=='Released Date') {
            // } else if (typeKey=='Band') {
            // } else if (typeKey=='Rate Album') {
            // } else if (typeKey=='Number of Tracks') {
            // } else if (typeKey=='Produced by') {
            // } else if (typeKey=='Record Label') {
            // } else if (typeKey=='Recording Studio') {
            // }
            switch (typeKey) {
              case 'Released Date':
                this.info.albumReleased=typeValue;
                break;
              case 'Band':
                this.info.albumBand=typeValue;
                break;
              case 'Rate Album':
                this.info.albumRate=typeValue;
                break;
              case 'Number of Tracks':
                this.info.albumTrack=typeValue;
                break;
              case 'Produced by':
                this.info.albumProduced=typeValue;
                break;
              case 'Record Label':
                this.info.albumLabel=typeValue;
                break;
              case 'Recording Studio':
                this.info.albumStudio=typeValue;
                break;
              default:
                  var text = "NULL";
            }
            // console.log(e);
          });
          this.info.albumArt=albumArt;
          // this.info.albumId=albumId;
          this.info.albumName=albumName;
          this.info.tracks=[];
          this.msg('...'+albumName);
          dom.window.document.querySelectorAll("#GridTracks>table>tbody>tr").forEach((e,i)=>{
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
          // console.log(this.info);
          // npm start 64
          // console.log('stop ');
        }
    });
  },
  responseAlbum:function(){
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
  },
  process:function(){
    if (this.info.tracks.length){
      this.mp3(this.info.tracks.shift());
    } else {
      this.next();
      // this.msg('...completed!');
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
    // https://www.npmjs.com/package/node-id3
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
}.init(process.argv[2]);