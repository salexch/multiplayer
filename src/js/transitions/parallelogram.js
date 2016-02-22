module.exports = function(wrapper, params) {
    return require('./transitions.js')(wrapper, 'parallelogram', { speedIn : 300, speedOut : 600, easingIn : mina.easeinout, easingOut : mina.bounce });
};