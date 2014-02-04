/* 
 * Developed by Harun eggleton - Under MIT License
 * jquery 1.8.3
 * jQuery-mutate (https://github.com/jqui-dot-net/jQuery-mutate)
 * jQuery Boilerplate - v3.3.1 ( http://jqueryboilerplate.com ) - Made by Zeno Rocha - Under MIT License
 */

;(function ( $, window, document, undefined ) {
	// Create defaults 
	var pluginName = "heliumSlider",
			defaults = {				
			paneFade: true ,        // pane fade in: true or false
			paneXOffset: [300] ,    // pane animate X offset: pixel value
			paneYOffset: [0] ,      // pane animate Y offset: pixel value
			paneDelay: [1000] ,     // pane delay before animate: milliseconds
			paneSpeed: [1500] ,     // pane speed of animate: milliseconds
			useNav: true ,          // use navigation: true or false
			autoPlay: 6000 ,        // auto play slides. delay between transitions: milliseconds (negative values reverse direction.  any value between -20 and 20 disables autoplay)
			speed: 100 ,            // speed of main slide animations
			easing: "swing" ,       // easing type: "swing" or "linear"
			mainFadeIn: 500 ,       // fade new slide in speed: milliseconds
			mainFadeOut: 500 ,      // fade old slide out speed: milliseconds
			afterSlide: function(){
				                    // this callback function fires after the main slide transition takes place
			} ,
			pauseOnHover: true      // pause autoplay on hover: true or false
	},
	priv = {
			slideWidth: false,
			slideCount: false,
			totalWidth: false,
			curr: 1,
			autoTimer: 0,
			paneT: ['auto'],
			paneR: ['auto'],
			paneB: ['auto'],
			paneL: ['auto'],
			paneTCalc: ['auto'],
			paneRCalc: ['auto'],
			paneBCalc: ['auto'],
			paneLCalc: ['auto'],
			targetSlide: false
	};

	function Plugin ( element, options ) {
			this.element = element;
			// use extend to merge contents of defaults, user options, and private variables
			this.vars = $.extend( {}, defaults, options, priv );
			this._defaults = defaults;
			this._priv = priv;
			this._name = pluginName;
			this.init();
	}

	Plugin.prototype = {
//============================================================================
// Init function (All initial logic goes here)
//============================================================================
			init: function () {
				var orig = this;
				this.setWidth();
				$(this.element).mutate('height width', function(el,info) { 
				orig.setWidth();
				});
				if(this.vars.useNav){this.initNav()}
				if(this.vars.useNav){this.updateNav()}
				$(this.element).children('ul.slide-nav').children('li').click(function(){
					orig.vars.targetSlide = $(this).attr('data-slide-index');
					orig.gotoSlide();
				});
				//============================================================================
				// Fade (Set fade variables and initial opacity)
				//============================================================================
				if (this.vars.paneFade) {this.vars.paneFade = 0} else {this.vars.paneFade = 1};
				$(this.element).find('li').find('div.pane').css('opacity',this.vars.paneFade);

				var i = -1;
				while (++i < $(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').length){	
				//============================================================================
				// Pane Calc (calculates position, offsets and animation for pane element)
				//============================================================================
				if ($(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).css('left') != 'auto'){ 
					this.vars.paneL[i] = Number($(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).css('left').slice(0,-2));
				} else if($(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).css('right') != 'auto'){ 
					this.vars.paneXOffset[i] = this.vars.paneXOffset[i] * -1 ;
					this.vars.paneR[i] = Number($(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).css('right').slice(0,-2));
				};
				if ($(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).css('top') != 'auto'){ 
					this.vars.paneT[i] = Number($(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).css('top').slice(0,-2)) ;
				} else if($(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).css('bottom') != 'auto'){ 
					this.vars.paneYOffset[i] = this.vars.paneYOffset[i] * -1 ;
					this.vars.paneB[i] = Number($(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).css('bottom').slice(0,-2));
				};
				this.vars.paneLCalc[i] = this.vars.paneL[i] + this.vars.paneXOffset[i];
				this.vars.paneRCalc[i] = this.vars.paneR[i] + this.vars.paneXOffset[i];
				this.vars.paneTCalc[i] = this.vars.paneT[i] + this.vars.paneYOffset[i];
				this.vars.paneBCalc[i] = this.vars.paneB[i] + this.vars.paneYOffset[i];
				$(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).css('left' , this.vars.paneL[i] + this.vars.paneXOffset[i] + 'px');
				$(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).css('right' , this.vars.paneR[i] + this.vars.paneXOffset[i] + 'px');
				$(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).css('top' , this.vars.paneT[i] + this.vars.paneYOffset[i] + 'px');
				$(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).css('bottom' , this.vars.paneB[i] + this.vars.paneYOffset[i] + 'px');
				// transition initial slide
				$(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).css('left' , this.vars.paneLCalc[i]+ 'px').css('right' , this.vars.paneRCalc[i] + 'px').css('top' , this.vars.paneTCalc[i] + 'px').css('bottom' , this.vars.paneBCalc[i] + 'px').delay(this.vars.paneDelay[i]).animate({ 
					left: this.vars.paneL[i] ,
					right: this.vars.paneR[i] ,
					top: this.vars.paneT[i] ,
					bottom: this.vars.paneB[i] ,
					opacity: 1 
				}, this.vars.paneSpeed[i], this.vars.easing, this.setWidth());

				}
				//============================================================================
				// Next and Previous button triggers
				//============================================================================
				$(this.element).find('.next').click( function(){
					orig.nextGate();
				});
				$(this.element).find('.prev').click( function(){
					orig.prevGate();
				});

				$(this.element).on('touchstart', function(e){
					var touchx = e.clientX;
					alert(touchx);
				});




				//============================================================================
				// Auto Play
				//============================================================================
				if (this.vars.autoPlay >= 20){ this.vars.autoTimer = setTimeout( function(){
						orig.nextGate()
					}, this.vars.autoPlay + this.vars.speed)}
				if (this.vars.autoPlay <= -20){ this.vars.autoTimer = setTimeout( function(){
						orig.prevGate()
					}, (this.vars.autoPlay - this.vars.speed) * -1)}

				if(this.vars.pauseOnHover){this.hoverPause()}

			},

//============================================================================
// setWidth function.  
// (calculates and sets all widths, resets position.  run initially and on mutate.)
//============================================================================
			setWidth: function () {					
			    this.vars.slideWidth = $(this.element).outerWidth();
			    this.vars.slideCount = $(this.element).find('.slide-holder').find('li').length;
			    this.vars.totalWidth = this.vars.slideCount * this.vars.slideWidth;
			    $(this.element).find('ul.slide-holder').width(this.vars.totalWidth).css('left', ((this.vars.curr - 1) * this.vars.slideWidth) * -1);
			    $(this.element).find('.slide-holder').find('li').width(this.vars.slideWidth);
			    if($(this.element).hasClass('loading')){
			    	this.finishLoad();
			    }
			},

//============================================================================
// finishLoad function.  
// (removes loading styles upon running)
//============================================================================
			finishLoad: function () {
				$(this.element).find('ul.slide-holder').animate({ opacity: 1 }, 400);
				$(this.element).find('ul.slide-holder').promise().done(function(){
					$(this).parents('.loading').removeClass('loading');
				});
			},


//============================================================================
// Nav functions 
// (Creates nav items and populates this.vars.targetSlide var for next and prev functions)
//============================================================================
			initNav: function () {
				$(this.element).find('.slide-nav').show();
				var g = 1;
				$(this.element).find('.slide-nav').html(' ')
				for (g = 1; g <= this.vars.slideCount; ++g)  {
					$(this.element).find('.slide-nav').html($(this.element).find('.slide-nav').html() + '<li data-slide-index="'+g+'"></li>');
				}
			},
			updateNav: function () {
				if($(this.element).find('.slide-nav li').length != this.vars.slideCount){
					this.initNav();
				}
				$(this.element).find('.slide-nav li').removeClass('active');
				$(this.element).find('.slide-nav li:nth-child('+this.vars.curr+')').addClass('active');
			},
			gotoSlide: function () {		
					if(this.vars.targetSlide > this.vars.curr){
						this.nextGate()
				} else if(this.vars.targetSlide < this.vars.curr){
						this.prevGate()
				} else {
					this.vars.targetSlide = false;				
				}
			},

//============================================================================
// Next Slide Function (animate all elements. update "this.vars.curr". loop on last slide.)
//============================================================================

			nextSlide: function () {		
			// add .trans class to mark start of animation
				$(this.element).find('.slide-holder').addClass('trans');


				var i = -1;
				while (++i < $(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').length){	
			// animate out pane
				$(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).stop().css('left' , this.vars.paneL[i] + 'px').css('right' , this.vars.paneR[i] + 'px').css('top' , this.vars.paneT[i] + 'px').css('bottom' , this.vars.paneB[i] + 'px').animate({ 
					left: this.vars.paneL[i] - this.vars.paneXOffset[i] ,
					right: this.vars.paneR[i] - this.vars.paneXOffset[i] ,
					top: this.vars.paneT[i] - this.vars.paneYOffset[i] ,
					bottom: this.vars.paneB[i] - this.vars.paneYOffset[i] ,
					opacity: this.vars.paneFade 
				}, this.vars.paneSpeed[i], this.vars.easing);
				}

				var orig = this;
			// animate slide and apply loop styles if necessary.  added fade animations
				if(this.vars.targetSlide && this.vars.mainFadeIn && this.vars.mainFadeOut){		
					$(this.element).find('.slide-holder').stop().animate({ opacity: 0 }, this.vars.mainFadeOut).animate({ left: ((this.vars.targetSlide-1) * this.vars.slideWidth)* -1 }, this.vars.speed).animate({ opacity: 1 }, this.vars.mainFadeIn);
					this.vars.curr = this.vars.targetSlide;
				} else if(this.vars.curr < this.vars.slideCount && this.vars.mainFadeIn && this.vars.mainFadeOut){
					$(this.element).find('.slide-holder').stop().animate({ opacity: 0 }, this.vars.mainFadeOut).animate({ left: ((this.vars.curr-1) * this.vars.slideWidth)* -1 - this.vars.slideWidth }, this.vars.speed).animate({ opacity: 1 }, this.vars.mainFadeIn);
					this.vars.curr++;
				} else if(this.vars.curr >= this.vars.slideCount && this.vars.mainFadeIn && this.vars.mainFadeOut){
					$(this.element).find('.slide-holder').stop().animate({ opacity: 0 }, this.vars.mainFadeOut).animate({ left: 0 }, this.vars.speed).animate({ opacity: 1 }, this.vars.mainFadeIn);
					this.vars.curr = 1;
				} else if(this.vars.targetSlide){	
					$(this.element).find('.slide-holder').stop().animate({ left: ((this.vars.targetSlide-1) * this.vars.slideWidth)* -1 }, this.vars.speed);
					this.vars.curr = this.vars.targetSlide;
				} else if(this.vars.curr < this.vars.slideCount){
					$(this.element).find('.slide-holder').stop().animate({ left: ((this.vars.curr-1) * this.vars.slideWidth)* -1 - this.vars.slideWidth }, this.vars.speed);
					this.vars.curr++;
				} else if(this.vars.curr >= this.vars.slideCount){
					$(this.element).find('.slide-holder').find('li:first-child').addClass('loop').css('right','-'+this.vars.slideWidth+'px');
					$(this.element).find('.slide-holder').find('li:nth-child(2)').css('margin-left',this.vars.slideWidth+'px');
					$(this.element).find('.slide-holder').stop().animate({ left: '-=' + this.vars.slideWidth }, this.vars.speed, function(){
						$(orig.element).find('.slide-holder').find('li:first-child').removeClass('loop').css('right','auto');
						$(orig.element).find('.slide-holder').find('li:nth-child(2)').css('margin-left','0px');
						$(orig.element).find('.slide-holder').css('left', '0px');
					});
					this.vars.curr = 1;
				} 

			// animate in new pane
			var x = -1;
			while (++x < $(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').length){	
				$(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(x).stop().css('left' , this.vars.paneLCalc[x] + 'px').css('right' , this.vars.paneRCalc[x] + 'px').css('top' , this.vars.paneTCalc[x] + 'px').css('bottom' , this.vars.paneBCalc[x] + 'px').delay(this.vars.paneDelay[x]).animate({ 
					left: this.vars.paneL[x] ,
					right: this.vars.paneR[x] ,
					top: this.vars.paneT[x] ,
					bottom: this.vars.paneB[x] ,
					opacity: 1 
				}, this.vars.paneSpeed[x], this.vars.easing);
			}

				this.vars.targetSlide = false;
				if(this.vars.useNav){this.updateNav()}
			// remove .trans class and reset timer when animation is complete
				$(this.element).find('.slide-holder.trans').promise().done(function(){
							$(orig.element).find('.slide-holder').removeClass('trans');
							if (orig.vars.autoPlay >= 20 && !($(this.element).find('.pauser.paused').length)){ 
								orig.vars.autoTimer = setTimeout(function(){
									orig.nextGate();
								}, orig.vars.autoPlay);
							}
							if (orig.vars.autoPlay <= -20 && !($(this.element).find('.pauser.paused').length)){ 
								orig.vars.autoTimer = setTimeout(function(){
									orig.prevGate();
								}, orig.vars.autoPlay * -1) }
							orig.vars.afterSlide();
				});
			},

//============================================================================
// Previous Slide Function (animate all elements. update "this.vars.curr". loop on first slide.)
//============================================================================
			prevSlide: function () {										

			// add .trans class to mark start of animation
				$(this.element).find('.slide-holder').addClass('trans');


				var i = -1;
				while (++i < $(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').length){	
			// animate out pane
				$(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).stop().css('left' , this.vars.paneL[i] + 'px').css('right' , this.vars.paneR[i] + 'px').css('top' , this.vars.paneT[i] + 'px').css('bottom' , this.vars.paneB[i] + 'px').animate({ 
					left: this.vars.paneLCalc[i] ,
					right: this.vars.paneRCalc[i] ,
					top: this.vars.paneTCalc[i] ,
					bottom: this.vars.paneBCalc[i] ,
					opacity: this.vars.paneFade 
				}, this.vars.paneSpeed[i], this.vars.easing);
				}

				var orig = this;
			// animate slide and apply loop styles if necessary
				if(this.vars.targetSlide && this.vars.mainFadeIn && this.vars.mainFadeOut){		
					$(this.element).find('.slide-holder').stop().animate({ opacity: 0 }, this.vars.mainFadeOut).animate({ left: ((this.vars.targetSlide-1) * this.vars.slideWidth)* -1 }, this.vars.speed).animate({ opacity: 1 }, this.vars.mainFadeIn);
					this.vars.curr = this.vars.targetSlide;
				} else if(this.vars.curr > 1 && this.vars.mainFadeIn && this.vars.mainFadeOut){
					$(this.element).find('.slide-holder').stop().animate({ opacity: 0 }, this.vars.mainFadeOut).animate({ left: ((this.vars.curr-1) * this.vars.slideWidth)* -1 + this.vars.slideWidth  }, this.vars.speed).animate({ opacity: 1 }, this.vars.mainFadeIn);
					this.vars.curr--;
				} else if(this.vars.curr <= 1 && this.vars.mainFadeIn && this.vars.mainFadeOut){
					$(this.element).find('.slide-holder').stop().animate({ opacity: 0 }, this.vars.mainFadeOut).animate({ left: (this.vars.slideWidth - this.vars.totalWidth) }, this.vars.speed).animate({ opacity: 1 }, this.vars.mainFadeIn);
					this.vars.curr = this.vars.slideCount;
				} else if(this.vars.targetSlide){		
					$(this.element).find('.slide-holder').stop().animate({ left: ((this.vars.targetSlide-1) * this.vars.slideWidth)* -1 }, this.vars.speed);
					this.vars.curr = this.vars.targetSlide;
				} else if(this.vars.curr > 1){
					$(this.element).find('.slide-holder').stop().animate({ left: ((this.vars.curr-1) * this.vars.slideWidth)* -1 + this.vars.slideWidth  }, this.vars.speed);
					this.vars.curr--;
				} else if(this.vars.curr <= 1){
					$(this.element).find('.slide-holder').find('li:first-child').addClass('loop').css('right','-'+this.vars.slideWidth+'px');
					$(this.element).find('.slide-holder').find('li:nth-child(2)').css('margin-left',this.vars.slideWidth+'px');
					$(this.element).find('.slide-holder').stop().css('left','-'+this.vars.totalWidth+'px').animate({ left: '+=' + this.vars.slideWidth }, this.vars.speed, function(){			
						$(orig.element).find('.slide-holder').find('li:first-child').removeClass('loop').css('right','auto');
						$(orig.element).find('.slide-holder').find('li:nth-child(2)').css('margin-left','0px');
					});
					this.vars.curr = this.vars.slideCount;
				} 

				var x = -1;
				while (++x < $(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').length){	
			// animate in new pane
				$(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(x).stop().css('left' , (this.vars.paneL[x] - this.vars.paneXOffset[x]) + 'px').css('right' , (this.vars.paneR[x] - this.vars.paneXOffset[x]) + 'px').css('top' , (this.vars.paneT[x] - this.vars.paneYOffset[x]) + 'px').css('bottom' , (this.vars.paneB[x] - this.vars.paneYOffset[x]) + 'px').delay(this.vars.paneDelay[x]).animate({ 
					left: this.vars.paneL[x] ,
					right: this.vars.paneR[x] ,
					top: this.vars.paneT[x] ,
					bottom: this.vars.paneB[x] ,
					opacity: 1 
				}, this.vars.paneSpeed[x], this.vars.easing);
				}

				this.vars.targetSlide = false;
				if(this.vars.useNav){this.updateNav()}


			// remove .trans class and reset timer when animation is complete
				$(this.element).find('.slide-holder.trans').promise().done(function(){
							$(orig.element).find('.slide-holder').removeClass('trans');
							if (orig.vars.autoPlay >= 20 && !($(this.element).find('.pauser.paused').length)){ 
								orig.vars.autoTimer = setTimeout(function(){
									orig.nextGate();
								}, orig.vars.autoPlay);
							}
							if (orig.vars.autoPlay <= -20 && !($(this.element).find('.pauser.paused').length)){ 
								orig.vars.autoTimer = setTimeout(function(){
									orig.prevGate();
								}, orig.vars.autoPlay * -1) }
							orig.vars.afterSlide();
				});
			},
			nextGate: function () {
				if (!$(this.element).find('.slide-holder.trans').length) {
					clearTimeout(this.vars.autoTimer);
					this.nextSlide();
				}
			},
			prevGate: function () {
				if (!$(this.element).find('.slide-holder.trans').length) {
					clearTimeout(this.vars.autoTimer);
					this.prevSlide();
				}
			},
			hoverPause: function () {
				$(this.element).append('<div class="pauser"></div>');
				var origopacity = $(this.element).find('.pauser').css('opacity');
				var orig = this;
				$(this.element).find('.pauser').css('opacity',0)
				$(this.element).find('ul.slide-holder, .pauser').mouseover(function(){
					clearTimeout(orig.vars.autoTimer);
					$(orig.element).find('.pauser').stop().animate({opacity: origopacity}, 200);
					$(orig.element).find('.pauser').addClass('paused');
				});
				$(this.element).find('ul.slide-holder').mouseout(function(){
					if (orig.vars.autoPlay >= 20){ orig.vars.autoTimer = setTimeout( function(){
						orig.nextGate()
					}, orig.vars.autoPlay + orig.vars.speed)}
					if (orig.vars.autoPlay <= -20){ orig.vars.autoTimer = setTimeout( function(){
						orig.prevGate()
					}, (orig.vars.autoPlay - orig.vars.speed) * -1)}
					$(orig.element).find('.pauser').stop().animate({opacity: 0}, 200);
					$(orig.element).find('.pauser').removeClass('paused');
				});
			}
	};

    // A lightweight plugin wrapper around the constructor,
    $.fn[pluginName] = function ( options ) {
        var args = arguments;
        if (options === undefined || typeof options === 'object') {
            return this.each(function () {
                if (!$.data(this, 'plugin_' + pluginName)) {
                    $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
                }
            });
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            var returns;
            this.each(function () {
                var instance = $.data(this, 'plugin_' + pluginName);
                if (instance instanceof Plugin && typeof instance[options] === 'function') {
                    returns = instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
                }
                if (options === 'destroy') {
                  $.data(this, 'plugin_' + pluginName, null);
                }
            });
            return returns !== undefined ? returns : this;
        }
    };

})( jQuery, window, document );