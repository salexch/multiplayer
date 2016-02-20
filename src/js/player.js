/**
 * Created by alex on 2/15/2016.
 */


module.exports = (function() {

    var debug = false;

    var Q = require('q');

    function debugLog() {
        if (debug)
            console.debug.apply(console, arguments);
    }


    var wrapper;
    var players = [];

    function removeEmptyPlayerPlaceholders() {
        var divs = wrapper.querySelectorAll('div');
        for(var i =0; i< divs.length; i++)
            wrapper.removeChild(divs[i]);
    }


    var player = function(element, params) {
        if ('string' == typeof element)
            element = document.getElementById(element);

        wrapper = element;
    };

    var PlayerState = {
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        CUED: 5
    };

    player.prototype.loadPlaylist = function(params) {
        if (params.list.length < 1)
            return false;

        if (params.list.length == 1)
            return this.loadVideoById(params.list.pop());


        this.playlist = params.list;

        var video1 = this.playlist.shift(),
            player1_elem = document.createElement('div');

        wrapper.appendChild(player1_elem);

        var prep_palyers = [];
        var player1 = require('./players/' + video1.api + '.js').createPlayer(player1_elem, params);
        prep_palyers.push(player1);

        var video2 = this.playlist.shift(),
            player2_elem = document.createElement('div');

        wrapper.appendChild(player2_elem);

        var player2 = require('./players/' + video2.api + '.js').createPlayer(player2_elem, params);
        prep_palyers.push(player2);

        Q.all(prep_palyers).then(function(res) {
            res.forEach(function(player) {
                players.push(player);
            });
            players[0].playVideoById(video1.id);
            players[1].bufferVideoById(video2.id);
            _playList();
        });


        var that = this;

        function _playList() {
            players[0].whenVideoEnd().then(function() {
                players[1].continuePlay();
                players[0].destroy();
                players.shift();

                var video = that.playlist.shift();
                if (video) {
                    var player_elem = document.createElement('div');
                    wrapper.appendChild(player_elem);
                    require('./players/' + video.api + '.js').createPlayer(player_elem, params).then(function(player) {
                        removeEmptyPlayerPlaceholders();
                        players.push(player);
                        player.bufferVideoById(video.id);
                        _playList();
                    });
                }
            });
        }
    };



    return {
        debug: function(is_debug) {
            debug = is_debug;
        },
        Player: player,
        PlayerState: PlayerState
    }
})();