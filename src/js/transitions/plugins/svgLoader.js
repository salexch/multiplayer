/**
 * svgLoader.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2014, Codrops
 * http://www.codrops.com
 */
;( function( window ) {
	
	'use strict';

	var Q = require('q');

	function extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	function SVGLoader( el, options ) {
		this.el = el;
		this.options = extend( {}, this.options );
		extend( this.options, options );
		this._init();
	}

	SVGLoader.prototype.options = {
		speedIn : 500,
		easingIn : mina.linear
	};

	SVGLoader.prototype._init = function() {
		var s = Snap( this.el.querySelector( 'svg' ) );
		this.path = s.select( 'path' );
		this.initialPath = this.path.attr('d');
		
		var openingStepsStr = this.el.getAttribute( 'data-opening' );
		this.openingSteps = openingStepsStr ? openingStepsStr.split(';') : '';
		this.openingStepsTotal = openingStepsStr ? this.openingSteps.length : 0;
		if( this.openingStepsTotal === 0 ) return;

		// if data-closing is not defined then the path will animate to its original shape
		var closingStepsStr = this.el.getAttribute( 'data-closing' ) ? this.el.getAttribute( 'data-closing' ) : this.initialPath;
		this.closingSteps = closingStepsStr ? closingStepsStr.split(';') : '';
		this.closingStepsTotal = closingStepsStr ? this.closingSteps.length : 0;
		
		this.isAnimating = false;

		if( !this.options.speedOut ) {
			this.options.speedOut = this.options.speedIn;
		}
		if( !this.options.easingOut ) {
			this.options.easingOut = this.options.easingIn;
		}
	};

	SVGLoader.prototype.show = function() {
		if( this.isAnimating ) return false;
		this.isAnimating = true;
		// animate svg
		var dfd = Q.defer();

		var self = this,
			onEndAnimation = function() {
				dfd.resolve();
			};
		this._animateSVG( 'in', onEndAnimation );
		this.el.classList.add('show');
		return dfd.promise;
	};

	SVGLoader.prototype.hide = function(immediate) {
		var dfd = Q.defer(),
			onEndAnimation = function() {
				// reset path
				this.path.attr( 'd', this.initialPath );
				this.el.classList.remove('show');
				this.isAnimating = false;
				dfd.resolve();
			}.bind(this);


		if (immediate)
			onEndAnimation();
		else
			this._animateSVG( 'out', onEndAnimation);

		return dfd.promise;
	};

	SVGLoader.prototype._animateSVG = function( dir, callback ) {
		var self = this,
			pos = 0,
			steps = dir === 'out' ? this.closingSteps : this.openingSteps,
			stepsTotal = dir === 'out' ? this.closingStepsTotal : this.openingStepsTotal,
			speed = dir === 'out' ? self.options.speedOut : self.options.speedIn,
			easing = dir === 'out' ? self.options.easingOut : self.options.easingIn,
			nextStep = function( pos ) {
				if( pos > stepsTotal - 1 ) {
					if( callback && typeof callback == 'function' ) {
						callback();
					}
					return;
				}
				self.path.animate( { 'path' : steps[pos] }, speed, easing, function() { nextStep(pos); } );
				pos++;
			};

		nextStep(pos);
	};

	// add to global namespace
	window.SVGLoader = SVGLoader;

})( window );