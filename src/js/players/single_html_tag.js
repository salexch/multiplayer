/**
 * Created by alex on 10/22/2016.
 */

var Q = require('q');
var _ = require('lodash');

module.exports = (function() {

    var single_video = document.createElement('video');


    function bufferVideoById(id, startSeconds) {
        this._buffer_dfd = Q.defer();

        this.is_buffering = true;

        this.curr_video = {
            api: 'html',
            id: id,
            startSeconds: startSeconds
        };

        this.elem.style.display = 'none';
        //this.mute();
        //this.loadVideoById(id, startSeconds);
        //this.setPlaybackQuality('highres');
        /*        this.buffer_timer = setTimeout(function() {
         this.is_buffering = false;
         //this.pauseVideo();
         this._buffer_dfd.resolve();
         }.bind(this), 30 * 1000);*/

        this.is_buffering = false;
        //this.pauseVideo();
        this._buffer_dfd.resolve();

        return this._buffer_dfd.promise;
    }

    function playVideoById(id, startSeconds) {
        clearTimeout(this.buffer_timer);
        this.elem.style.display = 'block';
        //this.setPlaybackQuality('highres');
        this.loadVideoById(id, startSeconds);
    }


    function continuePlay() {
        this.elem.style.display = 'block';
        //this.unMute();
        this.loadVideoById(this.curr_video.id, this.curr_video.startSeconds);
        //this.playVideo();
    }

    function whenVideoEnd() {
        return this.play_stop_dfd.promise;
    }

    function whenStartPlaying() {
        if (this.play_back_dfd)
            this.play_back_dfd.reject();

        this.play_back_dfd = Q.defer();

        this.setVideoElem(single_video);

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

    function createPlayer(elem, params) {

        var Player = function(elem, params) {
            var video;

            this.elem = elem;

            var buffering = false,
                playing = false;

            var events = [],
                error_events = [];

            var map_events = {
                end: 0,
                playing: 1,
                pause: 2,
                buffering: 3
            };

            var that = this;

            function execEvent(events, event_name) {
                var by_types = _.groupBy(events, 'type');
                (by_types[event_name] || []).forEach(function(event) {
                    if ('function' == typeof event.listener) {
                        event.listener(_.assignWith({}, that.curr_video, {
                            data: map_events[event_name]
                        }));
                    }
                });
            }

            //------------Methods----------------
            this.loadVideoById = function(src, startSeconds) {
                //this.elem.autoplay = true;
                that.setVideoElem(single_video);

                //if (!video.src)
                video.src = src;

                //video.load();
                video.play();
                if (startSeconds) {
                    video.currentTime = startSeconds;
                    if (that.curr_video)
                        that.curr_video.startSeconds = 0;
                }
            };

            this.playVideo = function() {
                video.play();
            };
            this.pauseVideo = function() {
                try {
                    video.pause();
                } catch (e) {
                    console.log('[html player] Error calling pause', e);
                }
            };
            this.seekTo = function(sec) {
                video.currentTime = sec;
            };
            this.mute = function() {
                video.muted = true;
            };
            this.unMute = function() {
                video.muted = false;
            };
            this.setVolume = function(volume) {
                video.volume = volume / 100;
            };
            this.getDuration = function() {
                return video.duration;
            };
            this.getCurrentTime = function() {
                return video.currentTime;
            };
            this.getPlayerState = function() {
                if (video.paused)
                    return 2;
                if (video.ended)
                    return 0;

                return 1;
            };
            this.destroy = function() {
                events = [];
                error_events = [];
                that._destroy = true;
                try {
                    elem.removeChild(video);
                } catch (e) {

                }
                elem.style.display = 'none';
                video = null;
                //player = null;
            };

            this.addEventListener = function(event, listener) {
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

            this.setVideoElem = function(_video) {

                if (_video.parentNode)
                    _video.parentNode.removeChild(_video);

                video = _video;
                video.removeAttribute('src');
                video.src = '';
                elem.appendChild(video);

                if (params.width)
                    video.style.width = params.width || '100%';

                if (params.height)
                    video.style.height = params.height || '100%';

                video.controls = false;
                if (params.controls)
                    video.controls = params.controls;

                //Fires when the loading of an audio/video is aborted
                video.onabort = function() {
                    if (that._destroy)
                        return false;

                    buffering = false;
                    playing = false;
                    execEvent(events, 'end');
                    that.play_stop_dfd.resolve();
                };

                //Fires when the browser can start playing the audio/video
                video.oncanplay = function() {};

                //Fires when the browser can play through the audio/video without stopping for buffering
                video.oncanplaythrough = function() {};

                //Fires when the duration of the audio/video is changed
                video.ondurationchange = function() {};

                //Fires when the current playlist is empty
                video.onemptied = function() {};

                //Fires when the current playlist is ended
                video.onended = function() {
                    buffering = false;
                    playing = false;
                    execEvent(events, 'end');
                    that.play_stop_dfd.resolve();
                };

                //Fires when an error occurred during the loading of an audio/video
                video.onerror = function(e) {
                    console.log('[html video tag event]', 'error', e);
                };

                //Fires when the browser has loaded the current frame of the audio/video
                video.onloadeddata = function() {};

                //Fires when the browser has loaded meta data for the audio/video
                video.onloadedmetadata = function() {};

                //Fires when the browser starts looking for the audio/video
                video.onloadstart = function() {};

                //Fires when the audio/video has been paused
                video.onpause = function() {
                    if (that._destroy)
                        return false;

                    buffering = false;
                    playing = false;
                    execEvent(events, 'pause');
                };

                //Fires when the audio/video has been started or is no longer paused
                video.onplay = function() {
                    buffering = false;
                    playing = true;

                    if (that.play_back_dfd && !that.is_buffering) {
                        that.play_back_dfd.resolve(that.curr_video);
                        execEvent(events, 'playing');
                    } else if (that.is_buffering) {
                        that.is_buffering = false;
                        clearTimeout(that.buffer_timer);
                        that.buffer_timer = setTimeout(function() {
                            //that.pauseVideo();
                            that._buffer_dfd.resolve();
                        }, 300);
                    } else {
                        execEvent(events, 'playing');
                    }
                };

                //Fires when the audio/video is playing after having been paused or stopped for buffering
                video.onplaying = function() {
                    buffering = false;
                    playing = true;
                };

                //Fires when the browser is downloading the audio/video
                video.onprogress = function() {
                    console.log('[html video tag event]', 'progress');
                    buffering = true;
                    playing = false;
                };

                //Fires when the playing speed of the audio/video is changed
                video.onratechange = function() {};

                //Fires when the user is finished moving/skipping to a new position in the audio/video
                video.onseeked = function() {};

                //Fires when the user starts moving/skipping to a new position in the audio/video
                video.onseeking = function() {};

                //Fires when the browser is trying to get media data, but data is not available
                video.onstalled = function() {
                    console.log('[html video tag event]', 'stalled');
                    /*                buffering = false;
                     playing = false;
                     execEvent(events, 'end');*/
                };

                //Fires when the browser is intentionally not getting media data
                video.onsuspend = function() {
                    console.log('[html video tag event]', 'suspend');
                };

                //Fires when the current playback position has changed
                video.ontimeupdate = function() {};

                //Fires when the volume has been changed
                video.onvolumechange = function() {};

                //Fires when the video stops because it needs to buffer the next frame
                video.waiting = function() {
                    console.log('[html video tag event]', 'waiting');
                    //execEvent(events, 'buffering');
                };
            }

        };

        return new Player(elem, params);
    }

    return {
        getDuration: function(id) {
            var dfd = Q.defer();
            var video = document.createElement('video');
            video.src = id;
            //video.autoplay = true;
            video.ondurationchange = function() {
                dfd.resolve(20 * 60);
                //dfd.resolve(video.duration);
                document.body.removeChild(video);
                video = null;
            };

            document.body.appendChild(video);

            return dfd.promise;
        },
        createPlayer: function(elem, params) {
            var player_dfd = Q.defer();

            var player = createPlayer(elem, params);

            player.play_stop_dfd = Q.defer();
            player.bufferVideoById = bufferVideoById.bind(player);
            player.playVideoById = playVideoById.bind(player);
            player.continuePlay = continuePlay.bind(player);
            player.whenVideoEnd = whenVideoEnd.bind(player);
            player.whenStartPlaying = whenStartPlaying.bind(player);
            player.isPlaying = isPlaying.bind(player);
            player.isPaused = isPaused.bind(player);

            player.emulateEvent = emulateEvent.bind(player);

            player_dfd.resolve(player);

            return player_dfd.promise;
        }
    };
})();