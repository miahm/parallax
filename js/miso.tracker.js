/**
 * jQuery Miso Tracker - v1.0.0
 * Copyright (c) 2014 ProjectMiso, LLC
 * Dual licensed under the MIT license and GPL license.
 *
 * @Description: misoTracker will track HTML objects and their positions in context of a scrollable container.
 * The container can be a scrollable box or the window, as the container context. The module 
 * will broadcast the locations of each object and their offsets in relevance to the context 
 * container. 
 *
 * Also the module can track sections of the page and broadcast which section is closest to the top and 
 * in better view so navigation can be worked out using the data. An event will be fired with the closest
 * section. The event is attached to the context element - default is the 'window'.
 *
 * @Initiate:
 * ---------------------------------------------------------------------------
 * $('selector').misoTracker(options);      //'selector' will be used to track the set of objects
 * 
 * All 'options' are optional.
 * 'options' include - 
 * options.context          Optional    CSS selector for the container (with scroll bars) context - default is the window
 * options.boundTo          Optional    CSS Context for an element to broadcast relative positions
 * options.sectionScrollDirection       Optional    The direction the sections scroll 'vertical'  or 'horizontal'. Default is 'vertical'
 * 
 * @Public Methods
 * ---------------------------------------------------------------------------
 * $.misoTracker('destroy');    Removes the locator tracking for the selected elements
 * $.misoTracker('update');     Updates the locator data
 *
 * @HTML Data Properties
 * ---------------------------------------------------------------------------
 * data-misotracker-section     Set to any value. As long as this property exists, the module will
 *                              track the items as page sections
 *
 * @Events
 * ---------------------------------------------------------------------------
 * Element events - 
 * EL.Event     fullview        When all edges of the object comes within the viewport
 * EL.Event     fullviewout     When all an object goes from fullview to out of view or partial view
 * EL.Event     viewin          When any part of an object comes within the viewport
 * EL.Event     viewout         When all parts of an object goes out of the viewport
 * EL.Event     reachedtop      When an object scrolls up to the top of the viewport
 * EL.Event     reachedbottom   When an object scrolls down to the bottom of the viewport
 * EL.Event     reachedleft     When an object scrolls left to the left edge of the viewport
 * EL.Event     reachedright    When an object scrolls right to the right of the viewport
 *
 * Window events - 
 * window.Event sectionchange   When a section comes into proper view - i.e. nav can be changed
 *
 * @Broadcasted Data
 * ---------------------------------------------------------------------------
 * direction                    Scroll direction
 * container.scrollTop          Scrollable container 
 * container.scrollLeft
 * container.scrollBottom      Bottom edge of container + the scroll position
 * container.scrollRight       Right edge of container + the scroll position
 * container.width             Viewport width
 * container.height            Viewport height
 *
 * pos.top
 * pos.left
 * pos.width
 * pos.height
 * pos.fullView
 * pos.partialView
 * pos.outOfView
 * pos.topOffset       //from the top of the view port 
 * pos.bottomOffset    //from the bottom of the view port to the bottom of the object
 * pos.leftOffset      //from the left of the view port
 * pos.rightOffset     //from the right of the view port to the right of the object
 *
 * @Window Objects
 * ---------------------------------------------------------------------------
 * window.misoTracker.direction   //Direction of scrolling
 * window.misoTracker.$els        //All elements being tracked
 * window.misoTracker.$visible    //All visible elements
 * window.misoTracker.$section      Currently closest section
 *
**/

(function($){
    /*
     * Options may include - 
     *      options.context         Optional    CSS selector for the container (with scroll bars) context - default is the window
     *      options.boundTo         Optional    CSS Context for an element to broadcast relative positions
     */
    $.fn.misoTracker = function(options){
		var $this = $(this).misoTracker;
		
        //========== INIT ===========
		if (typeof options == 'object' || typeof options == 'undefined' ) {
		
            //Default options
            $this.config = {
                'initiated': 1,
                'context': window,
                'sectionScrollDirection': 'vertical'
            }
            //Add the custom options
            $.extend($this.config, options);
            
            //Store the element in question
            $this.$els = this;
        
            //Create a storage for global values not part of the config
            $this.globals = {};
            $this.globals.$container = $($this.config.context);
            $this.globals.$sections = $('nonexistant');                 //blank storage for sections
            
            //Stop this if elements are not present
            if (!$this.$els.length || !$this.globals.$container) return;
            
            //log($this.$els);
            
		    //Get container's view/position references
            var win = {};
            win.scrollTop = $this.globals.$container.scrollTop();
            win.scrollLeft = $this.globals.$container.scrollLeft();
            win.height = $this.globals.$container.height();
            win.width = $this.globals.$container.width();
            win.scrollBottom = win.scrollTop + win.height;
            win.scrollRight = win.scrollLeft + win.width;
        
            //======= Process the elements and window settings
            //Create a Global variable for storage
            if (!window.misoTracker) window.misoTracker = {};
            
            //Initiate  blank storage for the visible elements
            if (!window.misoTracker.$visible) window.misoTracker.$visible = $('nonexistant');
            if (!window.misoTracker.$section) window.misoTracker.$section = $('nonexistant');
            
            //Loop through each element and assign unique identity
            if (!window.misoTracker.counter) window.misoTracker.counter = 0;
            
            var sections = [];
            $this.$els.each(function(i, item){
                var $el = $(item);
                
                /* Available misoTracker position data  - 
                 * pos.top
                 * pos.left
                 * pos.width
                 * pos.height
                 * pos.fullView
                 * pos.partialView
                 * pos.topOffset       //from the top of the view port and scroll position
                 * pos.bottomOffset    //from the bottom of the view port and scroll position
                 * pos.leftOffset      //from the left of the view port and scroll position
                 * pos.rightOffset     //from the right of the view port and scroll position
                 */
                var pos = $el.offset();
                pos.left = $el.offset().left;
                pos.width = $el.outerWidth();
                pos.height = $el.outerHeight();
                pos.fullView = false;
                pos.partialView = false;
                pos.topOffset = win.scrollTop - pos.top;
                pos.leftOffset = win.scrollLeft - pos.left;
                pos.bottomOffset = win.scrollBottom - pos.top;
                pos.rightOffset = win.scrollRight - pos.left;
                
                //Set a unique ID
                $el.attr('data-misotracker-id', window.misoTracker.counter);
                window.misoTracker.counter++; //ID counter
                
                $el.data('misoTracker', {
                    'container': win,
                    'direction': undefined,
                    'pos': pos
                });
                
                //find the sections
                if ($el.data('misotracker-section')) sections[sections.length] = $el;
                
                $el = null;
            });
            
            //Store the sections
            $this.globals.$sections = $($.map(sections, function(el){return $.makeArray(el)}));
            //log($this.globals.$sections);
            
            //Assign the elements to the window for global reference
            if (!window.misoTracker.$els) {
                window.misoTracker.$els = $this.$els;
            } else {
                window.misoTracker.$els.add($this.$els);
            }
            
            
            //Store window scroll position, this will help with detecting direction
            if (!$this.globals.scrollPositions) $this.globals.scrollPositions = {
                'scrollTop': win.scrollTop, 
                'scrollLeft': win.scrollLeft
            };
            
            //create custom events
            $this.$els.on('viewin', $empty);
            $this.$els.on('viewout', $empty);
            $this.$els.on('fullview', $empty);
            $this.$els.on('fullviewout', $empty);
            
            $this.$els.on('reachedtop', $empty);
            $this.$els.on('reachedbottom', $empty);
            $this.$els.on('reachedleft', $empty);
            $this.$els.on('reachedright', $empty);
            
            //log($this.config);
            //log($this.$els);
            
            //Attach the scroll event to the viewport/container
            var scrollUpdate = function(e){
                window.misoTracker.$els.misoTracker('update');
            };
            
            //Figure out if the event is already attached
            var attachEvent = true, 
                events = $._data($this.globals.$container[0], "events" );
            if (events != undefined && events.scroll != undefined){
                for (i=0;i<events.scroll.length; i++){
                    if (events.scroll[i].handler == scrollUpdate) attachEvent = false; //already attached
                }
            }
            if (attachEvent) $this.globals.$container.on('scroll', function(e){
                $clear(misTrackerTimer);
                misTrackerTimer = scrollUpdate.delay(20, this, e);
            });
            
        
		//========== Method redirections ==========
        } else if (typeof options == 'string') {
		    if (options == 'destroy'){ //destroy misoTracker for one or more elements 
		        if ($this.config) $this.destroy(this);
		    }
		    if (options == 'update'){ //update position data
		        if ($this.config) $this.update();
		    }
		} 
		
        return $this;
    };
    $.fn.misoTracker.update = function(){
		var $this = this;
        if (!$this.$els.length || !$this.globals.$container) return;
		
        //=========== Context or Window position data ==========
        var direction = null, win = {};
        
        win.scrollTop = $this.globals.$container.scrollTop();
        win.scrollLeft = $this.globals.$container.scrollLeft();
        win.height = $this.globals.$container.height();
        win.width = $this.globals.$container.width();
        win.scrollBottom = win.scrollTop + win.height;
        win.scrollRight = win.scrollLeft + win.width;
        
        //compare stored position (past) with new position (present)
        if ($this.globals.scrollPositions.scrollTop > win.scrollTop){ 
            direction = 'up';
        } else if ($this.globals.scrollPositions.scrollTop < win.scrollTop){
            direction = 'down';
        }
        //log('Stored ' + $this.globals.scrollPositions.scrollTop);
        //log('Current ' + win.scrollTop);
        
        if (!direction){
            if ($this.globals.scrollPositions.scrollLeft > win.scrollLeft){
                direction = 'left';
            } else if ($this.globals.scrollPositions.scrollLeft < win.scrollLeft){
                direction = 'right';
            }
        }
        
        //Set new positions
        $this.globals.scrollPositions = {
            'scrollTop': win.scrollTop, 
            'scrollLeft': win.scrollLeft
        };
        
        if ($this.config.context == window){
            window.misoTracker.direction = direction;
        } else {
            $this.globals.$container.data('direction') = direction;
        }
        
        //================ Detect and Update Positions and Sections ================
        //Temp Storage for visible and invisible items for the viewport/container
         var visibleNow = [], invisibleNow = [];
         var sections = {'id': [], 'score': []}; //Temp tracker for the sections 
         
        //LOOP through and Store info into the elements
        $this.$els.each(function(i, item){
            var $el = $(item);
            
            //================= Detect Position of Elements in relations to the Viewport 
            //Element pos data 
            /* Available misoTracker position are - 
             * pos.top
             * pos.left
             * pos.width
             * pos.height
             * pos.fullView
             * pos.partialView
             * pos.outOfView
             * pos.topOffset       //from the top of the view port 
             * pos.bottomOffset    //from the bottom of the view port to the bottom of the object
             * pos.leftOffset      //from the left of the view port 
             * pos.rightOffset     //from the right of the view port to the right of the object
             */
            var pos = $el.offset();
            pos.left = $el.offset().left;
            pos.width = $el.outerWidth();
            pos.height = $el.outerHeight();
            pos.fullView = false;
            pos.partialView = false;
            pos.outOfView = false;
            pos.topOffset =  pos.top - win.scrollTop;
            pos.leftOffset = pos.left - win.scrollLeft;
            pos.bottomOffset = pos.top + pos.height - win.scrollBottom;
            pos.rightOffset = pos.left + pos.width - win.scrollRight;
            
            //log($el)
            //log(pos)
            //log(pos.topOffset + " = " + pos.top + " - " + win.scrollTop);
            //log(pos.bottomOffset + " = " + pos.top + " + " + pos.height + " - " + win.scrollBottom);
            
            //---------- Detect 'in view' flags so events can be fired based on views
            
            //Flag Variables for the view events
            var fireFullview = false, fireFullviewout = false, fireViewin = false, fireViewout = false;
            
            //------- Detect full view
            if (pos.topOffset >= 0 && pos.bottomOffset <= 0 && pos.leftOffset >= 0 && pos.rightOffset <= 0) pos.fullView = true;
            
            //log(pos.topOffset + ' >= 0 && ' + pos.top + ' < ' + win.scrollBottom + '  && ' +  pos.leftOffset + ' >= 0 && ' + pos.left + ' < ' + win.scrollRight);
            
            //------ Detect partial view 
            //log('Section: ' + $el.attr('id'))
            //top-left corner is in view
            if (pos.topOffset >= 0 && pos.top < win.scrollBottom && pos.leftOffset >= 0 && pos.left < win.scrollRight) {
                if (!pos.fullView) pos.partialView = true;
                //log('Partial View - top-left corner is in view');
            }
            //top-right corner is in view
            if (pos.top >= win.scrollTop && pos.top < win.scrollBottom && pos.left + pos.width >= win.scrollLeft && pos.left + pos.width < win.scrollRight) {
                if (!pos.fullView && !pos.partialView) pos.partialView = true;
                //log('Partial View - top-right corner is in view');
            }
            //bottom-right corner is view
            if (pos.top + pos.height >= win.scrollTop && pos.top + pos.height < win.scrollBottom &&  pos.left + pos.width >= win.scrollLeft && pos.left + pos.width < win.scrollRight) {
                if (!pos.fullView && !pos.partialView) pos.partialView = true;
                //log('Partial View - bottom-right corner is in view');
            }
            //bottom-left corner is view
            if (pos.top + pos.height >= win.scrollTop && pos.top + pos.height < win.scrollBottom && pos.left >= win.scrollLeft && pos.left < win.scrollRight) {
                if (!pos.fullView && !pos.partialView) pos.partialView = true;
                //log('Partial View - bottom-left corner is in view');
            }   
            //middle is in  view
            if ((pos.topOffset < 0 && pos.bottomOffset > 0) || (pos.leftOffset < 0 && pos.rightOffset > 0)) {
                if (!pos.fullView && !pos.partialView) pos.partialView = true;
                //log('Partial View - middle corner is in view');
            }
            
            //Detect outOfView
            if (!pos.fullView && !pos.partialView) pos.outOfView = true;
            
            if (!$el.data('misoTracker').pos.fullView && pos.fullView) fireFullview = true;
            if ($el.data('misoTracker').pos.fullView && !pos.fullView) fireFullviewout = true;
            if (!$el.data('misoTracker').pos.fullView && !$el.data('misoTracker').pos.partialView && (pos.fullView || pos.partialView))  fireViewin = true;
            if (($el.data('misoTracker').pos.fullView || $el.data('misoTracker').pos.partialView) && (!pos.fullView && !pos.partialView))  fireViewout = true;
            
            
            //------------ Detect reaching of edges
            //Flag Variables for the view events
            var fireReachedtop = false, fireReachedbottom = false, fireReachedleft = false, fireReachedright = false;
            
            //Reached top
            if (pos.topOffset <= 0 && pos.height + pos.topOffset > 0 && pos.height + pos.topOffset <= pos.height){
                if ($el.data('reachedtop') == undefined || $el.data('reachedtop') == false) {
                    fireReachedtop = true;
                    //log('Fire logic reached for reachedtop ' + $el.attr('id'));
                    $el.data('reachedtop', true);
                }
            } else if (pos.topOffset > 0 || (pos.topOffset <= 0 && pos.height + pos.topOffset <= 0)){
                if ($el.data('reachedtop') == undefined || $el.data('reachedtop') == true) {
                    $el.data('reachedtop', false);
                    //log('UnFire logic reached for reachedtop');
                }
            }
            //Reached Bottom
            if (pos.bottomOffset >= 0 && pos.bottomOffset - pos.height < 0 && pos.bottomOffset - pos.height >= -pos.height){
                if ($el.data('reachedbottom') == undefined || $el.data('reachedbottom') == false) {
                    fireReachedbottom = true;
                    //log('Fire logic reached for reachedbottom. ' + $el.attr('id'));
                    $el.data('reachedbottom', true);
                }
            } else if (pos.bottomOffset < 0 || (pos.bottomOffset >= 0 &&  pos.bottomOffset - pos.height >= 0)){
                if ($el.data('reachedbottom') == undefined || $el.data('reachedbottom') == true) {
                    $el.data('reachedbottom', false);
                    //log('UnFire logic reached for reachedbottom');
                }
            }
            
            //Reached Left
            if (pos.leftOffset <= 0 && pos.width + pos.leftOffset > 0 && pos.width + pos.leftOffset <= pos.width){
                if ($el.data('reachedleft') == undefined || $el.data('reachedleft') == false) {
                    fireReachedleft = true;
                    //log('Fire logic reached for reachedleft ' + $el.attr('id'));
                    $el.data('reachedleft', true);
                }
            } else if (pos.topOffset > 0 || (pos.topOffset <= 0 && pos.height + pos.topOffset <= 0)){
                if ($el.data('reachedleft') == undefined || $el.data('reachedleft') == true) {
                    $el.data('reachedleft', false);
                    //log('UnFire logic reached for reachedtop');
                }
            }
            //Reached Right
            if (pos.rightOffset >= 0 && pos.rightOffset - pos.width < 0 && pos.rightOffset - pos.width >= -pos.width){
                if ($el.data('reachedright') == undefined || $el.data('reachedright') == false) {
                    fireReachedright = true;
                    //log('Fire logic reached for reachedright. ' + $el.attr('id'));
                    $el.data('reachedright', true);
                }
            } else if (pos.rightOffset < 0 || (pos.rightOffset >= 0 &&  pos.rightOffset - pos.width >= 0)){
                if ($el.data('reachedright') == undefined || $el.data('reachedright') == true) {
                    $el.data('reachedright', false);
                    //log('UnFire logic reached for reachedbottom');
                }
            }
            
            
            //Broadcast the values of views and positions
            $el.data('misoTracker', {
                'container': win,
                'direction': direction,
                'pos': pos
            });
            
            
            //Fire event triggers
            if (fireFullview) $el.trigger('fullview');
            if (fireFullviewout) $el.trigger('fullviewout');
            if (fireViewin) $el.trigger('viewin');
            if (fireViewout) $el.trigger('viewout');
            
            if (fireReachedtop) $el.trigger('reachedtop');
            if (fireReachedbottom) $el.trigger('reachedbottom');
            if (fireReachedleft) $el.trigger('reachedleft');
            if (fireReachedright) $el.trigger('reachedright');
            
            //Set data for the window level data broadcast
            if (fireViewin)  visibleNow[visibleNow.length] = $el;
            if (fireViewout)  invisibleNow[invisibleNow.length] = $el;
            
            //log($el);
            //log(pos)
            
            if ($el.data('misotracker-section') && (pos.fullView || pos.partialView)){
                sections['id'][sections['id'].length] = $el.data('misotracker-id');
                if ($this.config.sectionScrollDirection == 'vertical'){
                    
                    //get visible area
                    var area = pos.height, areaScore = 0;
                    if (pos.topOffset <= 0) area = area + pos.topOffset;
                    if (pos.bottomOffset >= 0) area = area - pos.bottomOffset;
                    areaScore = (area/win.height)*100;
                    
                    //get a distance score no more than 100, give preference to the closest objects
                    var distance = pos.topOffset == 0 ? 0.1 : Math.abs(pos.topOffset);
                    if (pos.topOffset > 0 && pos.topOffset < win.height/8) {
                        distance = distance / (1 + (100/distance));
                    } else if (pos.topOffset > 0 && pos.topOffset > win.height/8) {
                        distance = distance * (1 + (distance/20));
                    }
                    //log($el.attr('id') + ' topOffset = ' + pos.topOffset + ', distanceQuotient = ' + distance);
                    
                    var distanceScore = (100-(Math.abs(distance)/win.height)*100);
                    var score = areaScore + distanceScore;
                        
                    sections['score'][sections['score'].length] = score;
                    
                    //log($el.attr('id') + ' topOffset = ' + pos.topOffset + ', distanceScore = ' + distanceScore + ', area = ' + area + ', areaScore = ' + areaScore + ', score = ' + score);
                    
                }
            }
            
            $el = null;
        });
        //================ Broadcast visible and invisible items to the window
        
        //Add visible and invisible items to a jQuery object
        var $v = $($.map(visibleNow, function(el){return $.makeArray(el)}));
        var $iv = $($.map(invisibleNow, function(el){return $.makeArray(el)}));
        //log($iv);
        
        //Add them back to the window object
        var varr = [$v, window.misoTracker.$visible];
        window.misoTracker.$visible = $($.map(varr, function(el){return $.makeArray(el)}));
        
        //Now take out the invisible items
        $iv.each(function(j, rem){
            window.misoTracker.$visible.each(function(i, item){
                if ($(rem).data('misotracker-id') == $(item).data('misotracker-id')) {
                    window.misoTracker.$visible.splice(i, 1); 
                    //log('Remove from visible ...');
                }
            });
        });
        
        
        //=================== Track sections and broadcast to the window
        //log('Section ID');
        //log(sections.id)
        if (sections.id.length){
            var topScore = 0, id = null, theSection = $('nonexistant');
            
            for (i=0;i<sections.id.length;i++){
               if (sections['score'][i] > topScore) {
                    topScore = sections['score'][i];
                    id = sections['id'][i]
               }
               
               //topScore = sections['score'][i] > topScore ? sections['score'][i] : topScore;
            }
            //log('Top score: ' + topScore + ' ID: ' +  id);
            //log(theSection);
            
            theSection = $('[data-misotracker-id=' + id + ']');
            
            if (window.misoTracker.$section.data('misotracker-id') != theSection.data('misotracker-id')){
                window.misoTracker.$section = theSection;
                $(window).trigger('sectionchange');
                //log('Window EVENT sectionchange fired');
            }
        }
        
        //log('===============');
        
        
    };
    $.fn.misoTracker.destroy = function($el){
		var $this = this;
        if (!$this.$els.length || !$this.globals.$container) return;
		
		//log('Destroy ... ');
        //log($this.$els);
        
        //Remove the element from storage
        window.misoTracker.$els.each(function(i, item){
            if ($el.data('misotracker-id') == $(item).data('misotracker-id')) window.misoTracker.$els.splice(i, 1); 
        });
        $this.$els.each(function(i, item){
            if ($el.data('misotracker-id') == $(item).data('misotracker-id')) $this.$els.splice(i, 1); 
        });
        
        //Remove data
        $el.removeData('misotracker-id');
        $el.removeattr('data-misotracker-id');
        $el = null;
        
        //log($this.$els);
        
        return $this;
        
    };
    var misTrackerTimer = 0;
    
    $(window).on('resize', function(e){
        window.misoTracker.$els.misoTracker('update');
    });
    $(window).on('load', function(e){
        window.misoTracker.$els.misoTracker('update');
    });
})(jQuery);
