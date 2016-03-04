/**
 * Created by alex on 3/4/2016.
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
            loop: 1,
            modestbranding: 0,
            rel: 0,
            showinfo: 0
        },
        /*        events: {
         onReady: onPlayerReady2,
         onStateChange: onPlayerStateChange2
         }*/
    }, {
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


    player.loadPlaylist({
        list: [{
            id: "x1kwday_fashiontv-live-asia-24-7_lifestyle",
            api: 'dailymotion'
        },{
            id: "x1kwday_fashiontv-live-asia-24-7_lifestyle",
            api: 'dailymotion'
        }]
    });

})();