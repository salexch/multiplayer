
module.exports = function(wrapper, params) {
    return require('./transitions.js')(wrapper, 'circle', { speedIn : 300, easingIn : mina.easeinout });
};