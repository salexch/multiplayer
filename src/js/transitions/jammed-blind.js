module.exports = function(wrapper, params) {
    return require('./transitions.js')(wrapper, 'jammed-blind', { speedIn : 200, easingIn : mina.linear });
};