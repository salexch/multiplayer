module.exports = function(wrapper, params) {
    return require('./transitions.js')(wrapper, 'frame-it', { speedIn : 300, easingIn : mina.easeinout });
};