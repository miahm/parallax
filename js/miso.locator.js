/**
 * jQuery Miso Locator - v1.0.0
 * Copyright (c) 2014 ProjectMiso, LLC
 * Dual licensed under the MIT license and GPL license.
 *
 * Events fired by the objects - 
 * Event    fullview        When all edges of the object comes within the viewport
 * Event    fullviewout     When all an object goes from fullview to out of view or partial view
 * Event    viewin          When any part of an object comes within the viewport
 * Event    viewout         When all parts of an object goes out of the viewport
 * Event    reachedtop      When an object scrolls up to the top of the viewport
 * Event    reachedbottom   When an object scrolls down to the bottom of the viewport
 * Event    reachedleft     When an object scrolls left to the left edge of the viewport
 * Event    reachedright    When an object scrolls right to the right of the viewport
 *
 * Data (data('views')) sent to the objects as window scrolls - 
 * direction                Scroll direction
 * window.scrollTop
 * window.scrollLeft
 * window.scrollBottom      Bottom edge of window + the scroll position
 * window.scrollRight       Right edge of window + the scroll position
 * window.width             Viewport width
 * window.height            Viewport height
 * view.top
 * view.left
 * view.width
 * view.height
 * view.fullView
 * view.partialView
 * view.topOffset       //from the top of the view port and scroll position
 * view.bottomOffset    //from the bottom of the view port and scroll position
 * view.leftOffset      //from the left of the view port and scroll position
 * view.rightOffset     //from the right of the view port and scroll position
**/

(function($){
    /*
     * Options may include - 
     *      options.boundTo         Optional    CSS Context for an element to broadcast relative positions
     */
    $.fn.inViewport = function(options){
		var $this = $(this).inViewport;
		
		var win = {};
        win.scrollTop = $(window).scrollTop();
        win.scrollLeft = $(window).scrollLeft();
        win.height = $(window).height();
        win.width = $(window).width();
        win.scrollBottom = win.scrollTop + win.height;
        win.scrollRight = win.scrollLeft + win.width;
		
        //========== INIT ===========
		if (typeof options == 'object' || typeof options == 'undefined' ) {
		
            //Default options
            $this.config = {
                context: window,
            }
            $.extend($this.config, options);
        
            //Store the element in question
            $this.els = this;
        
            //======= Process the elements and window settings
            if (!window.inViewport) window.inViewport = {};
            
            //Loop through each element and assign unique identity
            if (!window.inViewport.counter) window.inViewport.counter = 0;
            $this.els.each(function(i, item){
                var el = $(item);
                
                var view = el.offset();
                /* Available views are - 
                 * view.top
                 * view.left
                 * view.width
                 * view.height
                 * view.fullView
                 * view.partialView
                 * view.topOffset       //from the top of the view port and scroll position
                 * view.bottomOffset    //from the bottom of the view port and scroll position
                 * view.leftOffset      //from the left of the view port and scroll position
                 * view.rightOffset     //from the right of the view port and scroll position
                 */
                view.left = el.offset().left;
                view.width = el.outerWidth();
                view.height = el.outerHeight();
                view.fullView = false;
                view.partialView = false;
                view.topOffset = win.scrollTop - view.top;
                view.leftOffset = win.scrollLeft - view.left;
                view.bottomOffset = win.scrollBottom - view.top;
                view.rightOffset = win.scrollRight - view.left;
                
                //Set a unique ID
                el.data('inViewport-ID', window.inViewport.counter);
                window.inViewport.counter++; //ID counter
                
                el.data('views', {
                    'window': win,
                    'direction': undefined,
                    'view': view
                });
            });
            
            //Assign the elements to the window for global reference
            if (!window.inViewport.els) {
                window.inViewport.els = $this.els;
            } else {
                window.inViewport.els.add($this.els);
            }
            
            
            //Store window scroll position, this will help with detecting direction
            if (!window.inViewport.scrollPositions) window.inViewport.scrollPositions = {
                'scrollTop': win.scrollTop, 
                'scrollLeft': win.scrollLeft
            };
            
            //create custom events
            $this.els.on('viewin', $empty);
            $this.els.on('viewout', $empty);
            $this.els.on('fullview', $empty);
            $this.els.on('fullviewout', $empty);
            
            $this.els.on('reachedtop', $empty);
            $this.els.on('reachedbottom', $empty);
            $this.els.on('reachedleft', $empty);
            $this.els.on('reachedright', $empty);
            
            //log($this.config);
            //log($this.els);
        
		//========== Method redirections ==========
        } else if (typeof options == 'string') {
		    if (options == 'destroy'){ //destroy inViewport for one or more elements 
		        $this.destroy(this);
		    }
		    if (options == 'update'){ //update position data
		        $this.update();
		    }
		} 
		
        return $this;
    };
    $.fn.inViewport.destroy = function(el){
		var $this = this;
		
		//log('Destroy ... ');
        log($this.els);
        
        //Remove the element from storage
        window.inViewport.els.each(function(i, item){
            if (el.data('inViewport-ID') == $(item).data('inViewport-ID')) window.inViewport.els.splice(i, 1); 
        });
        $this.els.each(function(i, item){
            if (el.data('inViewport-ID') == $(item).data('inViewport-ID')) $this.els.splice(i, 1); 
        });
        
        //Remove data
        el.removeData('inViewport-ID');
        el = null;
        
        log($this.els);
        
        return $this;
        
    };
    $.fn.inViewport.update = function(){
		var $this = this;
		
        //Detect direction
        var direction = null, win = {};
        
        win.scrollTop = $(window).scrollTop();
        win.scrollLeft = $(window).scrollLeft();
        win.height = $(window).height();
        win.width = $(window).width();
        win.scrollBottom = win.scrollTop + win.height;
        win.scrollRight = win.scrollLeft + win.width;
        
        //compare stored position (past) with new position (present)
        if (window.inViewport.scrollPositions.scrollTop > win.scrollTop){ 
            direction = 'up';
        } else if (window.inViewport.scrollPositions.scrollTop < win.scrollTop){
            direction = 'down';
        }
        //log('Stored ' + window.inViewport.scrollPositions.scrollTop);
        //log('Current ' + win.scrollTop);
        
        if (!direction){
            if (window.inViewport.scrollPositions.scrollLeft > win.scrollLeft){
                direction = 'left';
            } else if (window.inViewport.scrollPositions.scrollLeft < win.scrollLeft){
                direction = 'right';
            }
        }
        
        //Set new positions
        window.inViewport.scrollPositions = {
            'scrollTop': win.scrollTop, 
            'scrollLeft': win.scrollLeft
        };
        
        //Store info into the elements
        $this.els.each(function(i, item){
            var el = $(item);
            
            //Detect Position in relations to the Viewport 
            var view = el.offset();
            /* Available views are - 
             * view.top
             * view.left
             * view.width
             * view.height
             * view.fullView
             * view.partialView
             * view.topOffset       //from the top of the view port and scroll position
             * view.bottomOffset    //from the bottom of the view port and scroll position
             * view.leftOffset      //from the left of the view port and scroll position
             * view.rightOffset     //from the right of the view port and scroll position
             */
            view.left = el.offset().left;
            view.width = el.outerWidth();
            view.height = el.outerHeight();
            view.fullView = false;
            view.partialView = false;
            view.topOffset = win.scrollTop - view.top;
            view.leftOffset = win.scrollLeft - view.left;
            view.bottomOffset = win.scrollBottom - view.top;
            view.rightOffset = win.scrollRight - view.left;
            
            //Detect full view
            if (
                view.top >= win.scrollTop && (view.top + view.height) <= (win.scrollBottom) &&
                view.left >= win.scrollLeft && (view.left + view.width) <= (win.scrollRight) 
            ) {
                view.fullView = true;
            }
            //Detect partial view based on top-left corner being in view
            if (
                (view.top >= win.scrollTop && view.top < win.scrollBottom && 
                    view.left >= win.scrollLeft && view.left < win.scrollRight) || //top-left corner is in view
                (view.top >= win.scrollTop && view.top < win.scrollBottom && 
                    view.left + view.width >= win.scrollLeft && view.left + view.width < win.scrollRight) || //top-right corner is in view
                (view.top + view.height >= win.scrollTop && view.top + view.height < win.scrollBottom && 
                    view.left + view.width >= win.scrollLeft && view.left + view.width < win.scrollRight) || //bottom-right corner is view
                (view.top + view.height >= win.scrollTop && view.top + view.height < win.scrollBottom && 
                    view.left >= win.scrollLeft && view.left < win.scrollRight) //bottom-left corner is view
            ){
                if (!view.fullView) view.partialView = true;
            }
            
            //Check whether the events should be fired
            var fireFullview = false, fireFullviewout = false, fireViewin = false, fireViewout = false,
                fireReachedtop = false, fireReachedbottom = false, fireReachedleft = false, fireReachedright = false;
            
            if (!el.data('views').view.fullView && view.fullView) fireFullview = true;
            if (el.data('views').view.fullView && !view.fullView) fireFullviewout = true;
            if (!el.data('views').view.fullView && !el.data('views').view.partialView && (view.fullView || view.partialView))  fireViewin = true;
            if ((el.data('views').view.fullView || el.data('views').view.partialView) && (!view.fullView && !view.partialView))  fireViewout = true;
            
            //Detect reaching of edges
            //TODO - right now it assumes edges being in view then reaching the viewport edge.
            //      It could be done so it triggers when the edges meet regardless of the item being on view or not
            if (el.data('views').view.top >= win.scrollTop && view.top <= win.scrollTop) fireReachedtop = true;
            if (el.data('views').view.top + view.height <= win.scrollTop + win.height  && view.top + view.height >= win.scrollTop + win.height) fireReachedbottom = true;
            if (el.data('views').view.left >= win.scrollLeft && view.left <= win.scrollLeft) fireReachedleft = true;
            if (el.data('views').view.left + view.width <= win.scrollLeft + win.width  && view.left + view.width >= win.scrollLeft + win.width) fireReachedright = true;
            
            //Store the values
            el.data('views', {
                'window': win,
                'direction': direction,
                'view': view
            });
            
            //Fire trigger
            if (fireFullview) el.trigger('fullview');
            if (fireFullviewout) el.trigger('fullviewout');
            if (fireViewin) el.trigger('viewin');
            if (fireViewout) el.trigger('viewout');
            
            if (fireReachedtop) el.trigger('reachedtop');
            if (fireReachedbottom) el.trigger('reachedbottom');
            if (fireReachedleft) el.trigger('reachedleft');
            if (fireReachedright) el.trigger('reachedright');
            
            el = null;
        });
        
    };
    
    $(window).on('scroll', function(e){
        window.inViewport.els.inViewport('update');
    });
    $(window).on('load', function(e){
        window.inViewport.els.inViewport('update');
    });
})(jQuery);
