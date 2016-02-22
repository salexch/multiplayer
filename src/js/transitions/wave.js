module.exports = function(wrapper, params) {
    return require('./transitions.js')(wrapper, 'wave', { speedIn : 400, easingIn : mina.easeinout });
};