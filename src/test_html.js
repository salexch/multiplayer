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
            id: "http://techslides.com/demos/sample-videos/small.webm",
            api: 'html'
        }, /*{
            id: 'http://download.blender.org/peach/bigbuckbunny_movies/big_buck_bunny_720p_stereo.ogg',
            api: 'html'
        },*/{
            id: "https://permadi.com/thirdParty/videos/redcliff450.webm",
            api: 'html'
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

    player.addEventListener('onStateChange', function(e) {
        console.log('onStateChange', e);
    });
    player.addEventListener('onError', function(e) {
        console.log('onError', e);
    });

    window.videoplayer = player;
})();