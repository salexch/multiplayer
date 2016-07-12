/**
 * Created by alex on 2/15/2016.
 */

var Q = require('q');
var _ = require('lodash');

module.exports = (function() {



    function bufferVideoById(id, seconds) {
        var dfd = Q.defer();

        this.is_buffering = true;

        this.curr_video = {
            api: 'youtube',
            id: id
        };

        this.elem.style.display = 'none';
        this.mute();
        this.loadVideoById(id);
        //this.setPlaybackQuality('highres');
        setTimeout(function() {
            this.is_buffering = false;
            this.pauseVideo();
            dfd.resolve();
        }.bind(this), seconds || 0.3);

        return dfd.promise;
    }

    function playVideoById(id) {
        this.elem.style.display = 'block';
        //this.setPlaybackQuality('highres');
        this.loadVideoById(id);
    }


    function continuePlay() {
        //this.unMute();
        this.playVideo();
        this.elem.style.display = 'block';
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

    function createPlayer(elem, params) {
        var video = document.createElement('video');

        elem.appendChild(video);
        
        if (params.width)
            video.style.width = params.width || '100%';

        if (params.height)
            video.style.height = params.height || '100%';

        video.controls = false;
        if (params.controls)
            video.controls = params.controls;
        
        var Player = function(video) {
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

            function execEvent(events, event_name) {
                var by_types = _.groupBy(events, 'type');
                (by_types[event_name] || []).forEach(function(event) {
                    if ('function' == typeof event.listener)
                        event.listener({
                            data: map_events[event_name]
                        });
                });
            }

            //Fires when the loading of an audio/video is aborted
            video.onabort = function() {
                buffering = false;
                playing = false;
                execEvent(events, 'end');
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
            };

            //Fires when an error occurred during the loading of an audio/video
            video.onerror = function() {};

            //Fires when the browser has loaded the current frame of the audio/video
            video.onloadeddata = function() {};

            //Fires when the browser has loaded meta data for the audio/video
            video.onloadedmetadata = function() {};

            //Fires when the browser starts looking for the audio/video
            video.onloadstart = function() {};

            //Fires when the audio/video has been paused
            video.onpause = function() {
                buffering = false;
                playing = false;
                execEvent(events, 'pause');
            };

            //Fires when the audio/video has been started or is no longer paused
            video.onplay = function() {
                buffering = false;
                playing = true;
                execEvent(events, 'playing');
            };

            //Fires when the audio/video is playing after having been paused or stopped for buffering
            video.onplaying = function() {
                buffering = false;
                playing = true;
                execEvent(events, 'playing');
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


            //------------Methods----------------
            this.loadVideoById = function(src) {
                //this.elem.autoplay = true;
                video.src = src;
                video.play();
            };
            this.playVideo = function() {
                video.play();
            };
            this.pauseVideo = function() {
                video.pause();
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
                elem.removeChild(video);
                elem.style.display = 'none';
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
            
            
        };
        
        return new Player(video);
    }

    return {
        createPlayer: function(elem, params) {
            var player_dfd = Q.defer();

            var player = createPlayer(elem, params);

            //on ready event
/*            player.elem.oncanplay = function() {
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
            };*/
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


            player.addEventListener('onStateChange', function(e) {
                if (0 == e.data)
                    this.play_stop_dfd.resolve();
                else if (1 == e.data) {
                    //TODO don't fire while buffering by bufferVideoById func
                    if (this.play_back_dfd && !this.is_buffering)
                        this.play_back_dfd.resolve(this.curr_video);
                }
            }.bind(player));


            return player_dfd.promise;
        }
    };
})();