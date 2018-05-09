
    soundManager.setup({
        url: '/swf/',
        useFlashBlock: false,
        debugFlash: false,
        flashVersion: 9,
        debugMode: true,
        preferFlash: true, // prefer 100% HTML5 mode, where both supported
        useHTML5Audio: true,
        onready: function () {
            // console.log('SM2 ready!');
        },
        ontimeout: function () {
            // console.log('SM2 init failed!');
        },
        defaultOptions: {
            // set global default volume for all sound objects
            volume: 100
        }
    });

    function detectflash() {
        var hasFlash = false;
        var mob = _detectMobileBrowsers();
        try {
            var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            if (fo) {
                    hasFlash = true;
            }
        } catch (e) {
            if (navigator.mimeTypes
                  && navigator.mimeTypes['application/x-shockwave-flash'] != undefined
                  && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
                hasFlash = true;
            }
        }
        if (mob) {
            hasFlash = false;
        }
        return hasFlash;
    }
    function getFiles() {
        var processURL = "";
        var trkcode = 'NA';
        if (detectflash) {
            processURL = "/track/ProcessDataRequest/" + "1016";
        } else {
            processURL = "/track/ProcessRequest/" + "1016";
        }
        $.ajax({
            type: "GET",
            url: processURL,
            dataType: "json",
            async: false, //very important because if not that option it don't work
            success: function (msg) {
                myPlayList = msg;
            }
        });
        return myPlayList;
    }
    function _detectMobileBrowsers() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Opera Mobile|Kindle|Windows Phone|PSP|AvantGo|Atomic Web Browser|Blazer|Chrome Mobile|Dolphin|Dolfin|Doris|GO Browser|Jasmine|MicroB|Mobile Firefox|Mobile Safari|Mobile Silk|Motorola Internet Browser|NetFront|NineSky|Nokia Web Browser|Obigo|Openwave Mobile Browser|Palm Pre web browser|Polaris|PS Vita browser|Puffin|QQbrowser|SEMC Browser|Skyfire|Tear|TeaShark|UC Browser|uZard Web|wOSBrowser|Yandex.Browser mobile/i.test(navigator.userAgent);
    };
    jQuery(document).ready(function ($) {
        var myPlaylist = [];
        var prevTrackID = "";
        var isflash = detectflash();
        $('#fap').fullwidthAudioPlayer({ wrapperColor: '#fff', fillColor: '#fff', height: 70, wrapperPosition: 'bottom', fillColorHover: '#fff', playlist: false, strokeColor: '#fff', coverSize: [55, 55], baseCode: 'true' });
        $(".plist").click(function () {
            var newlist = getFiles();
            $.fullwidthAudioPlayer.clear();
            $.each(newlist, function (i, item) {
                //mm Title
                var mtitle = "<span class='myanmar3'>" + newlist[i].mtitle + "</span>";
                $.fullwidthAudioPlayer.addTrack(newlist[i].mp3, "", mtitle, "", "/images/albumpic/va-hlut-sit-moe-kaung-kin-1.jpg","",newlist[i].trkid, false);
                })
                $.fullwidthAudioPlayer.play();
            });

            jQuery("a[trackid]").click(function () {
                trackID = $(this).attr("trackid");
                $.ajax({
                    dataType: "json",
                    data: { track_id: trackID },
                    type: "GET",
                    async: false,
                    url: "/albums/AddPlayList",
                    success: function (data) {
                        var resultWindow = jQuery("#WResult").data("tWindow");
                        $("#result")
                            .find("h3")
                            .text(data)
                            .end()
                        resultWindow.center().open();
                    },
                    error: function (e) {
                        var resultWindow = jQuery("#WResult").data("tWindow");
                        $("#result")
                            .find("h3")
                            .text(e)
                            .end()
                        resultWindow.center().open();
                    }
                });
            });
            jQuery("a[data-path]").click(function (e) {
                var stitle;
                trk = $(this).attr("data-path");
                if (prevTrackID == 0) { prevTrackID = trk; };
                if ($("#" + trk).length != 0) {
                    stitle = $("#" + trk).html();
                }
                var trkcode = $(this).attr("data-code");
                if (isflash) {
                    $.ajax({
                        type: "GET",
                        url: "/track/ProcessDataTrack",
                        data: { id: trk },
                        dataType: "json",
                        async: false,
                        success: function (data) {
                            trkcode = data;
                        }
                    });
                }
                //var tr = $("#GridTracks tbody tr:eq(1)"); // use eq(1) if the grid is scrollable or eq(0) if not to get the first row
                // get the associated data item
                //tr.find('td').addClass("highlight");
                $.fullwidthAudioPlayer.clear();
                $.fullwidthAudioPlayer.addTrack(trkcode, "", stitle, $(this).closest('td').prev('td').html(), "/images/albumpic/va-hlut-sit-moe-kaung-kin-1.jpg","", trk, false);
                $.fullwidthAudioPlayer.play();
                $('#fap-play-pause').removeClass('fap-pause').addClass('fap-wait');

            });
            $('#fap').bind('onFapTrackSelect', function (evt, trackData) {
                //output the title of the current track
                if (prevTrackID == trackData.trkid) {
                    $('a[data-path =  "' + prevTrackID + '"]').find("img").attr("src", "/images/play-audion.png");
                    $('a[data-path =  "' + trackData.trkid + '"]').find("img").attr("src", "/images/pauser.png")
                }
                else {
                    $('a[data-path =  "' + prevTrackID + '"]').find("img").attr("src", "/images/play-audion.png");
                    $('a[data-path =  "' + trackData.trkid + '"]').find("img").attr("src", "/images/pauser.png");

                }
                prevTrackID = trackData.trkid;
            });
            $('#fap').bind('onFapPlay', function (evt) {
                if (!$('#fap-play-pause').hasClass("fap-wait")) {
                    $('a[data-path =  "' + prevTrackID + '"]').find("img").attr("src", "/images/pauser.png");
                }
            });

            $('#fap').bind('onFapPause', function (evt) {
                if (!$('#fap-play-pause').hasClass("fap-wait")) {
                    $('a[data-path =  "' + prevTrackID + '"]').find("img").attr("src", "/images/play-audion.png");
                }
            });

            var ratingInfo;
            function getRating(albumNo) {
                $.ajax({
                    type: "GET",
                    url: "/albums/GetRating",
                    data: { id: albumNo },
                    //dataType:"text",
                    dataType: "json",
                    async: false,
                    success: function (data) {
                        ratingInfo = data;
                    }
                });
                return ratingInfo;
            }

            var PreValue = getRating("1016");
        $('#rateme').rateit('value', PreValue);

        $("#rateme").bind('rated reset', function (e) {
            var ri = $(this);
            //if the use pressed reset, it will get value: 0 (to be compatible with the HTML range control), we could check if e.type == 'reset', and then set the value to  null

            var RatedValue = ri.rateit('value');
            var reqalbumID = ri.data('productid'); // if the product id was in some hidden field: ri.closest('li').find('input[name="productid"]').val()
            //maybe we want to disable voting?
            ri.rateit('readonly', true);
            $.ajax({
                url: '/Albums/SetRating', //your server side script
                type: 'POST',
                dataType: 'json',
                data: { id: reqalbumID, value: RatedValue }, //our data
                success: function (data) {
                    $('#rateme').rateit('value', data);
                },
                error: function (jxhr, msg, err) {
                    jQuery("#WResult").data("tWindow").title("Sorry!");
                    var resultWindow = jQuery("#WResult").data("tWindow");
                    var result = e.response;
                    $("#result")
                        .find("h3")
                        .text("Please login to your acccount to rate the album.")
                        .end()
                    resultWindow.center().open();
                    $('#rateme').rateit('value', PreValue);
                }
            });
        });

    });    //end
    