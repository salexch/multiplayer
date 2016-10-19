/**
 * Created by alex on 5/7/2016.
 */
/**
 * Created by alex on 2/15/2016.
 */
module.exports = (function() {

    var Q = require('q');

    var dfd = Q.defer(),
        api_loaded = false;


    function fetchPlayer(account_id, player_id, url) {
        if (api_loaded)
            return false;

        api_loaded = true;

        // 2. This code loads the IFrame Player API code asynchronously.
        var tag = document.createElement('script');
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        tag.onload = function() {
            dfd.resolve();
        };

        tag.src = url || "https://players.brightcove.net/" + account_id + "/" + player_id + "_default/index.min.js";
    }


    function isAPIReady() {
        return dfd.promise;
    }

    var map_events = {
        end: 0,
        playing: 1,
        pause: 2
    };

    var events = [];

    function execEvent(events, event_name) {
        var by_types = _.groupBy(events, 'type');
        (by_types[event_name] || []).forEach(function(event) {
            if ('function' == typeof event.listener)
                event.listener({
                    data: map_events[event_name]
                });
        });
    }

    function bufferVideoById(id) {
        var dfd = Q.defer();
        this._videoElem.display = 'none';
        this._videoElem.mute();
        this._videoElem.setAttribute('data-video-id', id);
        bc(this._videoElem);

        //bc is async!
        this.buffer_timer = setTimeout(function() {
            this.player = videojs(this._videoElem).ready(function(){
                dfd.resolve();
            });
        }, 2000);

        return dfd.promise;
    }

    function playVideoById(id) {
        clearTimeout(this.buffer_timer);

        this._videoElem.style.display = 'block';
        this._videoElem.setAttribute('data-video-id', id);

        bc(this._videoElem);

        this.player = videojs(this._videoElem).ready(function(){
            this.play();
        });
    }


    function continuePlay() {
        //this.unMute();
        this.player.play();
        this.style.display = 'block';
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
        return this.getPlayerState() == 1;
    }

    function isPaused() {
        return this.getPlayerState() == 2;
    }

    function emulateEvent(event) {
        if (event == 0)
            try {
                this.play_stop_dfd.resolve();
            } catch (e) {}
    }

    return {
        createPlayer: function(elem, params) {
            console.debug('Player params', params);

            fetchPlayer(params.Brightcove.accountId, params.Brightcove.playerId, params.Brightcove.url);

            return isAPIReady().then(function() {
                var player_dfd = Q.defer();

                var video_elem = document.createElement('video');
                video_elem.setAttribute('data-account', params.Brightcove.accountId);
                video_elem.setAttribute('data-player', params.Brightcove.playerId);
                video_elem.setAttribute('data-embed', 'default');
                video_elem.width = '100%';
                video_elem.height = '100%';
                if (params.playerVars.autoplay)
                    video_elem.setAttribute('autoplay', 'autoplay');

                elem.appendChild(video_elem);

                var player = {
                    _videoElem: video_elem
                };

                player.destroy = function() {
                    try {
                        player.player.dispose();
                    } catch (e) {
                    }

                    try {
                        elem.removeChild(player._videoElem);
                    } catch (e) {

                    }
                };

                player.bufferVideoById = bufferVideoById.bind(player);
                player.playVideoById = playVideoById.bind(player);
                player.continuePlay = continuePlay.bind(player);
                player.whenVideoEnd = whenVideoEnd.bind(player);
                player.whenStartPlaying = whenStartPlaying.bind(player);
                player.isPlaying = isPlaying.bind(player);
                player.isPaused = isPaused.bind(player);

                player.emulateEvent = emulateEvent.bind(player);


                player._videoElem.addEventListener('ended', function() {
                    player.play_stop_dfd.resolve();
                });

                player_dfd.resolve(player);


                return player_dfd.promise;
            });
        }
    };
})();