module.exports = function(wrapper, params) {
    return require('./transitions.js')(wrapper, 'widescreen-wiper', { speedIn : 400, easingIn : mina.easeinout });
};