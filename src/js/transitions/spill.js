module.exports = function(wrapper, params) {
    return require('./transitions.js')(wrapper, 'spill', { speedIn : 400, easingIn : mina.easeinout });
};