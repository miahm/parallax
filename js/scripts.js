


jQuery(document).ready(function ($) {
    
    $('.slide').inViewport();
    
    $('.slide').on('viewin', function(e){
        log('IMG viewin triggered');
        log(this);
    });
    $('.slide').on('fullview', function(e){
        log('IMG fullview triggered');
        log(this);
        log($(this).data('views'))
    });
    $('.slide').on('viewout', function(e){
        log('IMG viewout triggered');
        log(this);
    });
    $('.slide').on('fullviewout', function(e){
        log('IMG fullviewout triggered');
        log(this);
    });

    $('.slide').on('reachedtop', function(e){
        log('IMG reachedtop triggered');
        log(this);
        
        var dataslide = $(this).attr('data-slide');
        var views = $(this).data('views');
        
        //If the user scrolls up change the navigation link that has the same data-slide attribute as the slide to active and 
        //remove the active class from the previous navigation link 
        if (views.direction === 'down') {
            $('.navigation li[data-slide="' + dataslide + '"]').addClass('active').prev().removeClass('active');
        }
        // else If the user scrolls down change the navigation link that has the same data-slide attribute as the slide to active and 
        //remove the active class from the next navigation link 
        else {
            $('.navigation li[data-slide="' + dataslide + '"]').addClass('active').next().removeClass('active');
        }
    });

});
