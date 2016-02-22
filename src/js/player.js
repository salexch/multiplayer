/**
 * Created by alex on 2/15/2016.
 */


module.exports = (function() {

    var debug = false;

    var Q = require('q');
    var _ = require('lodash');

    function debugLog() {
        if (debug)
            console.debug.apply(console, arguments);
    }


    function removeEmptyPlayerPlaceholders() {
        var divs = this.wrapper.querySelectorAll('div');
        for(var i =0; i< divs.length; i++)
            this.wrapper.removeChild(divs[i]);
    }


    var player = function(element, player_params, options) {
        if ('string' == typeof element)
            element = document.getElementById(element);

        this.players = [];

        this.anim = {
            show: function() {},
            hide: function() {}
        };

        this.wrapper = element;
        this.player_params = player_params;

/*
        this.player_params.width = this.wrapper.offsetWidth;
        this.player_params.height = this.wrapper.offsetHeight;
*/
        this.player_params.width = '100%';
        this.player_params.height = '100%';


        if (options && options.useTransition) {
            //var anim = this.anim = require('./transitions/transitions.js')(this.wrapper, 'circle');
            var anim = this.anim = require('./transitions/' + options.useTransition + '.js')(this.wrapper);
/*            setTimeout(function() {
                anim.show();
                setTimeout(function() {
                    anim.hide();
                }, 2000);
            }, 5000);*/
        }
    };

    var PlayerState = {
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        CUED: 5
    };


    function _createPlayerElem() {
        var player_elem = document.createElement('div');
        //player_elem.style.visibility = 'hidden';
        player_elem.style.display = 'none';
        player_elem.style.height = '100%';
        return player_elem;
    }

    function _playList() {
        var that = this;
        this.players[0].whenVideoEnd().then(function() {
            that.anim.show();
            that.players[1].continuePlay();
            that.players[0].destroy();
            that.players.shift();
            //Q.delay(1000).then(that.anim.hide);
            setTimeout(function() {
                that.anim.hide();
            }, 1000);
            //TODO: find why it's not working!
            //removeEmptyPlayerPlaceholders().call(that);

            var video = that.playlist.shift();
            if (video) {
                var player_elem = _createPlayerElem();
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
            player1_elem = _createPlayerElem();

        this.wrapper.appendChild(player1_elem);

        var player1 = require('./players/' + video1.api + '.js').createPlayer(player1_elem, this.player_params);

        var video2 = this.playlist.shift(),
            player2_elem = _createPlayerElem();

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