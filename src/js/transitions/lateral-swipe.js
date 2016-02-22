module.exports = function(wrapper, params) {
    return require('./transitions.js')(wrapper, 'lateral-swipe', { speedIn : 500, easingIn : mina.easeinout });
};