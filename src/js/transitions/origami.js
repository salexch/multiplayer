module.exports = function(wrapper, params) {
    return require('./transitions.js')(wrapper, 'origami', { speedIn : 400, easingIn : mina.easeinout });
};