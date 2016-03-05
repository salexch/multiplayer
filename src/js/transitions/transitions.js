/**
 * Created by alex on 2/22/2016.
 */
var _ = require('lodash');

var random_string = +new Date;
var transition_class = 'pageload-overlay_' + random_string;

var css = require('./transitions.css.tmpl');
var style = document.createElement('style');
document.head.appendChild(style);
style.title = transition_class;
style.innerText = _.template(css)({
    class_name: transition_class
});

require('imports-loader?this=>window,fix=>module.exports=0!./plugins/snap.svg-min.js');
require('./plugins/svgLoader.js');

function getStyleSheet(unique_title) {
    for(var i=0; i<document.styleSheets.length; i++) {
        var sheet = document.styleSheets[i];
        if(sheet.title == unique_title) {
            return sheet;
        }
    }
}

var style = getStyleSheet(transition_class),
    rules = style.rules;

    var bgcolorrule;
    for(var i = 0; i < rules.length; i++) {
        if (rules[i].selectorText == '.' + transition_class + '.show') {
            bgcolorrule = rules[i];
            break;
        }
    }
    var fgcolorrule;
    for(var i = 0; i < rules.length; i++) {
        if (rules[i].selectorText == '.' + transition_class + ' svg path') {
            fgcolorrule = rules[i];
            break;
        }
    }


module.exports = function(parent_el, animation, params) {

    var temp = document.createElement('div');
    temp.innerHTML = _.template(require('./animations/' + animation + '.html'))({
        class_name: transition_class
    });

    var container = temp.querySelector('div');

    parent_el.appendChild(container);

    //cleanup
    temp = null;

    return {
        animation: new SVGLoader( container, params ),
        setBackgroundColor: function(color) {
            bgcolorrule.style.background = color;
        },
        setForegroundColor: function(color) {
            fgcolorrule.style.fill = color;
        }
    }
};