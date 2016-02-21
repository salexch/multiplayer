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


    function removeEmptyPlayerPlaceholders() {
        var divs = this.wrapper.querySelectorAll('div');
        for(var i =0; i< divs.length; i++)
            this.wrapper.removeChild(divs[i]);
    }


    var player = function(element, params) {
        if ('string' == typeof element)
            element = document.getElementById(element);

        this.players = [];

        this.wrapper = element;
        this.player_params = params;
    };

    var PlayerState = {
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        CUED: 5
    };


    function _playList() {
        var that = this;
        this.players[0].whenVideoEnd().then(function() {
            that.players[1].continuePlay();
            that.players[0].destroy();
            that.players.shift();
            //TODO: find why it's not working!
            //removeEmptyPlayerPlaceholders().call(that);

            var video = that.playlist.shift();
            if (video) {
                var player_elem = document.createElement('div');
                that.wrapper.appendChild(player_elem);
                require('./players/' + video.api + '.js').createPlayer(player_elem, that.player_params).then(function(player) {
                    that.players.push(player);
                    player.bufferVideoById(video.id);
                    _playList.call(that);
                });
            }
        });
    }

    player.prototype.loadPlaylist = function(params) {
        if (params.list.length < 1)
            return false;

        if (params.list.length == 1)
            return this.loadVideoById(params.list.pop());


        this.playlist = params.list;

        var video1 = this.playlist.shift(),
            player1_elem = document.createElement('div');

        this.wrapper.appendChild(player1_elem);

        var player1 = require('./players/' + video1.api + '.js').createPlayer(player1_elem, this.player_params);

        var video2 = this.playlist.shift(),
            player2_elem = document.createElement('div');

        this.wrapper.appendChild(player2_elem);

        var player2 = require('./players/' + video2.api + '.js').createPlayer(player2_elem, this.player_params);

        var that = this;

        Q.all([
            player1,
            player2
        ]).then(function(res) {
            res.forEach(function(player) {
                that.players.push(player);
            });
            that.players[0].playVideoById(video1.id);
            that.players[1].bufferVideoById(video2.id);
            _playList.call(that);
        });
    };



    return {
        debug: function(is_debug) {
            debug = is_debug;
        },
        Player: player,
        PlayerState: PlayerState
    }
})();