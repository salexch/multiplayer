/**
 * Created by alex on 2/19/2016.
 */
;(function() {

    var AggPlayer = require('./../dist/player.js');
    //var AggPlayer = require('./../test/player.js');
    AggPlayer = window.MultiPlayer;
    console.log('player', AggPlayer);


    AggPlayer.debug(true);

    var player = new AggPlayer.Player('player', {
        theoplayer: {
            api_key: 'f9c64920-f538-4b51-b34e-afd660d6ce2c'
        },
        playerVars: {
            autohide: 2,
            autoplay: 1,
            //controls: 0,
            fs: 1,
            //loop: 1,
            modestbranding: 0,
            rel: 0,
            showinfo: 0
        },
/*        events: {
            onReady: onPlayerReady2,
            onStateChange: onPlayerStateChange2
        }*/
    }, {
        preloadSeconds: 1,
        useTransition: [
            'circle',
            'curtain',
            'frame-it',
            'jammed-blind',
            'lateral-swipe',
            'lazy-stretch',
            'origami',
            'parallelogram',
            'spill',
            'tilted',
            'tunnel-vision',
            'wave',
            'widescreen-wiper'
        ]
    });

    function onPlayerReady() {

    }


    function onPlayerStateChange() {

    }

    player.setLoop(true);

    player.loadPlaylist({
        list: [{
            id: "http://stream.cloudy.services/vod/_definst_/43/FASHION_FILM_1_nuyxkolv_mp4/playlist.m3u8",
            api: 'theoplayer'
        }]
/*
        list: [{
            id: "file:///S:/YOUTUBE%20OUT/FR16137414HD.mp4",
            api: 'html'
        },{
            id: "file:///S:/YOUTUBE%20OUT/FR16137420HD.mp4",
            api: 'html'
        }]
*/
    });

    window.videoplayer = player;
})();