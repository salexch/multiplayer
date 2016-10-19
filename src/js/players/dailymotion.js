/**
 * Created by alex on 2/15/2016.
 */
module.exports = (function() {

    var Q = require('q');

    var dfd = Q.defer();

    // 2. This code loads the IFrame Player API code asynchronously.
    var tag = document.createElement('script');

    tag.src = "https://api.dmcdn.net/all.js";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


    if ('function' == typeof window.dmAsyncInit) {
        var old_handler = window.dmAsyncInit;

        window.dmAsyncInit = function() {
            old_handler();
            dfd.resolve();
        }
    } else
        window.dmAsyncInit = function() {
            dfd.resolve();
        };

    function isAPIReady() {
        return dfd.promise;
    }



    function bufferVideoById(id, startSeconds) {
        var dfd = Q.defer();
        this.style.display = 'none';
        this._video_buffering = true;
        this._video_id = id;
        this.mute();
        //this.setQuality('1080');
        this.loadVideoById(id, startSeconds || 0);
        this.buffer_timer = setTimeout(function() {
            this.pauseVideo();
            dfd.resolve();
        }.bind(this), 1000);

        return dfd.promise;
    }

    function playVideoById(id, startSeconds) {
        clearTimeout(this.buffer_timer);
        this.style.display = 'block';
        //this.setQuality('1080');
        this.loadVideoById(id, startSeconds || 0);
    }


    function continuePlay() {
        //this.unMute();
        this.playVideo();
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
        getDuration: function(id) {
            var dfd = Q.defer();
            var nanoajax = require('../../vendor/nanoajax');


            nanoajax.ajax({
                url: 'https://api.dailymotion.com/video/' + id + '?fields=id,duration'
            }, function (code, responseText) {
                try {
                    var duration = ~~JSON.parse(responseText);
                    dfd.resolve(duration);
                } catch (e) {
                    dfd.resolve(-1);
                }
            });

            return dfd.promise;
        },
        createPlayer: function(elem, params) {
            console.debug('Player params', params);

            var map_events = {
                end: 0,
                playing: 1,
                pause: 2
            };

            var events = [],
                error_events = [];

            function execEvent(events, event_name) {
                var by_types = _.groupBy(events, 'type');
                (by_types[event_name] || []).forEach(function(event) {
                    if ('function' == typeof event.listener)
                        event.listener({
                            data: map_events[event_name]
                        });
                });
            }
            
            return isAPIReady().then(function() {
                var player_dfd = Q.defer();

                //elem.style.display = 'none';

                var dm_player_params = {
                    params: {
                        'api': '1',
                        'sharing-enable': false,
                    }
                };
                dm_player_params.width = params.width;
                dm_player_params.height = params.height;
                if (params.playerVars && 'object' == typeof params.playerVars) {

                    if ('undefined' != typeof params.playerVars.autoplay)
                        dm_player_params.params.autoplay = !!params.playerVars.autoplay;

                    if ('undefined' != typeof params.playerVars.controls)
                        dm_player_params.params.controls = !!params.playerVars.controls;

                    if ('undefined' != typeof params.playerVars.rel)
                        dm_player_params.params['endscreen-enable'] = !!params.playerVars.rel;

                    if ('undefined' != typeof params.playerVars.modestbranding)
                        dm_player_params.params['ui-logo'] = !!params.playerVars.modestbranding;

                    if ('undefined' != typeof params.playerVars.showinfo)
                        dm_player_params.params['ui-start_screen_info'] = !!params.playerVars.showinfo;
                }

                console.debug('Dailymotion player params', dm_player_params);
                //return false;
                var player = window.DM.player(elem, dm_player_params);

                var oldEventListener = player.addEventListener;

                oldEventListener('error', function() {
                    var code = 0;
                    if (player.error && player.error.code && player.error.code == 'PLAYER_ERR_VIDEO_NOT_SUPPORTED')
                        code = 5;

                    error_events.forEach(function(listener) {
                        listener({
                            data: code
                        });
                    });
                    console.debug('Dailymotion error', player.error);
                });

                var api_ready = false;
                oldEventListener('apiready', function() {
                    if (api_ready)
                        return;

                    api_ready = true;

                    console.debug('api ready');

                    player.play_stop_dfd = Q.defer();

                    player.loadVideoById = function(id, startSeconds) {
                        player.load(id, {
                            autoplay: true,
                            start: ~~(startSeconds || 0)
                        });

                        if (startSeconds) {
                            this._video_start = ~~startSeconds;
                        }
                    };
                    player.playVideo = player.play;
                    player.pauseVideo = player.pause;
                    player.seekTo = player.seek;
                    player.mute = function() {
                        player.setMuted(true);
                    };
                    var oldSetVolume = player.setVolume;
                    player.unMute = function() {
                        player.setMuted(false);
                    };
                    player.setVolume = function(volume) {
                        oldSetVolume(~~volume/100);
                    };
                    player.getDuration = function() {
                        return player.duration;
                    };
                    player.getCurrentTime = function() {
                        return player.currentTime;
                    };
                    player.getPlayerState = function() {
                        if (player.paused)
                            return 2;
                        if (player.ended)
                            return 0;

                        return 1;
                    };
                    player.destroy = function() {
                        events = [];
                        error_events = [];
                        player.parentNode.removeChild(player);
                        player = null;
                    };


                    player.bufferVideoById = bufferVideoById.bind(player);
                    player.playVideoById = playVideoById.bind(player);
                    player.continuePlay = continuePlay.bind(player);
                    player.whenVideoEnd = whenVideoEnd.bind(player);
                    player.whenStartPlaying = whenStartPlaying.bind(player);
                    player.isPlaying = isPlaying.bind(player);
                    player.isPaused = isPaused.bind(player);

                    player.emulateEvent = emulateEvent.bind(player);

                    //temprorary solution for api not ready!
                    setTimeout(function() {
                        player_dfd.resolve(player/*new Player(player, params)*/);
                    }, 2000);
                });


                events = [];
                error_events = [];

                oldEventListener('end', function() {
                    execEvent(events, 'end');
                    if (this.play_stop_dfd)
                        this.play_stop_dfd.resolve();
                }.bind(player));
                oldEventListener('pause', function() {
                    execEvent(events, 'pause');
                });
                oldEventListener('playing', function() {
                    if (this._video_start) {
                        this.seek(this._video_start);
                        this._video_start = 0;
                    }
                    if (this._video_buffering) {
                        this._video_buffering = false;
                    } else {
                        execEvent(events, 'playing');
                        if (this.play_back_dfd)
                            this.play_back_dfd.resolve();
                    }
                }.bind(player));

                player.addEventListener = function(event, listener) {
                    if (event == 'onStateChange') {
                        events = events.concat([{
                            type: 'end',
                            listener: listener
                        },{
                            type: 'pause',
                            listener: listener
                        },{
                            type: 'playing',
                            listener: listener
                        }]);
                    } else if (event == 'onError')
                        error_events.push(listener);
                };

                return player_dfd.promise;
            });
        }
    };
})();