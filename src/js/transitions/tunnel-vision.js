module.exports = function(wrapper, params) {
    return require('./transitions.js')(wrapper, 'tunnel-vision', { speedIn : 300, easingIn : mina.easeinout });
};