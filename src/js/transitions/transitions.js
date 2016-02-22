/**
 * Created by alex on 2/22/2016.
 */
var _ = require('lodash');

var random_string = +new Date;
var transition_class = 'pageload-overlay_' + random_string;

var css = require('./transitions.css.tmpl');
var style = document.createElement('style');
document.head.appendChild(style);
style.innerText = _.template(css)({
    class_name: transition_class
});

require('imports-loader?this=>window,fix=>module.exports=0!./plugins/snap.svg-min.js');
require('./plugins/svgLoader.js');


module.exports = function(parent_el, animation, params) {

    var temp = document.createElement('div');
    temp.innerHTML = _.template(require('./animations/' + animation + '.html'))({
        class_name: transition_class
    });

    var container = temp.querySelector('div');

    parent_el.appendChild(container);

    //cleanup
    temp = null;

    return new SVGLoader( container, params );
};