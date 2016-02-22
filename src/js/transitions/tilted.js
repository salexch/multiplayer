module.exports = function(wrapper, params) {
    return require('./transitions.js')(wrapper, 'tilted', { speedIn : 400, easingIn : mina.easeinout });
};