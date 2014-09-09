/* 
 * Helium Slider v1.9.2
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
		navTemplate: "" ,       // template for contents of nav list item
		autoPlay: 6000 ,        // auto play slides. delay between transitions: milliseconds (negative values reverse direction.  any value between -20 and 20 disables autoplay)
		speed: 100 ,            // speed of main slide animations
		easing: "swing" ,       // easing type: "swing" or "linear"
		mainFadeIn: 500 ,       // fade new slide in speed: milliseconds
		mainFadeOut: 500 ,      // fade old slide out speed: milliseconds
		afterSlide: function(){
			                    // this callback function fires after the main slide transition takes place
		} ,
		autoStop: false ,       // stop auto play after this number of transitions: number or false
		pauseOnAutoStop: false, // when autoplay ends, pause and keep controls available. clicking play button replays autoStop transitions -MG 8/21/14
		pauseOnHover: false ,   // pause autoplay on hover: true or false
		pauseButton: false ,    // pause autoplay on hover: true or false
		pauseOnFocus: false     // pause autoplay when any element in the slider is focused: true or false
	},
	priv = {
		slideWidth: false,
		slideCount: false,
		totalWidth: false,
		curr: 1,
		autoTimer: 0,
		autoPlayCount: 0,
		paneT: ['auto'],
		paneR: ['auto'],
		paneB: ['auto'],
		paneL: ['auto'],
		paneTPost: ['auto'],
		paneRPost: ['auto'],
		paneBPost: ['auto'],
		paneLPost: ['auto'],
		paneTPre: ['auto'],
		paneRPre: ['auto'],
		paneBPre: ['auto'],
		paneLPre: ['auto'],
		focusable: 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]',
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
			this.paneCalc();
			$(this.element).mutate('height width', function(el,info) { 
			orig.setWidth();
			orig.paneCalc();
			});
			if(this.vars.useNav){this.initNav()}
			if(this.vars.useNav){this.updateNav()}
			$(this.element).find('ul.slide-nav').find('li').click(function(){
				orig.goToSlide($(this).attr('data-slide-index'));
			});


			//============================================================================
			// Fade (Set fade variables and initial opacity)
			//============================================================================
			if (this.vars.paneFade) {this.vars.paneFade = 0} else {this.vars.paneFade = 1};
			$(this.element).find('li').find('div.pane').css('opacity',this.vars.paneFade);

			//prevent tabbing to slides that are not displayed
			$(orig.element).find('li').find(orig.vars.focusable).attr('tabindex','-1');
			$(orig.element).find('li:nth-child('+ orig.vars.curr +')').find(orig.vars.focusable).removeAttr('tabindex');

			//============================================================================
			// Transition initial slide panes
			//============================================================================
			var i = -1;
			while (++i < $(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').length){
			$(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).css('left' , this.vars.paneLPost[i]+ 'px').css('right' , this.vars.paneRPost[i] + 'px').css('top' , this.vars.paneTPost[i] + 'px').css('bottom' , this.vars.paneBPost[i] + 'px').delay(this.vars.paneDelay[i]).animate({ 
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
				orig.nextSlide();
				return false;
			});
			$(this.element).find('.prev').click( function(){
				orig.prevSlide();
				return false;
			});


			//============================================================================
			// custom touchswipe trigger
			//============================================================================
			var touchStartX;
			var touchMoveX;
			$(this.element).on('touchstart', function(e){
				touchStartX = e.originalEvent.touches[0].pageX;
			});
			$(this.element).on('touchmove', function(e){
				touchMoveX = e.originalEvent.changedTouches[0].pageX;
				if(touchMoveX - touchStartX < -40){
					$(this.element).find('.slide-holder.trans').removeClass('trans');
					orig.nextSlide();
				}
				if(touchMoveX - touchStartX > 40){
					$(this.element).find('.slide-holder.trans').removeClass('trans');
					orig.prevSlide();						
				}
			});




			//============================================================================
			// Auto Play
			//============================================================================
			if (this.vars.autoPlay >= 20){ this.vars.autoTimer = setTimeout( function(){
					orig.vars.autoPlayCount++;
					orig.nextSlide()
				}, this.vars.autoPlay + this.vars.speed)}
			if (this.vars.autoPlay <= -20){ this.vars.autoTimer = setTimeout( function(){
					orig.vars.autoPlayCount++;
					orig.prevSlide()
				}, (this.vars.autoPlay - this.vars.speed) * -1)}

			this.initPause();

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
// Pane Calc
// (calculates pane positions and offsets. run initially and on mutate.)
//============================================================================
		paneCalc: function () {
			var i = -1;
			while (++i < $(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').length){
				$(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).removeAttr('style');
				if ($(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).removeAttr('style').css('left') != 'auto'){ 
					this.vars.paneL[i] = Number($(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).removeAttr('style').css('left').slice(0,-2));
				} else if($(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).removeAttr('style').css('right') != 'auto'){ 
					this.vars.paneR[i] = Number($(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).removeAttr('style').css('right').slice(0,-2));
				};
				if ($(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).removeAttr('style').css('top') != 'auto'){ 
					this.vars.paneT[i] = Number($(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).removeAttr('style').css('top').slice(0,-2)) ;
				} else if($(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).removeAttr('style').css('bottom') != 'auto'){ 
					this.vars.paneB[i] = Number($(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).removeAttr('style').css('bottom').slice(0,-2));
				};
				this.vars.paneLPost[i] = this.vars.paneL[i] + this.vars.paneXOffset[i];
				this.vars.paneRPost[i] = this.vars.paneR[i] - this.vars.paneXOffset[i];
				this.vars.paneTPost[i] = this.vars.paneT[i] + this.vars.paneYOffset[i];
				this.vars.paneBPost[i] = this.vars.paneB[i] - this.vars.paneYOffset[i];
				this.vars.paneLPre[i] = this.vars.paneL[i] - this.vars.paneXOffset[i];
				this.vars.paneRPre[i] = this.vars.paneR[i] + this.vars.paneXOffset[i];
				this.vars.paneTPre[i] = this.vars.paneT[i] - this.vars.paneYOffset[i];
				this.vars.paneBPre[i] = this.vars.paneB[i] + this.vars.paneYOffset[i];
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
			var orig = this;
			$(this.element).find('.slide-nav').show();
			var g = 1;
			$(this.element).find('.slide-nav').html(' ')
			for (g = 1; g <= this.vars.slideCount; ++g)  {
				$(this.element).find('.slide-nav').html($(this.element).find('.slide-nav').html() + ' <li data-slide-index="'+g+'">'+orig.vars.navTemplate+'<div class="access">Slide '+g+'</div></li>');
			}
		},
		updateNav: function () {
			if($(this.element).find('.slide-nav li').length != this.vars.slideCount){
				this.initNav();
			}
			$(this.element).find('.slide-nav li').removeClass('active').find('.access span').remove();
			$(this.element).find('.slide-nav li:nth-child('+this.vars.curr+')').addClass('active').find('.access').append(' <span>(active)</span></div>');

		},

//============================================================================
// Next Slide Function (animate all elements. update "this.vars.curr". loop on last slide.)
//============================================================================

		changeSlide: function () {		
			var orig = this;


		// add .trans class to mark start of animation
			$(this.element).find('.slide-holder').addClass('trans');


			this.paneCalc();

			if(orig.vars.targetSlide > orig.vars.curr){
				var paneLOut = orig.vars.paneLPre;
				var paneROut = orig.vars.paneRPre;
				var paneTOut = orig.vars.paneTPre;
				var paneBOut = orig.vars.paneBPre;
				var paneLIn = orig.vars.paneLPost;
				var paneRIn = orig.vars.paneRPost;
				var paneTIn = orig.vars.paneTPost;
				var paneBIn = orig.vars.paneBPost;
			} else {				
				var paneLOut = orig.vars.paneLPost;
				var paneROut = orig.vars.paneRPost;
				var paneTOut = orig.vars.paneTPost;
				var paneBOut = orig.vars.paneBPost;
				var paneLIn = orig.vars.paneLPre;
				var paneRIn = orig.vars.paneRPre;
				var paneTIn = orig.vars.paneTPre;
				var paneBIn = orig.vars.paneBPre;
			}
			var i = -1;
			while (++i < $(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').length){	
		// animate out pane
			$(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(i).stop().css('left' , this.vars.paneL[i] + 'px').css('right' , this.vars.paneR[i] + 'px').css('top' , this.vars.paneT[i] + 'px').css('bottom' , this.vars.paneB[i] + 'px').animate({ 
				left: paneLOut[i] ,
				right: paneROut[i] ,
				top: paneTOut[i] ,
				bottom: paneBOut[i] ,
				opacity: this.vars.paneFade 
			}, this.vars.paneSpeed[i], this.vars.easing);
			}

		// animate slide and apply loop styles if necessary.  added fade animations
			if(this.vars.mainFadeIn && this.vars.mainFadeOut){		
				if(this.vars.targetSlide > this.vars.slideCount){
					this.vars.targetSlide = 1;
				} else if(this.vars.targetSlide < 1){
					this.vars.targetSlide = this.vars.slideCount;
				}
				$(this.element).find('.slide-holder').stop().animate({ opacity: 0 }, this.vars.mainFadeOut).animate({ left: ((this.vars.targetSlide-1) * this.vars.slideWidth)* -1 }, this.vars.speed).animate({ opacity: 1 }, this.vars.mainFadeIn);
				this.vars.curr = this.vars.targetSlide;
			} else if(this.vars.targetSlide > this.vars.slideCount || this.vars.targetSlide < 1){
				$(this.element).find('.slide-holder').find('li:first-child').addClass('loop').css('right','-'+this.vars.slideWidth+'px');
				$(this.element).find('.slide-holder').find('li:nth-child(2)').css('margin-left',this.vars.slideWidth+'px');
				if(this.vars.targetSlide > this.vars.slideCount){
					$(orig.element).find('.slide-holder').stop().animate({ left: '-=' + orig.vars.slideWidth }, orig.vars.speed, function(){
						$(orig.element).find('.slide-holder').find('li:first-child').removeClass('loop').css('right','auto');
						$(orig.element).find('.slide-holder').find('li:nth-child(2)').css('margin-left','0px');
						$(orig.element).find('.slide-holder').css('left', '0px');
					});
					orig.vars.curr = 1;
				} else {
					$(orig.element).find('.slide-holder').stop().css('left','-'+orig.vars.totalWidth+'px').animate({ left: '+=' + orig.vars.slideWidth }, orig.vars.speed, function(){			
						$(orig.element).find('.slide-holder').find('li:first-child').removeClass('loop').css('right','auto');
						$(orig.element).find('.slide-holder').find('li:nth-child(2)').css('margin-left','0px');
					});
					orig.vars.curr = this.vars.slideCount;
				}
			} else {				
				$(this.element).find('.slide-holder').stop().animate({ left: ((this.vars.targetSlide-1) * this.vars.slideWidth)* -1 }, this.vars.speed);
				this.vars.curr = this.vars.targetSlide;
			}

		// animate in new pane
		var x = -1;
		while (++x < $(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').length){	
			$(this.element).find('li:nth-child('+ this.vars.curr +')').find('div.pane').eq(x).stop().css('left' , paneLIn[x] + 'px').css('right' , paneRIn[x] + 'px').css('top' , paneTIn[x] + 'px').css('bottom' , paneBIn[x] + 'px').delay(this.vars.paneDelay[x]).animate({ 
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
						if (orig.vars.autoPlay >= 20 && !$(orig.element).find('.pauser.paused').length && orig.vars.autoStop != orig.vars.autoPlayCount){ 
							orig.vars.autoTimer = setTimeout(function(){
								orig.vars.autoPlayCount++;
								orig.nextSlide();
							}, orig.vars.autoPlay);
						}
						if (orig.vars.autoPlay <= -20 && !$(orig.element).find('.pauser.paused').length && orig.vars.autoStop != orig.vars.autoPlayCount){ 
							orig.vars.autoTimer = setTimeout(function(){
								orig.vars.autoPlayCount++;
								orig.prevSlide();
							}, orig.vars.autoPlay * -1) }
						orig.vars.afterSlide();
						if(orig.vars.autoPlayCount == orig.vars.autoStop){
							if (orig.vars.pauseOnAutoStop == true){
								orig.stopAutoPlay(orig);
							}
							else{
								orig.vars.autoPlay = 0;
								orig.vars.pauseOnHover = false;
								orig.vars.pauseOnFocus = false;
								$(orig.element).find('.pauser, .controls').remove();
							}
						}
						$(orig.element).find('li').find(orig.vars.focusable).attr('tabindex','-1');
						$(orig.element).find('li:nth-child('+ orig.vars.curr +')').find(orig.vars.focusable).removeAttr('tabindex');
			});
		},

//============================================================================
// Next & Prev Functions
// (fire off next and previous. control timer and prevent next or previous during a slide transition)
//============================================================================

		nextSlide: function () {
			if (!$(this.element).find('.slide-holder.trans').length) {
				clearTimeout(this.vars.autoTimer);
				this.vars.targetSlide = this.vars.curr + 1;
				this.changeSlide();
			}
		},
		prevSlide: function () {
			if (!$(this.element).find('.slide-holder.trans').length) {
				clearTimeout(this.vars.autoTimer);
				this.vars.targetSlide = this.vars.curr - 1;
				this.changeSlide();
			}
		},
		goToSlide: function (target) {
			if (!$(this.element).find('.slide-holder.trans').length && target != this.vars.curr) {
				clearTimeout(this.vars.autoTimer);
				this.vars.targetSlide = target;
				this.changeSlide();
			}

		},

//============================================================================
// pause and resume functions
//============================================================================
		pauseAutoPlay: function (orig) {			
			clearTimeout(orig.vars.autoTimer);
			$(orig.element).find('.pauser').addClass('paused');
		},

		stopAutoPlay: function (orig) {			
			clearTimeout(orig.vars.autoTimer);
			$(orig.element).find('.pauser').addClass('paused stopped');
		},

		resumeAutoPlay: function (orig, speed) {
			if(!$(orig.element).find('.stopped').length){
				if (orig.vars.autoPlay >= 20){ orig.vars.autoTimer = setTimeout( function(){
					orig.vars.autoPlayCount++;
					if(orig.vars.autoStop == orig.vars.autoPlayCount - 1){
						orig.vars.autoPlayCount = 1;
					}
					orig.nextSlide()
				}, speed)}
				if (orig.vars.autoPlay <= -20){ orig.vars.autoTimer = setTimeout( function(){
					orig.vars.autoPlayCount++;
					if(orig.vars.autoStop == orig.vars.autoPlayCount - 1){
						orig.vars.autoPlayCount = 1;
					}
					orig.prevSlide()
				}, speed)}
				$(orig.element).find('.pauser').removeClass('paused');
			}
		},


//============================================================================
// initPause function
//============================================================================
		initPause: function () {
			var orig = this;
			if(!($(this.element).find('.pauser').length) && (this.vars.pauseOnFocus || this.vars.pauseOnHover || this.vars.pauseButton)){
				$(orig.element).append('<div class="controls"><a href="" class="pauser">Pause</a></div>');
				if(orig.vars.pauseButton){
					$(orig.element).find('.controls').addClass('on').append('<a href="" class="player">Play</a>');
				}
			}
			if(this.vars.pauseOnHover){
				$(orig.element).find('ul.slide-holder, .pauser').mouseover(function(event){
					orig.pauseAutoPlay(orig);
					event.stopPropagation();
				});
				$(orig.element).find('ul.slide-holder').mouseout(function(event){
					if((!orig.vars.pauseOnFocus || !$(orig.element).find('*:focus').length) && !$(orig.element).find('.pauser.stopped').length){
						orig.resumeAutoPlay(orig, orig.vars.autoPlay)
					}
					event.stopPropagation();					
				});
			}
			if(this.vars.pauseOnFocus){
				$(orig.element).focusin(function(event){
					orig.pauseAutoPlay(orig);
					event.stopPropagation();
				});
				$(orig.element).focusout(function(event){
					if((!orig.vars.pauseOnHover || !$(orig.element).find('*:hover').length) && !$(orig.element).find('.pauser.stopped').length){
						orig.resumeAutoPlay(orig, orig.vars.autoPlay)
					}
					event.stopPropagation();					
				});
			}
			if(this.vars.pauseButton){
				$(orig.element).find('.pauser').click(function(event){
					orig.stopAutoPlay(orig);
					return false;;
				});
				$(orig.element).find('.player').click(function(event){
					if($(orig.element).find('.stopped').length){
						$(orig.element).find('.pauser').removeClass('stopped');
							orig.resumeAutoPlay(orig, 100);
						}
					return false;				
				});
			}
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