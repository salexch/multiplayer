module.exports = function(wrapper, params) {
    return require('./transitions.js')(wrapper, 'curtain', { speedIn : 700, easingIn : mina.easeinout });
};