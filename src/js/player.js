/**
 * Created by alex on 2/15/2016.
 */

var Q = require('q');
var _ = require('lodash');

module.exports = (function() {

    var debug = false;

    function debugLog() {
        if (debug)
            console.debug.apply(console, arguments);
    }


    function removeEmptyPlayerContainers() {
        var divs = this.wrapper.querySelectorAll('div');
        for(var i =0; i< divs.length; i++)
            this._wrapper.removeChild(divs[i]);
    }


    var player = function(element, player_params, options) {
        if ('string' == typeof element)
            element = document.getElementById(element);

        this._players = [];

        this._anim = {
            current: null,
            transitions: [],
            show: function() {},
            hide: function() {},
            hideAll: function() {}
        };

        this._wrapper = element;
        this._player_params = player_params;
        this._playlist_index = 0;
        this._playlist = [];
        this._mute = 0;
        this._loop = 0;
        this._shuffle = 0;
        this._events = [];

        this._player_params.width = '100%';
        this._player_params.height = '100%';


        if (options && options.useTransition) {
            this._anim.transitions = options.useTransition.map(function(transition_name) {
                return require('./transitions/' + transition_name + '.js')(this._wrapper);
            }.bind(this));

            this._anim.show = function(animation_name, bgcolor, fgcolor) {
                if (!animation_name)
                    this.current = _.shuffle(this.transitions)[0];
                else
                    this.current = this.transitions[options.useTransition.indexOf(animation_name)];

                this.current.setBackgroundColor(bgcolor || '#000');

                this.current.setForegroundColor(fgcolor || '#000');

                return this.current.animation.show();
            };

            this._anim.hide = function() {
                return this.current.animation.hide();
            };

            this._anim.hideAll = function() {
                this.transitions.forEach(function(transition) {
                    transition.animation.hide(true);
                });
            }
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

    function _playVideoAt(index) {
        var video = this._playlist[index];

        if (!video && this._loop) {
            this._playlist_index = 0;
            video = this._playlist[0];
        }

        if (video) {
            var player_elem = _createPlayerElem();
            this._wrapper.appendChild(player_elem);
            require('./players/' + video.api + '.js').createPlayer(player_elem, this._player_params).then(function(player) {
                this._players.push(player);
                player.bufferVideoById(video.id);
                _playList.call(this);
            }.bind(this));
        }
    }

    function _attachEvents() {
        if (this._events.length && this._players.length && this._players[0])
            this._events.forEach(function(event) {
                this._players[0].addEventListener(event.event, event.listener);
            }.bind(this));
    }

    function _playList() {
        this._players[0].whenVideoEnd().then(function() {
            this._players[0].mute();
            this._anim.hideAll();
            this._anim.show();
            this._playlist_index += 1;
            this._players[1].whenStartPlaying().then(function() {
                //console.debug('Playing video at ', this._playlist_index);
                this._anim.hide();
            }.bind(this));
            if (!this._mute)
                this._players[1].unMute();
            this._players[1].continuePlay();
            this._players[0].destroy();
            this._players.shift();

            _attachEvents.call(this);

            //TODO: find why it's not working!
            //removeEmptyPlayerPlaceholders().call(that);

            _playVideoAt.call(this, this._playlist_index + 1);
        }.bind(this));
    }

    player.prototype.loadPlaylist = function(params) {
        if (params.list.length < 1)
            return false;

        var is_active = this._players.length && (this._players[0].isPlaying() || this._players[0].isPaused());
/*        if (is_active)
            this.destroy(true);*/

        this._playlist = params.list || [];
        this.setShuffle(this._shuffle);

        this._playlist_index = ~~(params.index || 0);
        if (this._playlist_index >= this._playlist.length)
            this._playlist_index = 0;

        if (is_active) {
            this._players[1].destroy();
            var player_elem = _createPlayerElem();

            this._wrapper.appendChild(player_elem);

            require('./players/' + this._playlist[0].api + '.js').createPlayer(player_elem, this._player_params).then(function(player) {
                if (this._mute)
                    player.mute();
                this._players[1] = player;

                this._players[1].bufferVideoById(this._playlist[0].id).then(function() {
                    this._playlist_index = -1;
                    this._players[0].emulateEvent(0);
                }.bind(this));
            }.bind(this));

            return false;
        }

        var init_playlist = this._playlist.slice(this._playlist_index, 2);

        var players_dfd = init_playlist.map(function(video) {
            var player_elem = _createPlayerElem();

            this._wrapper.appendChild(player_elem);

            return require('./players/' + video.api + '.js').createPlayer(player_elem, this._player_params);
        }.bind(this));

        Q.all(players_dfd).then(function(res) {
            res.forEach(function(player) {
                if (this._mute)
                    player.mute();
                this._players.push(player);
            }.bind(this));

            _attachEvents.call(this);
            this._players[0].playVideoById(init_playlist[0].id);
            if (this._players[1])
                this._players[1].bufferVideoById(init_playlist[1].id);

            _playList.call(this);
        }.bind(this));
    };

    player.prototype.playVideo = function() {
        this._players[0].playVideo();
    };

    player.prototype.pauseVideo = function() {
        this._players[0].pauseVideo();
    };

    player.prototype.stopVideo = function() {
        this._players[0].stopVideo();
    };

    player.prototype.seekTo = function(seconds, allowSeekAhead) {
        this._players[0].seekTo(seconds, allowSeekAhead);
    };

    player.prototype.nextVideo = function() {
        this.playVideoAt(this._playlist_index + 1);
    };

    player.prototype.previousVideo = function() {
        this.playVideoAt(this._playlist_index - 1);
    };

    player.prototype.playVideoAt = function(index) {
        if (!this._playlist || !this._playlist.length || !this._playlist[index])
            return false;

        this._players[1].bufferVideoById(this._playlist[index].id).then(function() {
            this._playlist_index = index - 1;
            this._players[0].emulateEvent(0); //ended
        }.bind(this));
    };

    player.prototype.loadVideoById = function(params) {
        var data = {
            id: params.id,
            api: params.api
        };

        //TODO: cleanup
        this._playlist = [];
        this._playlist_index = 0;


        if (this._players.length && (this._players[0].isPlaying() || this._players[0].isPaused())) {
            this._playlist = [data];
            this.stopVideo();

            return false;
        }

        this._wrapper.innerHTML = '';

        var playlist = [data];

        if (this._loop)
            playlist.push(data);

        this.loadPlaylist(playlist);
    };

    player.prototype.mute = function() {
        this._mute = 1;
    };

    player.prototype.unMute = function() {
        this._mute = 0;
    };

    player.prototype.setLoop = function(is_loop) {
        this._loop = !!is_loop;
    };

    player.prototype.setShuffle = function(is_shuffle) {
        this._shuffle = !!is_shuffle;
        if (this._shuffle)
            this._playlist = _.shuffle(this._playlist);
    };

    player.prototype.getCurrentTime = function() {
        try {
            return this._players[0].getCurrentTime();
        } catch (e) {
            return 0;
        }
    };

    player.prototype.getDuration = function() {
        return this._players[0].getDuration();
    };

    player.prototype.getVideoLoadedFraction = function() {
        return this._players[0].getVideoLoadedFraction();
    };

    player.prototype.getPlaylistIndex = function() {
        return this._playlist_index;
    };

    player.prototype.getPlayerState = function() {
        return this._players[0].getPlayerState();
    };

    player.prototype.addEventListener = function(event, listener) {
        this._events.push({
            event: event,
            listener: listener
        });

        //this._players[0].addEventListener(event, listener);
        _attachEvents.call(this);
    };

    player.prototype.removeEventListener = function(event, listener) {
        for (var i = 0; i < this._events.length; i++)
            if (this._events[i].event == event && ('' + this._events[i].listener) == ('' + listener))
                break;

        var remove = this._events.splice(i, 1);

        this._players[0].removeEventListener(remove.event, remove.listener);
    };

    player.prototype.destroy = function(soft) {
        this._playlist = [];
        this._playlist_index = 0;
        if (!soft) {
            this._loop = false;
            this._shuffle = false;
            this._events = [];
        }
        this._players.forEach(function(player) {
            player.destroy();
        });
        this._players = [];
        this._wrapper.innerHTML = '';
    };


    player.prototype.onStartPlaying = function() {

    };


    player.prototype.onPlayTimeChange = function() {

    };

    player.prototype.showTransition = function(effect_name, background_color, foreground_color) {
        this._anim.show(effect_name, background_color, foreground_color);
    };
    player.prototype.hideTransition = function() {
        this._anim.hide();
    };

    return {
        debug: function(is_debug) {
            debug = is_debug;
        },
        Player: player,
        PlayerState: PlayerState
    }
})();