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

    return {
        createPlayer: function(elem, params) {
            return isAPIReady().then(function() {
                var player_dfd = Q.defer();

                //elem.style.display = 'none';

                var dm_player_params = {
                    params: {
                        'sharing-enable': false,
                    }
                };
                dm_player_params.width = params.width;
                dm_player_params.height = params.height;
                if (params.playerVars && 'object' == typeof params.playerVars) {

                    if (params.playerVars.autoplay)
                        dm_player_params.params.autoplay = params.playerVars.autoplay;

                    if (params.playerVars.controls)
                        dm_player_params.params.controls = params.playerVars.controls;

                    if (params.playerVars.rel)
                        dm_player_params.params['endscreen-enable'] = params.playerVars.rel;

                    if (params.playerVars.modestbranding)
                        dm_player_params.params['ui-logo'] = params.playerVars.modestbranding;

                    if (params.playerVars.showinfo)
                        dm_player_params.params['ui-start_screen_info'] = params.playerVars.showinfo;
                }

                var player = new window.DM.player(elem, dm_player_params);

                var oldEventListener = player.addEventListener;

                oldEventListener('apiready', function() {
                    player_dfd.resolve(player/*new Player(player, params)*/);
                });


/*                player.addEventListener = function(event, listener) {
                    if (event == 'onStateChange') {
                        oldEventListener('end', function() {
                            listener({
                                data: 0
                            });
                        });
                        oldEventListener('pause', function() {
                            listener({
                                data: 2
                            });
                        });
                        oldEventListener('playing', function() {
                            listener({
                                data: 1
                            });
                        });
                    }
                };*/

                events = [];

                oldEventListener('end', function() {
                    execEvent(events, 'end');
                });
                oldEventListener('pause', function() {
                    execEvent(events, 'pause');
                });
                oldEventListener('playing', function() {
                    execEvent(events, 'playing');
                });

                player.addEventListener = function(event, listener) {
                    if (event == 'onStateChange') {
                        events.concat([{
                            type: 'end',
                            listener: listener
                        },{
                            type: 'pause',
                            listener: listener
                        },{
                            type: 'playing',
                            listener: listener
                        }]);
                    }
                };

                return player_dfd.promise;
            });
        }
    };
})();