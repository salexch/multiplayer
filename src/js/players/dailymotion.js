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

    return {
        createPlayer: function(elem, params) {
            return isAPIReady().then(function() {
                var player_dfd = Q.defer();

                elem.style.display = 'none';

                var player = new window.DM.player(elem, {
                    events: {
                        'onReady': function() {

                            player.play_stop_dfd = Q.defer();
                            player.bufferVideoById = bufferVideoById.bind(player);
                            player.playVideoById = playVideoById.bind(player);
                            player.continuePlay = continuePlay.bind(player);
                            player.whenVideoEnd = whenVideoEnd.bind(player);
                            player.addEventListener('onStateChange', function(e) {
                                if (window.YT.PlayerState.ENDED == e.data)
                                    this.play_stop_dfd.resolve();
                            }.bind(player));

                            player_dfd.resolve(player/*new Player(player, params)*/);
                        }
                    }
                });

                return player_dfd.promise;
            });
        }
    };
})();