/*!
 * ProjectMiso Utilities Module
 * http://www.projectmiso.net/
 * Version 5.0
 *
 * Copyright 2012, ProjectMiso, LLC
 * Licensed under the MIT  licenses.
 * 
 * MIT License
 * -----------------
 *	Copyright (c) 2012 ProjectMiso, LLC 
 *	http://www.projectmiso.net/
 *	
 *	Permission is hereby granted, free of charge, to a website with a copy
 *	of this software, by provided by ProjectMiso, and associated documentation 
 *	files (the "Software"), to deal in the Software without limitation
 *	the rights to use and modify and copy the Software within the website,
 *	or to include copies of the Software in sale of the website, and to
 *	permit persons to whom the Software is furnished to do so, subject to
 *	the following conditions:
 *	
 *	The above copyright notice and this permission notice shall be
 *	included in all copies or substantial portions of the Software.
 *	
 *	The Software shall not be used in websites other than the one authorized  
 *  for by ProjectMiso and that it shall not be directly sold or redistributed 
 *	without the Software being part of the authroized website.
 *
 *	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 *	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 *	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 *	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 *	LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 *	OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 *	WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Requires jQuery
 * http://jquery.com/
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Date: Wed March 20 2009 EDT
 */


//============== EVENT Calls cross over from MooTools =========
var Event = function(event){
	this.event = event;
};
Event.prototype.stop = function(){
	this.event.preventDefault();
}
Event.prototype.stopPropagation = function(){
	this.event.stopPropagation();
}

/* clears time outs */
function $clear(int){
	clearTimeout(int);
	clearInterval(int);
};

/*
Function: $chk
	Returns true if the passed in value/object exists or is 0, otherwise returns false.
	Useful to accept zeroes.

Arguments:
	obj - object to inspect
*/

function $chk(obj){
	return !!(obj || obj === 0);
};

/*
Function: $pick
	Returns the first object if defined, otherwise returns the second.

Arguments:
	obj - object to test
	picked - the default to return

Example:
	(start code)
		function say(msg){
			alert($pick(msg, 'no meessage supplied'));
		}
	(end)
*/

function $pick(obj, picked){
	return $defined(obj) ? obj : picked;
};

function $defined(obj){
	return (obj != undefined);
};

//An empty function to attach
$empty = function(){};
	
/*
Returns:
	'element' - if obj is a DOM element node
	'jquery_element' - if obj is a JQuery DOM element collection - with 1 DOM object
	'jquery_elements' - if obj is a JQuery DOM element collection - an array of DOM objects
	'jquery_object' - if obj is a JQuery DOM element collection with no elements
	'textnode' - if obj is a DOM text node
	'whitespace' - if obj is a DOM whitespace node
	'arguments' - if obj is an arguments object
	'object' - if obj is an object
	'string' - if obj is a string
	'number' - if obj is a number
	'boolean' - if obj is a boolean
	'function' - if obj is a function
	'array' - if obj is a function
	'regexp' - if obj is a regular expression
	'class' - if obj is a Class. (created with new Class, or the extend of another class).
	'collection' - if obj is a native htmlelements collection, such as childNodes, getElementsByTagName .. etc.
	false - (boolean) if the object is not defined or none of the above.
*/
$type = function (obj){
	if (!$defined(obj)) return false;
	
	if (obj.htmlElement) return 'element';
	var type = typeof obj;
	
	//check JQuery object
	if (type == 'object'){
		if ($defined(obj.length) && $defined(obj.context)  && $defined(obj.selector)){
			if (obj.length == 0){
				return 'jquery_object';
			} else if (obj.length > 0){
				return (obj.length == 1) ? 'jquery_element' : 'jquery_elements';
			} 
		}
	}
	
	if (type == 'object' && obj.nodeName){
		switch(obj.nodeType){
			case 1: return 'element';
			case 3: return (/\S/).test(obj.nodeValue) ? 'textnode' : 'whitespace';
		}
	}
	if (type == 'object' || type == 'function'){
		switch(obj.constructor){
			case Array: return 'array';
			case RegExp: return 'regexp';
			//case Class: return 'class';
		}
		if (typeof obj.length == 'number'){
			if (obj.item) return 'collection';
			if (obj.callee) return 'arguments';
		}
	}
	return type;
};

var ExtendNative = function(){
	for (var i = 0, l = arguments.length; i < l; i++){
		arguments[i].extend = function(props){
			for (var prop in props){
				if (!this.prototype[prop]) this.prototype[prop] = props[prop];
				if (!this[prop]) this[prop] = ExtendNative.generic(prop);
			}
		};
	}
};

ExtendNative.generic = function(prop){
	return function(bind){
		return this.prototype[prop].apply(bind, Array.prototype.slice.call(arguments, 1));
	};
};

ExtendNative(Function, Array, String, Number);

var $extend = function(){
	var args = arguments;
	if (!args[1]) args = [this, args[0]];
	for (var property in args[1]) args[0][property] = args[1][property];
	return args[0];
};
Object.extend = $extend;

String.extend({
	str_replace: function(searchString,replaceString) {
		return this.split(searchString).join(replaceString);
	},
    alert: function(){
        alert(this);
    },
    lower: function(){
    	return this.toLowerCase();
    },
    upper: function(){
    	return this.toUpperCase();
    },
	toArray: function(){ //"[1,2,3]".toArray();
		if (this.indexOf('[') == 0 && this.indexOf(']') == this.length-1){
			var arr = this.replace('[', '').replace(']', '').replace('\,', '\comma');
			arr = arr.split(',');
			
			for (var i=0;i<arr.length;i++){
				arr[i] = arr[i].trim().replace('\comma', ',');
				
			}
			return arr;
		}
		return false;
	},
    toUSNumber: function(float, debug){
		if (debug) alert(this + " " + curr)
        var num = this;
		num = num.toString().replace(/\$|\,/g,'');
		if(isNaN(num)) num = "0";
		sign = (num == (num = Math.abs(num)));
		num = Math.floor(num*100+0.50000000001);
		cents = num%100;
		num = Math.floor(num/100).toString();
		if(cents<10) cents = "0" + cents;
		
		for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++){
			num = num.substring(0,num.length-(4*i+3))+','+  num.substring(num.length-(4*i+3));
		}
		
		return (((sign)?'':'-') + num + ( (float) ? ('.' + cents) : ''));
		
    },
    toCurrency: function(curr, debug){
		if (debug) alert(this + " " + curr)
		if (curr == undefined) curr = "USD";
        var num = this;
		num = num.toString().replace(/\$|\,/g,'');
		if(isNaN(num))
		num = "0";
		sign = (num == (num = Math.abs(num)));
		num = Math.floor(num*100+0.50000000001);
		cents = num%100;
		num = Math.floor(num/100).toString();
		if(cents<10)
		cents = "0" + cents;
		if (curr == "USD"){
			for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++){
				num = num.substring(0,num.length-(4*i+3))+','+  num.substring(num.length-(4*i+3));
			}
			return (((sign)?'':'-') + '$' + num + '.' + cents);
		} else if (curr == "RUB"){
			for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++){
				num = num.substring(0,num.length-(4*i+3))+','+  num.substring(num.length-(4*i+3));
			}
			return (((sign)?'':'-') + '' + num + '.' + cents + " руб");
		} 
    },
	currencyToInt: function(){
		var num = this;
		num = num.trim().replace("$", "").str_replace(",", "").toInt();
		return num;
	},
	currencyToFloat: function(){
		var num = this;
		num = num.trim().replace("$", "").str_replace(",", "").toFloat();
		return num;
	},
	getFormattedNumericString: function(){
		
		var num = this.str_replace(',',''), pieces = [], val = this;
		
		//log ("Int/Float Version: " + num)
		
		if (this.contains('.')) {
			num = num.split('.')[0]; 
		}
		var floor_3 = Math.ceil(num.length/3);
		
		//log("floor_3: " + floor_3)
		
		if (floor_3 && num.length > 3){
			var last_i = num.length;
			var start_at = last_i - 3;
			var end_at = last_i - start_at;
			
			for (var i=0;i<floor_3;i++){
				//log("start at: " + start_at + ", end_at: " + end_at + ", last_i: " + last_i)
				if (last_i > 0){
					//log(num.substr(start_at, end_at))
					pieces[pieces.length] = num.substr(start_at, end_at);
				}
				last_i = last_i - 3 ;
				start_at = last_i - 3;
				if (start_at < 0) start_at = 0;
				end_at = last_i - start_at;
			}
			
			if (!pieces.length){
				pieces = num;
			} else {
				pieces = pieces.reverse().toString();
			}
			if (this.contains('.')) {
				//log('Contains decimal');
				pieces = pieces + "." +  this.split('.')[1];
			}
			//log(pieces);
			return  pieces;
		}
		return  this;
	},
	test: function(regex, params){
		return ((typeof regex == 'string') ? new RegExp(regex, params) : regex).test(this);
	},

	contains: function(string, separator){
		return (separator) ? (separator + this + separator).indexOf(separator + string + separator) > -1 : this.indexOf(string) > -1;
	},
	startsWith: function(str){
		return this.indexOf(str) == 0;
	},
	endsWith: function(str){
		return this.slice(-str.length) == str;
	},
	trim: function(){
		return this.replace(/^\s+|\s+$/g, '');
	},

	clean: function(){
		return this.replace(/\s+/g, ' ').trim();
	},

	camelCase: function(){
		return this.replace(/-\D/g, function(match){
			return match.charAt(1).toUpperCase();
		});
	},

	hyphenate: function(){
		return this.replace(/[A-Z]/g, function(match){
			return ('-' + match.charAt(0).toLowerCase());
		});
	},

	capitalize: function(){
		return this.replace(/\b[a-z]/g, function(match){
			return match.toUpperCase();
		});
	},

	escapeRegExp: function(){
		return this.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
	},

	toInt: function(base){
		return parseInt(this, base || 10);
	},

	toFloat: function(){
		return parseFloat(this);
	},

	hexToRgb: function(array){
		var hex = this.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);
		return (hex) ? hex.slice(1).hexToRgb(array) : null;
	},

	rgbToHex: function(array){
		var rgb = this.match(/\d{1,3}/g);
		return (rgb) ? rgb.rgbToHex(array) : null;
	},

	stripScripts: function(option){
		var scripts = '';
		var text = this.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function(){
			scripts += arguments[1] + '\n';
			return '';
		});
		if (option === true) $exec(scripts);
		else if ($type(option) == 'function') option(scripts, text);
		return text;
	},

	substitute: function(object, regexp){
		return this.replace(regexp || (/\\?\{([^{}]+)\}/g), function(match, name){
			if (match.charAt(0) == '\\') return match.slice(1);
			return (object[name] != undefined) ? object[name] : '';
		});
	}
});

/* Check of native support */
if (!Array.prototype.indexOf) {
	Array.extend({
		indexOf:function(obj, start){
			for (var i = (start || 0), j = this.length; i < j; i++) {
				 if (this[i] === obj) { return i; }
			 }
			 return -1;
		}
	});
}

Array.extend({
	contains:function(instance){
		if (this.indexOf(instance) > -1){
			return true;
		}
		return false;
	},
	crossCheck: function(array){
		if (this == array)  return true;
		
		if ($type(array) == 'string' || $type(array) == 'number' || $type(array) == 'element' || $type(array) == 'jquery_element' || $type(array) == 'object'
			 || $type(array) == 'function' || $type(array) == 'regexp') {
			return this.contains(array);
		} else if ($type(array) == 'array'){
		
			for (var i=0;i<array.length;i++){
				if (this.contains(array[i])) {
					
					return true;
					break;
				}
			}
			
		}
	},
	add: function(){
		if (arguments.length) {
			for (var i=0;i<arguments.length;i++){
				this.push(arguments[i]);
			}
		}
		return this;
	},
	remove: function(index, instance){
		if (index){
			this.splice(index, 1);
			return this;
		} 
		if (instance) {
			//log(instance + " " + this.contains(instance))
			if (this.contains(instance)){
				this.splice(this.indexOf(instance), 1);
				return this;
			}
		}
		return this;
	},
	//randomize function
	shuffle: function(){
		return this.sort(function() {return 0.5 - Math.random()})
	},
	random: function(){
		var i = Math.min(this.length.random(), this.length-1);
		return this[i];
	}
});

function chr (codePt) {
	// Converts a codepoint number to a character  
	// 
	// version: 1004.2314
	// discuss at: http://phpjs.org/functions/chr    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +   improved by: Brett Zamir (http://brett-zamir.me)
	// *     example 1: chr(75);
	// *     returns 1: 'K'
	// *     example 1: chr(65536) === '\uD800\uDC00';    // *     returns 1: true
	
	if (codePt > 0xFFFF) { // Create a four-byte string (length 2) since this code point is high
											 //   enough for the UTF-16 encoding (JavaScript internal use), to
											 //   require representation with two surrogates (reserved non-characters                                             //   used for building other characters; the first is "high" and the next "low")
		codePt -= 0x10000;
		return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
	}
	else {        return String.fromCharCode(codePt);
	}
}
Number.extend({
	toCurrency: function(curr){
        return String(this).toCurrency(curr);
    },
	currencyToInt: function(){
        return String(this).currencyToInt();
	},
	currencyToFloat: function(){
        return String(this).currencyToFloat();
	},
	limit: function(min, max){
		return Math.min(max, Math.max(min, this));
	},

	round: function(precision){
		precision = Math.pow(10, precision || 0);
		return Math.round(this * precision) / precision;
	},

	times: function(fn, bind){
		for (var i = 0; i < this; i++) fn.call(bind, i, this);
	},

	toFloat: function(){
		return parseFloat(this);
	},
	isFloat: function(){
		return (String(this).contains('.'));
	},
	toInt: function(base){
		return parseInt(this, base || 10);
	},
	random: function(start){
		if (Math.random() > .5){
			return Math.floor( (start) ? Math.random()*(this-start) + start : Math.random()*this) ;
		} else {
			return Math.ceil( (start) ? Math.random()*(this-start) + start : Math.random()*this) ;
		}
	}

});

Function.extend({

	/*
	Property: create
		Main function to create closures.

	Returns:
		a function.

	Arguments:
		options - An Options object.

	Options:
		bind - The object that the "this" of the function will refer to. Default is the current function.
		event - If set to true, the function will act as an event listener and receive an event as first argument.
				If set to a class name, the function will receive a new instance of this class (with the event passed as argument's constructor) as first argument.
				Default is false.
		arguments - A single argument or array of arguments that will be passed to the function when called.
		
					If both the event and arguments options are set, the event is passed as first argument and the arguments array will follow.
					
					Default is no custom arguments, the function will receive the standard arguments when called.
					
		delay - Numeric value: if set, the returned function will delay the actual execution by this amount of milliseconds and return a timer handle when called.
				Default is no delay.
		periodical - Numeric value: if set, the returned function will periodically perform the actual execution with this specified interval and return a timer handle when called.
				Default is no periodical execution.
		attempt - If set to true, the returned function will try to execute and return either the results or false on error. Default is false.
	*/

	create: function(options){
		var fn = this;
		options = $.extend({
			'bind': fn,
			'event': false,
			'arguments': null,
			'delay': false,
			'periodical': false,
			'attempt': false
		}, options);
		if ($chk(options.arguments) && $type(options.arguments) != 'array') options.arguments = [options.arguments];
		return function(event){
			var args;
			if (options.event){
				event = event || window.event;
				args = [(options.event === true) ? event : new options.event(event)];
				if (options.arguments) args.extend(options.arguments);
			}
			else args = options.arguments || arguments;
			var returns = function(){
				return fn.apply($pick(options.bind, fn), args);
			};
			if (options.delay) return setTimeout(returns, options.delay);
			if (options.periodical) return setInterval(returns, options.periodical);
			if (options.attempt) try {return returns();} catch(err){return false;};
			return returns();
		};
	},

	/*
	Property: bind
		method to easily create closures with "this" altered.

	Arguments:
		bind - optional, the object that the "this" of the function will refer to.
		args - optional, the arguments passed. must be an array if arguments > 1

	Returns:
		a function.

	Example:
		>function myFunction(){
		>	this.setStyle('color', 'red');
		>	// note that 'this' here refers to myFunction, not an element
		>	// we'll need to bind this function to the element we want to alter
		>};
		>var myBoundFunction = myFunction.bind(myElement);
		>myBoundFunction(); // this will make the element myElement red.
	*/

	bind: function(bind, args){
		return this.create({'bind': bind, 'arguments': args});
	},

	/*
	Property: attempt
		Tries to execute the function, returns either the result of the function or false on error.

	Arguments:
		args - the arguments passed. must be an array if arguments > 1
		bind - optional, the object that the "this" of the function will refer to.

	Example:
		>myFunction.attempt([arg1, arg2], myElement);
	*/

	attempt: function(args, bind){
		return this.create({'arguments': args, 'bind': bind, 'attempt': true})();
	},

	/*
	Property: delay
		Delays the execution of a function by a specified duration.

	Arguments:
		delay - the duration to wait in milliseconds.
		bind - optional, the object that the "this" of the function will refer to.
		args - optional, the arguments passed. must be an array if arguments > 1

	Example:
		>myFunction.delay(50, myElement) //wait 50 milliseconds, then call myFunction and bind myElement to it
		>(function(){alert('one second later...')}).delay(1000); //wait a second and alert
	*/

	delay: function(delay, bind, args){
		return this.create({'delay': delay, 'bind': bind, 'arguments': args})();
	},

	/*
	Property: periodical
		Executes a function in the specified intervals of time

	Arguments:
		interval - the duration of the intervals between executions.
		bind - optional, the object that the "this" of the function will refer to.
		args - optional, the arguments passed. must be an array if arguments > 1
	*/

	periodical: function(interval, bind, args){
		return this.create({'periodical': interval, 'bind': bind, 'arguments': args})();
	}

});






//========= Logging =======
log = function(str){
	if (window.console){
		if (window.console.log) window.console.log(str);
	}
};



//========= Modify DOM Element =======
(function($){
    $.fn.extend({ 
		
		getSelectionStart: function() {
			return (function(el) {
				var els = this.get(0);
				//log(els + " " + els.selectionStart)
				if (els.createTextRange) {
					var r = document.selection.createRange().duplicate()
					r.moveEnd('character', els.value.length)
					if (r.text == '') return els.value.length
					return els.value.lastIndexOf(r.text)
				} else return els.selectionStart
			}).bind(this).call();		
		},
		/* move cursor to */
		setCursorPosition: function(pos) {
			if ($(this).get(0).setSelectionRange) {
			  $(this).get(0).setSelectionRange(pos, pos);
			} else if ($(this).get(0).createTextRange) {
			  var range = $(this).get(0).createTextRange();
			  range.collapse(true);
			  range.moveEnd('character', pos);
			  range.moveStart('character', pos);
			  range.select();
			}
		},
		send: function(options){
			if (!options) options = {};
			
			//options.fnBeforeSend - before AJAX is sent
			//options.fnBefore	- before success/error is checked
			//options.fnSuccess - success funciton
			//options.fnFailure	- failure function
			//options.fnAfter	- after checking success/error
			
			if (!this.is('form')){ //if form
			
			} else {
				//set the AJAX send parameters
				var frm = this.get(0);
				
				if (options.fnBeforeSend) options.fnBeforeSend();
				
				var action = frm.action,
					method = frm.method;
				var sendForm = $.ajax({
					url: action,
					dataType: 'json',
					type: method,
					data: $(this).serialize() + '&json=1',
					success: function(data){
						var success = data.success;
						var msg = data.msg;
						
						if (options.fnBefore) options.fnBefore();
						
						if (success){
							if (options.fnSuccess) options.fnSuccess(data);
						} else {
							if (options.fnFailure) options.fnFailure(data);
						}
						
						if (options.fnAfter) options.fnAfter();
					}
				});
			}
			return this;
		}
		
    });
})(jQuery);

/*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 * 
 * Requires: 1.2.2+
 */

(function($) {

var types = ['DOMMouseScroll', 'mousewheel'];

if ($.event.fixHooks) {
    for ( var i=types.length; i; ) {
        $.event.fixHooks[ types[--i] ] = $.event.mouseHooks;
    }
}

$.event.special.mousewheel = {
    setup: function() {
        if ( this.addEventListener ) {
            for ( var i=types.length; i; ) {
                this.addEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = handler;
        }
    },
    
    teardown: function() {
        if ( this.removeEventListener ) {
            for ( var i=types.length; i; ) {
                this.removeEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = null;
        }
    }
};

$.fn.extend({
    mousewheel: function(fn) {
        return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
    },
    
    unmousewheel: function(fn) {
        return this.unbind("mousewheel", fn);
    }
});


function handler(event) {
    var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
    event = $.event.fix(orgEvent);
    event.type = "mousewheel";
    
    // Old school scrollwheel delta
    if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta/120; }
    if ( orgEvent.detail     ) { delta = -orgEvent.detail/3; }
    
    // New school multidimensional scroll (touchpads) deltas
    deltaY = delta;
    
    // Gecko
    if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
        deltaY = 0;
        deltaX = -1*delta;
    }
    
    // Webkit
    if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY/120; }
    if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = -1*orgEvent.wheelDeltaX/120; }
    
    // Add event and delta to the front of the arguments
    args.unshift(event, delta, deltaX, deltaY);
    
    return ($.event.dispatch || $.event.handle).apply(this, args);
}

})(jQuery);



