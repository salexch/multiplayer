/**
 * Created by alex on 2/15/2016.
 */

var Q = require('q');
var _ = require('lodash');

module.exports = (function() {

    var dfd = Q.defer();

    // 2. This code loads the IFrame Player API code asynchronously.
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


    if ('function' == typeof window.onYouTubeIframeAPIReady) {
        var old_handler = window.onYouTubeIframeAPIReady;

        window.onYouTubeIframeAPIReady = function() {
            old_handler();
            dfd.resolve();
        }
    } else
        window.onYouTubeIframeAPIReady = function() {
            dfd.resolve();
        };


    function isAPIReady() {
        return dfd.promise;
    }



/*    function Player(player, params) {

    }*/


    function bufferVideoById(id) {
        this.getIframe().style.display = 'none';
        this.mute();
        this.loadVideoById(id);
        setTimeout(function() {
            this.pauseVideo();
        }.bind(this), 0.5);
    }

    function playVideoById(id) {
        this.getIframe().style.display = 'block';
        this.loadVideoById(id);
    }


    function continuePlay() {
        //this.unMute();
        this.playVideo();
        this.getIframe().style.display = 'block';
    }

    function whenVideoEnd() {
        return this.play_stop_dfd.promise;
    }

    function whenStartPlaying() {
        if (this.play_back_dfd)
            this.play_back_dfd.reject();

        this.play_back_dfd = Q.defer();

        return this.play_back_dfd.promise;
    }

    function isPlaying() {
        return this.getPlayerState() == window.YT.PlayerState.PLAYING;
    }

    function isPaused() {
        return this.getPlayerState() == window.YT.PlayerState.PAUSED;
    }


    return {
        createPlayer: function(elem, params) {
            return isAPIReady().then(function() {
                var player_dfd = Q.defer();

                //elem.style.display = 'none';

                var player = new window.YT.Player(elem, params);

                player.addEventListener('onReady', function() {
                    player.play_stop_dfd = Q.defer();
                    player.bufferVideoById = bufferVideoById.bind(player);
                    player.playVideoById = playVideoById.bind(player);
                    player.continuePlay = continuePlay.bind(player);
                    player.whenVideoEnd = whenVideoEnd.bind(player);
                    player.whenStartPlaying = whenStartPlaying.bind(player);
                    player.isPlaying = isPlaying.bind(player);
                    player.isPaused = isPaused.bind(player);

                    player_dfd.resolve(player/*new Player(player, params)*/);
                });

                player.addEventListener('onStateChange', function(e) {
                    if (window.YT.PlayerState.ENDED == e.data)
                        this.play_stop_dfd.resolve();
                    else if (window.YT.PlayerState.PLAYING == e.data) {
                        if (this.play_back_dfd)
                            this.play_back_dfd.resolve();
                    }
                }.bind(player));

                return player_dfd.promise;
            });
        }
    };
})();