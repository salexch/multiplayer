/**
 * Created by alex on 2/15/2016.
 */
module.exports = (function() {

    var API_NAME = 'DailyMotion';

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
            dfd.resolve(API_NAME);
        }
    } else
        window.dmAsyncInit = function() {
            dfd.resolve(API_NAME);
        };


    return {
        isAPIReady: function() {
            return dfd.promise;
        }
    };
})();