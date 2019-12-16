jQuery(document).ready(function($){
	//if you change this breakpoint in the style.css file (or _layout.scss if you use SASS), don't forget to update this value as well
	var MqL = 1170;
	//move nav element position according to window width
	moveNavigation();
	$(window).on('resize', function(){
		(!window.requestAnimationFrame) ? setTimeout(moveNavigation, 300) : window.requestAnimationFrame(moveNavigation);
	});

	//mobile - open lateral menu clicking on the menu icon
	$('.cd-nav-trigger').on('click', function(event){
		event.preventDefault();
		if( $('.cd-main-content').hasClass('nav-is-visible') ) {
			closeNav();
			$('.cd-overlay').removeClass('is-visible');
		} else {
			$(this).addClass('nav-is-visible');
			$('.cd-primary-nav').addClass('nav-is-visible');
			$('.cd-main-header').addClass('nav-is-visible');
			$('.cd-main-content').addClass('nav-is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
				$('body').addClass('overflow-hidden');
			});
			toggleSearch('close');
			$('.cd-overlay').addClass('is-visible');
		}
	});

	//open search form
	$('.cd-search-trigger').on('click', function(event){
		event.preventDefault();
		toggleSearch();
		closeNav();
	});

	//close lateral menu on mobile 
	$('.cd-overlay').on('swiperight', function(){
		if($('.cd-primary-nav').hasClass('nav-is-visible')) {
			closeNav();
			$('.cd-overlay').removeClass('is-visible');
		}
	});
	$('.nav-on-left .cd-overlay').on('swipeleft', function(){
		if($('.cd-primary-nav').hasClass('nav-is-visible')) {
			closeNav();
			$('.cd-overlay').removeClass('is-visible');
		}
	});
	$('.cd-overlay').on('click', function(){
		closeNav();
		toggleSearch('close')
		$('.cd-overlay').removeClass('is-visible');
	});


	//prevent default clicking on direct children of .cd-primary-nav 
	$('.cd-primary-nav').children('.has-children').children('a').on('click', function(event){
		event.preventDefault();
	});
	//open submenu
	$('.has-children').children('a').on('click', function(event){
		if( !checkWindowWidth() ) event.preventDefault();
		var selected = $(this);
		if( selected.next('ul').hasClass('is-hidden') ) {
			//desktop version only
			selected.addClass('selected').next('ul').removeClass('is-hidden').end().parent('.has-children').parent('ul').addClass('moves-out');
			selected.parent('.has-children').siblings('.has-children').children('ul').addClass('is-hidden').end().children('a').removeClass('selected');
			$('.cd-overlay').addClass('is-visible');
		} else {
			selected.removeClass('selected').next('ul').addClass('is-hidden').end().parent('.has-children').parent('ul').removeClass('moves-out');
			$('.cd-overlay').removeClass('is-visible');
		}
		toggleSearch('close');
	});

	//submenu items - go back link
	$('.go-back').on('click', function(){
		$(this).parent('ul').addClass('is-hidden').parent('.has-children').parent('ul').removeClass('moves-out');
	});

	function closeNav() {
		$('.cd-nav-trigger').removeClass('nav-is-visible');
		$('.cd-main-header').removeClass('nav-is-visible');
		$('.cd-primary-nav').removeClass('nav-is-visible');
		$('.has-children ul').addClass('is-hidden');
		$('.has-children a').removeClass('selected');
		$('.moves-out').removeClass('moves-out');
		$('.cd-main-content').removeClass('nav-is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
			$('body').removeClass('overflow-hidden');
		});
	}

	function toggleSearch(type) {
		if(type=="close") {
			//close serach 
			$('.cd-search').removeClass('is-visible');
			$('.cd-search-trigger').removeClass('search-is-visible');
			$('.cd-overlay').removeClass('search-is-visible');
		} else {
			//toggle search visibility
			$('.cd-search').toggleClass('is-visible');
			$('.cd-search-trigger').toggleClass('search-is-visible');
			$('.cd-overlay').toggleClass('search-is-visible');
			if($(window).width() > MqL && $('.cd-search').hasClass('is-visible')) $('.cd-search').find('input[type="search"]').focus();
			($('.cd-search').hasClass('is-visible')) ? $('.cd-overlay').addClass('is-visible') : $('.cd-overlay').removeClass('is-visible') ;
		}
	}

	function checkWindowWidth() {
		//check window width (scrollbar included)
		var e = window, 
            a = 'inner';
        if (!('innerWidth' in window )) {
            a = 'client';
            e = document.documentElement || document.body;
        }
        if ( e[ a+'Width' ] >= MqL ) {
			return true;
		} else {
			return false;
		}
	}

	function moveNavigation(){
		var navigation = $('.cd-nav');
  		var desktop = checkWindowWidth();
        if ( desktop ) {
			navigation.detach();
			navigation.insertBefore('.cd-header-buttons');
		} else {
			navigation.detach();
			navigation.insertAfter('.cd-main-content');
		}
	}
	/**********************************/
	/*       Course  Quick View       */
	/**********************************/
	
	//final width --> this is the quick view image slider width
	//maxQuickWidth --> this is the max-width of the quick-view panel
	var sliderFinalWidth = 400,
		maxQuickWidth = 900;

	//open the quick view panel
	$('.cd-trigger').on('click', function(event){
		var selectedImage = $(this).parent('.cd-item').children('img'),
			slectedImageUrl = selectedImage.attr('src');

		$('body').addClass('overlay-layer');
		animateQuickView(selectedImage, sliderFinalWidth, maxQuickWidth, 'open');

		//update the visible slider image in the quick view panel
		//you don't need to implement/use the updateQuickView if retrieving the quick view data with ajax
		updateQuickView(slectedImageUrl);
	});

	//close the quick view panel
	$('body').on('click', function(event){
		if( $(event.target).is('.cd-close') || $(event.target).is('body.overlay-layer')) {
			closeQuickView( sliderFinalWidth, maxQuickWidth);
		}
	});
	$(document).keyup(function(event){
		//check if user has pressed 'Esc'
    	if(event.which=='27'){
			closeQuickView( sliderFinalWidth, maxQuickWidth);
		}
	});

	//quick view slider implementation
	$('.cd-quick-view').on('click', '.cd-slider-navigation a', function(){
		updateSlider($(this));
	});

	//center quick-view on window resize
	$(window).on('resize', function(){
		if($('.cd-quick-view').hasClass('is-visible')){
			window.requestAnimationFrame(resizeQuickView);
		}
	});

	function updateSlider(navigation) {
		var sliderConatiner = navigation.parents('.cd-slider-wrapper').find('.cd-slider'),
			activeSlider = sliderConatiner.children('.selected').removeClass('selected');
		if ( navigation.hasClass('cd-next') ) {
			( !activeSlider.is(':last-child') ) ? activeSlider.next().addClass('selected') : sliderConatiner.children('li').eq(0).addClass('selected'); 
		} else {
			( !activeSlider.is(':first-child') ) ? activeSlider.prev().addClass('selected') : sliderConatiner.children('li').last().addClass('selected');
		} 
	}

	function updateQuickView(url) {
		$('.cd-quick-view .cd-slider li').removeClass('selected').find('img[src="'+ url +'"]').parent('li').addClass('selected');
	}

	function resizeQuickView() {
		var quickViewLeft = ($(window).width() - $('.cd-quick-view').width())/2,
			quickViewTop = ($(window).height() - $('.cd-quick-view').height())/2;
		$('.cd-quick-view').css({
		    "top": quickViewTop,
		    "left": quickViewLeft,
		});
	} 

	function closeQuickView(finalWidth, maxQuickWidth) {
		var close = $('.cd-close'),
			activeSliderUrl = close.siblings('.cd-slider-wrapper').find('.selected img').attr('src'),
			selectedImage = $('.empty-box').find('img');
		//update the image in the gallery
		if( !$('.cd-quick-view').hasClass('velocity-animating') && $('.cd-quick-view').hasClass('add-content')) {
			selectedImage.attr('src', activeSliderUrl);
			animateQuickView(selectedImage, finalWidth, maxQuickWidth, 'close');
		} else {
			closeNoAnimation(selectedImage, finalWidth, maxQuickWidth);
		}
	}

	function animateQuickView(image, finalWidth, maxQuickWidth, animationType) {
		//store some image data (width, top position, ...)
		//store window data to calculate quick view panel position
		var parentListItem = image.parent('.cd-item'),
			topSelected = image.offset().top - $(window).scrollTop(),
			leftSelected = image.offset().left,
			widthSelected = image.width(),
			heightSelected = image.height(),
			windowWidth = $(window).width(),
			windowHeight = $(window).height(),
			finalLeft = (windowWidth - finalWidth)/2,
			finalHeight = finalWidth * heightSelected/widthSelected,
			finalTop = (windowHeight - finalHeight)/2,
			quickViewWidth = ( windowWidth * .8 < maxQuickWidth ) ? windowWidth * .8 : maxQuickWidth ,
			quickViewLeft = (windowWidth - quickViewWidth)/2;

		if( animationType == 'open') {
			//hide the image in the gallery
			parentListItem.addClass('empty-box');
			//place the quick view over the image gallery and give it the dimension of the gallery image
			$('.cd-quick-view').css({
			    "top": topSelected,
			    "left": leftSelected,
			    "width": widthSelected,
			}).velocity({
				//animate the quick view: animate its width and center it in the viewport
				//during this animation, only the slider image is visible
			    'top': finalTop+ 'px',
			    'left': finalLeft+'px',
			    'width': finalWidth+'px',
			}, 1000, [ 400, 20 ], function(){
				//animate the quick view: animate its width to the final value
				$('.cd-quick-view').addClass('animate-width').velocity({
					'left': quickViewLeft+'px',
			    	'width': quickViewWidth+'px',
				}, 300, 'ease' ,function(){
					//show quick view content
					$('.cd-quick-view').addClass('add-content');
				});
			}).addClass('is-visible');
		} else {
			//close the quick view reverting the animation
			$('.cd-quick-view').removeClass('add-content').velocity({
			    'top': finalTop+ 'px',
			    'left': finalLeft+'px',
			    'width': finalWidth+'px',
			}, 300, 'ease', function(){
				$('body').removeClass('overlay-layer');
				$('.cd-quick-view').removeClass('animate-width').velocity({
					"top": topSelected,
				    "left": leftSelected,
				    "width": widthSelected,
				}, 500, 'ease', function(){
					$('.cd-quick-view').removeClass('is-visible');
					parentListItem.removeClass('empty-box');
				});
			});
		}
	}
	function closeNoAnimation(image, finalWidth, maxQuickWidth) {
		var parentListItem = image.parent('.cd-item'),
			topSelected = image.offset().top - $(window).scrollTop(),
			leftSelected = image.offset().left,
			widthSelected = image.width();

		$('body').removeClass('overlay-layer');
		parentListItem.removeClass('empty-box');
		$('.cd-quick-view').velocity("stop").removeClass('add-content animate-width is-visible').css({
			"top": topSelected,
		    "left": leftSelected,
		    "width": widthSelected,
		});
	}
});

$(function() {
  $('.footer-links-holder h5').click(function () {
    $(this).parent().toggleClass('active');
  });
});
