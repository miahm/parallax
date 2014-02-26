//Page Level Script

//Always start on top
window.scrollTo(0, 0);

//Local variables for the global scope
var autoScrollToSection = true;    //Variable to control when to auto scroll to intro and about
var animateHeader = false;      //For animating in the header - only the first time
var resetTimer = 0;             //To allow canceling of reset with a time delay
var scrollAnimInProgress = false;   //To stop subsequent animation
var reset = { //track the reset state of each section
    'home': 0, 
    'about': 0, 
    'botc': 0, 
    'ga': 0, 
    'kaplan': 0, 
    'connect': 0
};

/*
 * ============ Animation Control - Reset Display and Animate
 */
 //Function to reset the display items so they can be animated afterwards
 //@param = string, required    the section names - 'home', 'about', 'botc', 'ga', 'hkaplan', 'connect'
var resetDisplay = function(section){
    var header = $('header');
    var dWidth = $(window).width();
    
    switch (section){
        case 'home':
            var logo = $('#section_home .logo'),
                tagline = $('#section_home .tagline span');
            
            if ($(window).scrollTop() == 0 && header.hasClass('transparent')) {
                header.stop(true, false);
                header.css('opacity', 0).removeClass('transparent');
                animateHeader = true;
            }
            header.removeClass('transparent');
            
            logo.stop(true, false); tagline.stop(true, false);
            logo.css({'opacity': 0, 'top': '46%'}).removeClass('transparent');
            tagline.css({'opacity': 0, 'position': 'relative', 'top': 20 }).removeClass('transparent');
            
            logo = tagline = null;
            reset.home = 1;
        break;
        
        
        //===== Slide 2
        case 'about':
            var $statmnts = $('#section_about .statements span');
            var $photos = $('.photos div');
            
            $statmnts.stop(true, false); $photos.stop(true, false);
            
            $statmnts.css({'opacity': 0, 'top': -20 });
            $photos.css({'opacity': 0 });
            
            
            $photos.each(function (index, el) {
                //if (index == 0) var change = { 'left': '12%' };
                //if (index == 1) var change = { 'left': '40%' };
                if (index == 2) { var change = { 'bottom': 20 }; $(el).css(change); }
                
                //$(el).css(change);
            });
            
            var $opcityItems = $('#section_about [data-transitions-opacity=1]');
            $opcityItems.stop(true, false);
            $opcityItems.css({'opacity': 0 });
            
            $statmnts = $photos = $opcityItems = null;
            reset.about = 1;
            
        break;
        
    }
    
    header = null;
}

 //Function to carry out the animation of the display items 
 //@param = string, required    the section names - 'home', 'about', 'botc', 'ga', 'hkaplan', 'connect'
var animateSection = function(section){
    var header = $('header');
    var dWidth = $(window).width();

    switch (section){
        case 'home':
            var logo = $('#section_home .logo'),
                tagline = $('#section_home .tagline span');
                
            //Show the hidden items
            logo.stop(true, false).show( "slow" ).animate({ 'opacity': 1, top: '50%' }, 1000, function(){
                tagline.eq(0).stop(true, false).show( "slow" ).animate({ 'opacity': 1,  'top': 0 }, 1000, 'easeOutExpo');
                tagline.eq(1).stop(true, false).show( "slow" ).delay(200).animate({ 'opacity': 1,  'top': 0 }, 1200, 'easeOutExpo', function(){
                    //if header needs to animate - do so
                    if (animateHeader) header.stop(true, false).animate({ 'opacity': 1}, 1000);
                    
                    logo = tagline = null;
                });
            });
            reset.home = 0;
        break;
        
        
        
        //===== Slide 2
        case 'about':
            var $statmnts = $('#section_about .statements span');
            var $photos = $('.photos div');
            
            var showPhotos = function(){
                $photos.each(function (index, el) {
                    if (index == 0) var change = { 'opacity': 1 };
                    if (index == 1) var change = { 'opacity': 1 };
                    if (index == 2) var change = { 'opacity': 1,  'bottom': 0 };
                    
                    $(el).delay(150 * index).animate(change, 1200, 'easeOutQuart');
                    
                    
                    if (index == 2){
                        var $opcityItems = $('#section_about [data-transitions-opacity=1]');
                        $opcityItems.delay(1000).animate({'opacity': 1}, 1200, 'easeOutQuart');
                        
                        $statmnts = $photos = $opcityItems = null;
                    }
                });
            }
            
            $statmnts.each(function (index, el) {
                $(el).delay(200 * index).animate({'opacity': 1, 'top': 0 }, 'easeOutExpo', function(){
                    if (index == 2){
                        showPhotos();
                    }
                });
            });
            
            reset.about = 0;
            
        break;
        
    }
}


//Create a function that will be passed a slide number and then will scroll to that slide using jquerys animate. The Jquery
//easing plugin is also used, so we passed in the easing method of 'easeInOutQuint' which is available throught the plugin.
var goToByScroll = function(dataslide) {
    var htmlbody = $('html,body');
    htmlbody.stop( true, false ).animate({
        scrollTop: $('#section_' + dataslide).offset().top 
    }, 600,  function(){  htmlbody = null; });
}


jQuery(document).ready(function ($) {
    
    //Initiate the Tracker module
    $('.section').misoTracker(); //{context: '#main' }
    //$('[data-transition]').misoTracker(); //{context: '#main' }
    
    //DOM references to keep alive
    var header = $('header');
    var links = $('.navigation').find('li'),
        slide = $('.section'),
        button = $('.button');
    
    
    //========= Navigation related =============
    //Nav links
    links.click(function (e) {
        e.preventDefault();
        autoScrollToSection = false;
        
        dataslide = $(this).attr('data-slide');
        goToByScroll(dataslide);
        
        log(dataslide)
    });
    
    //Mobile size Menu
    var pull = $('a#pull'); //Menu Short
    pull.on('click', function(e){
        e.preventDefault();
        
        var mainMenu = $('ul.navigation'); //Main Menu
        
        //Toggle display
        mainMenu.hasClass('show') ?  mainMenu.removeClass('show') : mainMenu.addClass('show') ;
        mainMenu = null;
    });
    pull = null;
    
    
    
    //============= Window events ===============
    $(window).on('load', function(e){
        window.scrollTo(0, 0);
        
    });
    //==== Scroll Effects
    var scrollTimer = 0;
    $(window).on('scroll', function(e){
        
        $clear(scrollTimer);
        scrollTimer = (function(){
            
            log($('#section_home').data('misoTracker').pos);
            log($('#section_about').data('misoTracker').pos);
            
        }).delay(150);
        
    });
    //======= On resize
    $(window).on('resize', function(e){
        //Before After
        var $ba = $('.before_after'),
            $slider = $ba.find('.slider'),
            $after = $ba.find('.slides.after'),
            $before = $ba.find('.slides.before');
            
        $after.css('width', $before.width());
        
        $slider.css('left', $ba.width()/2 - $slider.width()/2);
        $after.css('left', $slider.css('left').toInt() + $slider.width()/2);
        
        
    });
    //======= On Section Change
    $(window).on('sectionchange', function(e){
        //log('SECTIONCHANGE fired ... ');
        //log(window.misoTracker.$section)
        
        var id = window.misoTracker.$section.attr('id'); 
        
        if (id == 'section_home'){
            autoScrollToSection = true;
            if (!reset.home) resetDisplay('home');
            header.removeClass('down');
            
            //get reference and hide the nav and section_home items
            resetTimer = (function(){
                animateSection('home');
            }).delay(300);
            
            //Reset about
            if (!reset.about) resetDisplay('about');
        }
        if (id != 'section_home'){
            $clear(resetTimer);
            if (!reset.home) resetDisplay('home');
        }
        
        if (id == 'section_about'){
            autoScrollToSection = true;
            //if (!reset.about) resetDisplay('about');
            
            resetTimer = (function(){
                animateSection('about');
            }).delay(400);
        }
        if (id != 'section_home' && id != 'section_about' ){
            autoScrollToSection = false;
        }
        
    });
    
    //===================== Object Level Events ==================
    //Sections coming into View
    //Use this to make the home and about page auto scroll
    $('.section').on('viewin', function(e){
        var id = $(this).attr('id'),
            $el = $(this);
            
        log('VIEWIN triggered ' + $(this).attr('id'));
        //log($(this).data('misoTracker'))
        
        //Header animation to dark BG
        // autoScrollToSection - turns true only when the home and about pages are visited
        if (id == 'section_about' && $el.data('misoTracker').direction == 'down' && autoScrollToSection) {
            //animate to this slide
            header.removeClass('transparent');
            goToByScroll('about');
        }
        
        //If scrolling up to home
        if (id == 'section_home' && $el.data('misoTracker').direction == 'up' && autoScrollToSection) {
            //animate to this slide
            //log('GOTO slide 1')
            goToByScroll('home');
            header.removeClass('down');
            
        }
    });
    
    $('.section').on('reachedtop', function(e){
        var id = $(this).attr('id'),
            $el = $(this);
        //log('REACHTOP triggered ' + id);
        
        var dataslide = $(this).attr('id').replace('section_', '');
        var misoTracker = $(this).data('misoTracker');
        
        //If the user scrolls up change the navigation link that has the same data-slide attribute as the slide to active and 
        //remove the active class from the previous navigation link 
        links.removeClass('active');
        $('.navigation li[data-slide=' + dataslide + ']').addClass('active');
        
        //Header animation to dark BG
        if (id != 'section_home') {
            header.removeClass('transparent');
            header.addClass('down');
        }
        
    });
    
    
    /* Slideshows */
    $('#slides_botc').slidesjs({
        width: 1280,
        height: 726,
        navigation: false
      });
    $('#slides_bft').slidesjs({
        width: 1280,
        height: 730,
        navigation: false
    });
    
    //Before After
    var $ba = $('.before_after'),
        $slider = $ba.find('.slider'),
        $after = $ba.find('.slides.after'),
        $before = $ba.find('.slides.before'),
        moveSlider = false;
        
    $(window).trigger('resize');
    
    $ba.on('mousedown', function(e){
        e.preventDefault();
        e.stopPropagation();
        var $el = $(e.target);
        if ($el.hasClass('slider')) moveSlider = true;
    });
    $('body').on('mouseup', function(e){
        moveSlider = false;
    });
    $ba.on('mousemove', function(e){
        if (moveSlider){
            e.preventDefault();
            e.stopPropagation();
    
            var $el = $(this).find('.slider'),
                $slide = $(this).find('.slides.after');
            
            //var pos = $slider.position();
            var left = e.pageX;
            var parent_left = $ba.offset().left;
            left = left - parent_left;
        
            log(left);
            $el.css('left', left - $el.width()/2);
            $slide.css('left', left );
            
        }
    });
    
    if (typeof TouchEvent != undefined){
        $ba.on("touchstart", function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var touches = e.originalEvent.touches;
            if(touches.length == 1){ // Only deal with one finger
                var touch = touches[0]; // Get the information for finger #1
                var $el = $(touch.target); // Find the node the drag started from
                
                //if ($el.hasClass('slider')) 
                moveSlider = true;
            }
        });
        $ba.on("touchmove", function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            //var pos = $slider.position();
            var touches = e.originalEvent.touches;
            
            if(touches.length == 1){ // Only deal with one finger
                var touch = touches[0]; // Get the information for finger #1
            
                var left = touch.pageX;
                var parent_left = $ba.offset().left;
                left = left - parent_left;
                
        
                if (moveSlider && left-$slider.width()/2 > 0 && left < $ba.width() - $slider.width()/2){
                    
                    var $el = $(this).find('.slider'),
                        $slide = $(this).find('.slides.after');
            
                    $el.css('left', left - $el.width()/2);
                    $slide.css('left', left );
            
                }
            }
        });
        $('body').on("touchend", function(e) {
            moveSlider = false;
        });
    }

});
