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


    function bufferVideoById(id, startSeconds, seconds) {
        var dfd = Q.defer();

        this.is_buffering = true;

        this.curr_video = {
            api: 'youtube',
            id: id
        };

        this.getIframe().style.display = 'none';
        this.mute();
        this.loadVideoById(id, startSeconds || 0);
        //this.setPlaybackQuality('highres');
        setTimeout(function() {
            this.is_buffering = false;
            this.pauseVideo();
            dfd.resolve();
        }.bind(this), seconds || 0.3);

        return dfd.promise;
    }

    function playVideoById(id, startSeconds, endSeconds) {
        this.getIframe().style.display = 'block';
        //this.setPlaybackQuality('highres');
        var params = {
            videoId: id,
            startSeconds: startSeconds || 0
        };
        if (endSeconds)
            params.endSeconds = endSeconds || 0;
        
        this.loadVideoById(params);
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

    function emulateEvent(event) {
        if (event == window.YT.PlayerState.ENDED)
            try {
                this.play_stop_dfd.resolve();
            } catch (e) {}
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

                    player.emulateEvent = emulateEvent.bind(player);

                    player_dfd.resolve(player/*new Player(player, params)*/);
                });

                player.addEventListener('onStateChange', function(e) {
                    if (window.YT.PlayerState.ENDED == e.data)
                        this.play_stop_dfd.resolve();
                    else if (window.YT.PlayerState.PLAYING == e.data) {
                        //TODO don't fire while buffering by bufferVideoById func
                        if (this.play_back_dfd && !this.is_buffering)
                            this.play_back_dfd.resolve(this.curr_video);
                    }
                }.bind(player));

                return player_dfd.promise;
            });
        }
    };
})();