/*! jQuery UI - v1.10.4 - 2014-03-26
* http://jqueryui.com
* Includes: jquery.ui.core.js, jquery.ui.widget.js, jquery.ui.mouse.js, jquery.ui.position.js, jquery.ui.draggable.js, jquery.ui.resizable.js, jquery.ui.autocomplete.js, jquery.ui.button.js, jquery.ui.datepicker.js, jquery.ui.dialog.js, jquery.ui.menu.js
* Copyright 2014 jQuery Foundation and other contributors; Licensed MIT */

(function( $, undefined ) {

var uuid = 0,
	runiqueId = /^ui-id-\d+$/;

// $.ui might exist from components with no dependencies, e.g., $.ui.position
$.ui = $.ui || {};

$.extend( $.ui, {
	version: "1.10.4",

	keyCode: {
		BACKSPACE: 8,
		COMMA: 188,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		LEFT: 37,
		NUMPAD_ADD: 107,
		NUMPAD_DECIMAL: 110,
		NUMPAD_DIVIDE: 111,
		NUMPAD_ENTER: 108,
		NUMPAD_MULTIPLY: 106,
		NUMPAD_SUBTRACT: 109,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SPACE: 32,
		TAB: 9,
		UP: 38
	}
});

// plugins
$.fn.extend({
	focus: (function( orig ) {
		return function( delay, fn ) {
			return typeof delay === "number" ?
				this.each(function() {
					var elem = this;
					setTimeout(function() {
						$( elem ).focus();
						if ( fn ) {
							fn.call( elem );
						}
					}, delay );
				}) :
				orig.apply( this, arguments );
		};
	})( $.fn.focus ),

	scrollParent: function() {
		var scrollParent;
		if (($.ui.ie && (/(static|relative)/).test(this.css("position"))) || (/absolute/).test(this.css("position"))) {
			scrollParent = this.parents().filter(function() {
				return (/(relative|absolute|fixed)/).test($.css(this,"position")) && (/(auto|scroll)/).test($.css(this,"overflow")+$.css(this,"overflow-y")+$.css(this,"overflow-x"));
			}).eq(0);
		} else {
			scrollParent = this.parents().filter(function() {
				return (/(auto|scroll)/).test($.css(this,"overflow")+$.css(this,"overflow-y")+$.css(this,"overflow-x"));
			}).eq(0);
		}

		return (/fixed/).test(this.css("position")) || !scrollParent.length ? $(document) : scrollParent;
	},

	zIndex: function( zIndex ) {
		if ( zIndex !== undefined ) {
			return this.css( "zIndex", zIndex );
		}

		if ( this.length ) {
			var elem = $( this[ 0 ] ), position, value;
			while ( elem.length && elem[ 0 ] !== document ) {
				// Ignore z-index if position is set to a value where z-index is ignored by the browser
				// This makes behavior of this function consistent across browsers
				// WebKit always returns auto if the element is positioned
				position = elem.css( "position" );
				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
					// IE returns 0 when zIndex is not specified
					// other browsers return a string
					// we ignore the case of nested elements with an explicit value of 0
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					value = parseInt( elem.css( "zIndex" ), 10 );
					if ( !isNaN( value ) && value !== 0 ) {
						return value;
					}
				}
				elem = elem.parent();
			}
		}

		return 0;
	},

	uniqueId: function() {
		return this.each(function() {
			if ( !this.id ) {
				this.id = "ui-id-" + (++uuid);
			}
		});
	},

	removeUniqueId: function() {
		return this.each(function() {
			if ( runiqueId.test( this.id ) ) {
				$( this ).removeAttr( "id" );
			}
		});
	}
});

// selectors
function focusable( element, isTabIndexNotNaN ) {
	var map, mapName, img,
		nodeName = element.nodeName.toLowerCase();
	if ( "area" === nodeName ) {
		map = element.parentNode;
		mapName = map.name;
		if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
			return false;
		}
		img = $( "img[usemap=#" + mapName + "]" )[0];
		return !!img && visible( img );
	}
	return ( /input|select|textarea|button|object/.test( nodeName ) ?
		!element.disabled :
		"a" === nodeName ?
			element.href || isTabIndexNotNaN :
			isTabIndexNotNaN) &&
		// the element and all of its ancestors must be visible
		visible( element );
}

function visible( element ) {
	return $.expr.filters.visible( element ) &&
		!$( element ).parents().addBack().filter(function() {
			return $.css( this, "visibility" ) === "hidden";
		}).length;
}

$.extend( $.expr[ ":" ], {
	data: $.expr.createPseudo ?
		$.expr.createPseudo(function( dataName ) {
			return function( elem ) {
				return !!$.data( elem, dataName );
			};
		}) :
		// support: jQuery <1.8
		function( elem, i, match ) {
			return !!$.data( elem, match[ 3 ] );
		},

	focusable: function( element ) {
		return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
	},

	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" ),
			isTabIndexNaN = isNaN( tabIndex );
		return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
	}
});

// support: jQuery <1.8
if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
	$.each( [ "Width", "Height" ], function( i, name ) {
		var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
			type = name.toLowerCase(),
			orig = {
				innerWidth: $.fn.innerWidth,
				innerHeight: $.fn.innerHeight,
				outerWidth: $.fn.outerWidth,
				outerHeight: $.fn.outerHeight
			};

		function reduce( elem, size, border, margin ) {
			$.each( side, function() {
				size -= parseFloat( $.css( elem, "padding" + this ) ) || 0;
				if ( border ) {
					size -= parseFloat( $.css( elem, "border" + this + "Width" ) ) || 0;
				}
				if ( margin ) {
					size -= parseFloat( $.css( elem, "margin" + this ) ) || 0;
				}
			});
			return size;
		}

		$.fn[ "inner" + name ] = function( size ) {
			if ( size === undefined ) {
				return orig[ "inner" + name ].call( this );
			}

			return this.each(function() {
				$( this ).css( type, reduce( this, size ) + "px" );
			});
		};

		$.fn[ "outer" + name] = function( size, margin ) {
			if ( typeof size !== "number" ) {
				return orig[ "outer" + name ].call( this, size );
			}

			return this.each(function() {
				$( this).css( type, reduce( this, size, true, margin ) + "px" );
			});
		};
	});
}

// support: jQuery <1.8
if ( !$.fn.addBack ) {
	$.fn.addBack = function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	};
}

// support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
if ( $( "<a>" ).data( "a-b", "a" ).removeData( "a-b" ).data( "a-b" ) ) {
	$.fn.removeData = (function( removeData ) {
		return function( key ) {
			if ( arguments.length ) {
				return removeData.call( this, $.camelCase( key ) );
			} else {
				return removeData.call( this );
			}
		};
	})( $.fn.removeData );
}





// deprecated
$.ui.ie = !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() );

$.support.selectstart = "onselectstart" in document.createElement( "div" );
$.fn.extend({
	disableSelection: function() {
		return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
			".ui-disableSelection", function( event ) {
				event.preventDefault();
			});
	},

	enableSelection: function() {
		return this.unbind( ".ui-disableSelection" );
	}
});

$.extend( $.ui, {
	// $.ui.plugin is deprecated. Use $.widget() extensions instead.
	plugin: {
		add: function( module, option, set ) {
			var i,
				proto = $.ui[ module ].prototype;
			for ( i in set ) {
				proto.plugins[ i ] = proto.plugins[ i ] || [];
				proto.plugins[ i ].push( [ option, set[ i ] ] );
			}
		},
		call: function( instance, name, args ) {
			var i,
				set = instance.plugins[ name ];
			if ( !set || !instance.element[ 0 ].parentNode || instance.element[ 0 ].parentNode.nodeType === 11 ) {
				return;
			}

			for ( i = 0; i < set.length; i++ ) {
				if ( instance.options[ set[ i ][ 0 ] ] ) {
					set[ i ][ 1 ].apply( instance.element, args );
				}
			}
		}
	},

	// only used by resizable
	hasScroll: function( el, a ) {

		//If overflow is hidden, the element might have extra content, but the user wants to hide it
		if ( $( el ).css( "overflow" ) === "hidden") {
			return false;
		}

		var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
			has = false;

		if ( el[ scroll ] > 0 ) {
			return true;
		}

		// TODO: determine which cases actually cause this to happen
		// if the element doesn't have the scroll set, see if it's possible to
		// set the scroll
		el[ scroll ] = 1;
		has = ( el[ scroll ] > 0 );
		el[ scroll ] = 0;
		return has;
	}
});

})( jQuery );
(function( $, undefined ) {

var uuid = 0,
	slice = Array.prototype.slice,
	_cleanData = $.cleanData;
$.cleanData = function( elems ) {
	for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
		try {
			$( elem ).triggerHandler( "remove" );
		// http://bugs.jquery.com/ticket/8235
		} catch( e ) {}
	}
	_cleanData( elems );
};

$.widget = function( name, base, prototype ) {
	var fullName, existingConstructor, constructor, basePrototype,
		// proxiedPrototype allows the provided prototype to remain unmodified
		// so that it can be used as a mixin for multiple widgets (#8876)
		proxiedPrototype = {},
		namespace = name.split( "." )[ 0 ];

	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
		return !!$.data( elem, fullName );
	};

	$[ namespace ] = $[ namespace ] || {};
	existingConstructor = $[ namespace ][ name ];
	constructor = $[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without "new" keyword
		if ( !this._createWidget ) {
			return new constructor( options, element );
		}

		// allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};
	// extend with the existing constructor to carry over any static properties
	$.extend( constructor, existingConstructor, {
		version: prototype.version,
		// copy the object used to create the prototype in case we need to
		// redefine the widget later
		_proto: $.extend( {}, prototype ),
		// track widgets that inherit from this widget in case this widget is
		// redefined after a widget inherits from it
		_childConstructors: []
	});

	basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.widget.extend( {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( !$.isFunction( value ) ) {
			proxiedPrototype[ prop ] = value;
			return;
		}
		proxiedPrototype[ prop ] = (function() {
			var _super = function() {
					return base.prototype[ prop ].apply( this, arguments );
				},
				_superApply = function( args ) {
					return base.prototype[ prop ].apply( this, args );
				};
			return function() {
				var __super = this._super,
					__superApply = this._superApply,
					returnValue;

				this._super = _super;
				this._superApply = _superApply;

				returnValue = value.apply( this, arguments );

				this._super = __super;
				this._superApply = __superApply;

				return returnValue;
			};
		})();
	});
	constructor.prototype = $.widget.extend( basePrototype, {
		// TODO: remove support for widgetEventPrefix
		// always use the name + a colon as the prefix, e.g., draggable:start
		// don't prefix for widgets that aren't DOM-based
		widgetEventPrefix: existingConstructor ? (basePrototype.widgetEventPrefix || name) : name
	}, proxiedPrototype, {
		constructor: constructor,
		namespace: namespace,
		widgetName: name,
		widgetFullName: fullName
	});

	// If this widget is being redefined then we need to find all widgets that
	// are inheriting from it and redefine all of them so that they inherit from
	// the new version of this widget. We're essentially trying to replace one
	// level in the prototype chain.
	if ( existingConstructor ) {
		$.each( existingConstructor._childConstructors, function( i, child ) {
			var childPrototype = child.prototype;

			// redefine the child widget using the same prototype that was
			// originally used, but inherit from the new version of the base
			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
		});
		// remove the list of existing child constructors from the old constructor
		// so the old child constructors can be garbage collected
		delete existingConstructor._childConstructors;
	} else {
		base._childConstructors.push( constructor );
	}

	$.widget.bridge( name, constructor );
};

$.widget.extend = function( target ) {
	var input = slice.call( arguments, 1 ),
		inputIndex = 0,
		inputLength = input.length,
		key,
		value;
	for ( ; inputIndex < inputLength; inputIndex++ ) {
		for ( key in input[ inputIndex ] ) {
			value = input[ inputIndex ][ key ];
			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
				// Clone objects
				if ( $.isPlainObject( value ) ) {
					target[ key ] = $.isPlainObject( target[ key ] ) ?
						$.widget.extend( {}, target[ key ], value ) :
						// Don't extend strings, arrays, etc. with objects
						$.widget.extend( {}, value );
				// Copy everything else by reference
				} else {
					target[ key ] = value;
				}
			}
		}
	}
	return target;
};

$.widget.bridge = function( name, object ) {
	var fullName = object.prototype.widgetFullName || name;
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.widget.extend.apply( null, [ options ].concat(args) ) :
			options;

		if ( isMethodCall ) {
			this.each(function() {
				var methodValue,
					instance = $.data( this, fullName );
				if ( !instance ) {
					return $.error( "cannot call methods on " + name + " prior to initialization; " +
						"attempted to call method '" + options + "'" );
				}
				if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
					return $.error( "no such method '" + options + "' for " + name + " widget instance" );
				}
				methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue && methodValue.jquery ?
						returnValue.pushStack( methodValue.get() ) :
						methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, fullName );
				if ( instance ) {
					instance.option( options || {} )._init();
				} else {
					$.data( this, fullName, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( /* options, element */ ) {};
$.Widget._childConstructors = [];

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	defaultElement: "<div>",
	options: {
		disabled: false,

		// callbacks
		create: null
	},
	_createWidget: function( options, element ) {
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.uuid = uuid++;
		this.eventNamespace = "." + this.widgetName + this.uuid;
		this.options = $.widget.extend( {},
			this.options,
			this._getCreateOptions(),
			options );

		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();

		if ( element !== this ) {
			$.data( element, this.widgetFullName, this );
			this._on( true, this.element, {
				remove: function( event ) {
					if ( event.target === element ) {
						this.destroy();
					}
				}
			});
			this.document = $( element.style ?
				// element within the document
				element.ownerDocument :
				// element is window or document
				element.document || element );
			this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
		}

		this._create();
		this._trigger( "create", null, this._getCreateEventData() );
		this._init();
	},
	_getCreateOptions: $.noop,
	_getCreateEventData: $.noop,
	_create: $.noop,
	_init: $.noop,

	destroy: function() {
		this._destroy();
		// we can probably remove the unbind calls in 2.0
		// all event bindings should go through this._on()
		this.element
			.unbind( this.eventNamespace )
			// 1.9 BC for #7810
			// TODO remove dual storage
			.removeData( this.widgetName )
			.removeData( this.widgetFullName )
			// support: jquery <1.6.3
			// http://bugs.jquery.com/ticket/9413
			.removeData( $.camelCase( this.widgetFullName ) );
		this.widget()
			.unbind( this.eventNamespace )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetFullName + "-disabled " +
				"ui-state-disabled" );

		// clean up events and states
		this.bindings.unbind( this.eventNamespace );
		this.hoverable.removeClass( "ui-state-hover" );
		this.focusable.removeClass( "ui-state-focus" );
	},
	_destroy: $.noop,

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key,
			parts,
			curOption,
			i;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.widget.extend( {}, this.options );
		}

		if ( typeof key === "string" ) {
			// handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
			options = {};
			parts = key.split( "." );
			key = parts.shift();
			if ( parts.length ) {
				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
				for ( i = 0; i < parts.length - 1; i++ ) {
					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
					curOption = curOption[ parts[ i ] ];
				}
				key = parts.pop();
				if ( arguments.length === 1 ) {
					return curOption[ key ] === undefined ? null : curOption[ key ];
				}
				curOption[ key ] = value;
			} else {
				if ( arguments.length === 1 ) {
					return this.options[ key ] === undefined ? null : this.options[ key ];
				}
				options[ key ] = value;
			}
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var key;

		for ( key in options ) {
			this._setOption( key, options[ key ] );
		}

		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				.toggleClass( this.widgetFullName + "-disabled ui-state-disabled", !!value )
				.attr( "aria-disabled", value );
			this.hoverable.removeClass( "ui-state-hover" );
			this.focusable.removeClass( "ui-state-focus" );
		}

		return this;
	},

	enable: function() {
		return this._setOption( "disabled", false );
	},
	disable: function() {
		return this._setOption( "disabled", true );
	},

	_on: function( suppressDisabledCheck, element, handlers ) {
		var delegateElement,
			instance = this;

		// no suppressDisabledCheck flag, shuffle arguments
		if ( typeof suppressDisabledCheck !== "boolean" ) {
			handlers = element;
			element = suppressDisabledCheck;
			suppressDisabledCheck = false;
		}

		// no element argument, shuffle and use this.element
		if ( !handlers ) {
			handlers = element;
			element = this.element;
			delegateElement = this.widget();
		} else {
			// accept selectors, DOM elements
			element = delegateElement = $( element );
			this.bindings = this.bindings.add( element );
		}

		$.each( handlers, function( event, handler ) {
			function handlerProxy() {
				// allow widgets to customize the disabled handling
				// - disabled as an array instead of boolean
				// - disabled class as method for disabling individual parts
				if ( !suppressDisabledCheck &&
						( instance.options.disabled === true ||
							$( this ).hasClass( "ui-state-disabled" ) ) ) {
					return;
				}
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}

			// copy the guid so direct unbinding works
			if ( typeof handler !== "string" ) {
				handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
			}

			var match = event.match( /^(\w+)\s*(.*)$/ ),
				eventName = match[1] + instance.eventNamespace,
				selector = match[2];
			if ( selector ) {
				delegateElement.delegate( selector, eventName, handlerProxy );
			} else {
				element.bind( eventName, handlerProxy );
			}
		});
	},

	_off: function( element, eventName ) {
		eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) + this.eventNamespace;
		element.unbind( eventName ).undelegate( eventName );
	},

	_delay: function( handler, delay ) {
		function handlerProxy() {
			return ( typeof handler === "string" ? instance[ handler ] : handler )
				.apply( instance, arguments );
		}
		var instance = this;
		return setTimeout( handlerProxy, delay || 0 );
	},

	_hoverable: function( element ) {
		this.hoverable = this.hoverable.add( element );
		this._on( element, {
			mouseenter: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-hover" );
			},
			mouseleave: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-hover" );
			}
		});
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._on( element, {
			focusin: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-focus" );
			},
			focusout: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-focus" );
			}
		});
	},

	_trigger: function( type, event, data ) {
		var prop, orig,
			callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		// the original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );
		return !( $.isFunction( callback ) &&
			callback.apply( this.element[0], [ event ].concat( data ) ) === false ||
			event.isDefaultPrevented() );
	}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
		if ( typeof options === "string" ) {
			options = { effect: options };
		}
		var hasOptions,
			effectName = !options ?
				method :
				options === true || typeof options === "number" ?
					defaultEffect :
					options.effect || defaultEffect;
		options = options || {};
		if ( typeof options === "number" ) {
			options = { duration: options };
		}
		hasOptions = !$.isEmptyObject( options );
		options.complete = callback;
		if ( options.delay ) {
			element.delay( options.delay );
		}
		if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
			element[ method ]( options );
		} else if ( effectName !== method && element[ effectName ] ) {
			element[ effectName ]( options.duration, options.easing, callback );
		} else {
			element.queue(function( next ) {
				$( this )[ method ]();
				if ( callback ) {
					callback.call( element[ 0 ] );
				}
				next();
			});
		}
	};
});

})( jQuery );
(function( $, undefined ) {

var mouseHandled = false;
$( document ).mouseup( function() {
	mouseHandled = false;
});

$.widget("ui.mouse", {
	version: "1.10.4",
	options: {
		cancel: "input,textarea,button,select,option",
		distance: 1,
		delay: 0
	},
	_mouseInit: function() {
		var that = this;

		this.element
			.bind("mousedown."+this.widgetName, function(event) {
				return that._mouseDown(event);
			})
			.bind("click."+this.widgetName, function(event) {
				if (true === $.data(event.target, that.widgetName + ".preventClickEvent")) {
					$.removeData(event.target, that.widgetName + ".preventClickEvent");
					event.stopImmediatePropagation();
					return false;
				}
			});

		this.started = false;
	},

	// TODO: make sure destroying one instance of mouse doesn't mess with
	// other instances of mouse
	_mouseDestroy: function() {
		this.element.unbind("."+this.widgetName);
		if ( this._mouseMoveDelegate ) {
			$(document)
				.unbind("mousemove."+this.widgetName, this._mouseMoveDelegate)
				.unbind("mouseup."+this.widgetName, this._mouseUpDelegate);
		}
	},

	_mouseDown: function(event) {
		// don't let more than one widget handle mouseStart
		if( mouseHandled ) { return; }

		// we may have missed mouseup (out of window)
		(this._mouseStarted && this._mouseUp(event));

		this._mouseDownEvent = event;

		var that = this,
			btnIsLeft = (event.which === 1),
			// event.target.nodeName works around a bug in IE 8 with
			// disabled inputs (#7620)
			elIsCancel = (typeof this.options.cancel === "string" && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);
		if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
			return true;
		}

		this.mouseDelayMet = !this.options.delay;
		if (!this.mouseDelayMet) {
			this._mouseDelayTimer = setTimeout(function() {
				that.mouseDelayMet = true;
			}, this.options.delay);
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted = (this._mouseStart(event) !== false);
			if (!this._mouseStarted) {
				event.preventDefault();
				return true;
			}
		}

		// Click event may never have fired (Gecko & Opera)
		if (true === $.data(event.target, this.widgetName + ".preventClickEvent")) {
			$.removeData(event.target, this.widgetName + ".preventClickEvent");
		}

		// these delegates are required to keep context
		this._mouseMoveDelegate = function(event) {
			return that._mouseMove(event);
		};
		this._mouseUpDelegate = function(event) {
			return that._mouseUp(event);
		};
		$(document)
			.bind("mousemove."+this.widgetName, this._mouseMoveDelegate)
			.bind("mouseup."+this.widgetName, this._mouseUpDelegate);

		event.preventDefault();

		mouseHandled = true;
		return true;
	},

	_mouseMove: function(event) {
		// IE mouseup check - mouseup happened when mouse was out of window
		if ($.ui.ie && ( !document.documentMode || document.documentMode < 9 ) && !event.button) {
			return this._mouseUp(event);
		}

		if (this._mouseStarted) {
			this._mouseDrag(event);
			return event.preventDefault();
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted =
				(this._mouseStart(this._mouseDownEvent, event) !== false);
			(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
		}

		return !this._mouseStarted;
	},

	_mouseUp: function(event) {
		$(document)
			.unbind("mousemove."+this.widgetName, this._mouseMoveDelegate)
			.unbind("mouseup."+this.widgetName, this._mouseUpDelegate);

		if (this._mouseStarted) {
			this._mouseStarted = false;

			if (event.target === this._mouseDownEvent.target) {
				$.data(event.target, this.widgetName + ".preventClickEvent", true);
			}

			this._mouseStop(event);
		}

		return false;
	},

	_mouseDistanceMet: function(event) {
		return (Math.max(
				Math.abs(this._mouseDownEvent.pageX - event.pageX),
				Math.abs(this._mouseDownEvent.pageY - event.pageY)
			) >= this.options.distance
		);
	},

	_mouseDelayMet: function(/* event */) {
		return this.mouseDelayMet;
	},

	// These are placeholder methods, to be overriden by extending plugin
	_mouseStart: function(/* event */) {},
	_mouseDrag: function(/* event */) {},
	_mouseStop: function(/* event */) {},
	_mouseCapture: function(/* event */) { return true; }
});

})(jQuery);
(function( $, undefined ) {

$.ui = $.ui || {};

var cachedScrollbarWidth,
	max = Math.max,
	abs = Math.abs,
	round = Math.round,
	rhorizontal = /left|center|right/,
	rvertical = /top|center|bottom/,
	roffset = /[\+\-]\d+(\.[\d]+)?%?/,
	rposition = /^\w+/,
	rpercent = /%$/,
	_position = $.fn.position;

function getOffsets( offsets, width, height ) {
	return [
		parseFloat( offsets[ 0 ] ) * ( rpercent.test( offsets[ 0 ] ) ? width / 100 : 1 ),
		parseFloat( offsets[ 1 ] ) * ( rpercent.test( offsets[ 1 ] ) ? height / 100 : 1 )
	];
}

function parseCss( element, property ) {
	return parseInt( $.css( element, property ), 10 ) || 0;
}

function getDimensions( elem ) {
	var raw = elem[0];
	if ( raw.nodeType === 9 ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: 0, left: 0 }
		};
	}
	if ( $.isWindow( raw ) ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: elem.scrollTop(), left: elem.scrollLeft() }
		};
	}
	if ( raw.preventDefault ) {
		return {
			width: 0,
			height: 0,
			offset: { top: raw.pageY, left: raw.pageX }
		};
	}
	return {
		width: elem.outerWidth(),
		height: elem.outerHeight(),
		offset: elem.offset()
	};
}

$.position = {
	scrollbarWidth: function() {
		if ( cachedScrollbarWidth !== undefined ) {
			return cachedScrollbarWidth;
		}
		var w1, w2,
			div = $( "<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>" ),
			innerDiv = div.children()[0];

		$( "body" ).append( div );
		w1 = innerDiv.offsetWidth;
		div.css( "overflow", "scroll" );

		w2 = innerDiv.offsetWidth;

		if ( w1 === w2 ) {
			w2 = div[0].clientWidth;
		}

		div.remove();

		return (cachedScrollbarWidth = w1 - w2);
	},
	getScrollInfo: function( within ) {
		var overflowX = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-x" ),
			overflowY = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-y" ),
			hasOverflowX = overflowX === "scroll" ||
				( overflowX === "auto" && within.width < within.element[0].scrollWidth ),
			hasOverflowY = overflowY === "scroll" ||
				( overflowY === "auto" && within.height < within.element[0].scrollHeight );
		return {
			width: hasOverflowY ? $.position.scrollbarWidth() : 0,
			height: hasOverflowX ? $.position.scrollbarWidth() : 0
		};
	},
	getWithinInfo: function( element ) {
		var withinElement = $( element || window ),
			isWindow = $.isWindow( withinElement[0] ),
			isDocument = !!withinElement[ 0 ] && withinElement[ 0 ].nodeType === 9;
		return {
			element: withinElement,
			isWindow: isWindow,
			isDocument: isDocument,
			offset: withinElement.offset() || { left: 0, top: 0 },
			scrollLeft: withinElement.scrollLeft(),
			scrollTop: withinElement.scrollTop(),
			width: isWindow ? withinElement.width() : withinElement.outerWidth(),
			height: isWindow ? withinElement.height() : withinElement.outerHeight()
		};
	}
};

$.fn.position = function( options ) {
	if ( !options || !options.of ) {
		return _position.apply( this, arguments );
	}

	// make a copy, we don't want to modify arguments
	options = $.extend( {}, options );

	var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions,
		target = $( options.of ),
		within = $.position.getWithinInfo( options.within ),
		scrollInfo = $.position.getScrollInfo( within ),
		collision = ( options.collision || "flip" ).split( " " ),
		offsets = {};

	dimensions = getDimensions( target );
	if ( target[0].preventDefault ) {
		// force left top to allow flipping
		options.at = "left top";
	}
	targetWidth = dimensions.width;
	targetHeight = dimensions.height;
	targetOffset = dimensions.offset;
	// clone to reuse original targetOffset later
	basePosition = $.extend( {}, targetOffset );

	// force my and at to have valid horizontal and vertical positions
	// if a value is missing or invalid, it will be converted to center
	$.each( [ "my", "at" ], function() {
		var pos = ( options[ this ] || "" ).split( " " ),
			horizontalOffset,
			verticalOffset;

		if ( pos.length === 1) {
			pos = rhorizontal.test( pos[ 0 ] ) ?
				pos.concat( [ "center" ] ) :
				rvertical.test( pos[ 0 ] ) ?
					[ "center" ].concat( pos ) :
					[ "center", "center" ];
		}
		pos[ 0 ] = rhorizontal.test( pos[ 0 ] ) ? pos[ 0 ] : "center";
		pos[ 1 ] = rvertical.test( pos[ 1 ] ) ? pos[ 1 ] : "center";

		// calculate offsets
		horizontalOffset = roffset.exec( pos[ 0 ] );
		verticalOffset = roffset.exec( pos[ 1 ] );
		offsets[ this ] = [
			horizontalOffset ? horizontalOffset[ 0 ] : 0,
			verticalOffset ? verticalOffset[ 0 ] : 0
		];

		// reduce to just the positions without the offsets
		options[ this ] = [
			rposition.exec( pos[ 0 ] )[ 0 ],
			rposition.exec( pos[ 1 ] )[ 0 ]
		];
	});

	// normalize collision option
	if ( collision.length === 1 ) {
		collision[ 1 ] = collision[ 0 ];
	}

	if ( options.at[ 0 ] === "right" ) {
		basePosition.left += targetWidth;
	} else if ( options.at[ 0 ] === "center" ) {
		basePosition.left += targetWidth / 2;
	}

	if ( options.at[ 1 ] === "bottom" ) {
		basePosition.top += targetHeight;
	} else if ( options.at[ 1 ] === "center" ) {
		basePosition.top += targetHeight / 2;
	}

	atOffset = getOffsets( offsets.at, targetWidth, targetHeight );
	basePosition.left += atOffset[ 0 ];
	basePosition.top += atOffset[ 1 ];

	return this.each(function() {
		var collisionPosition, using,
			elem = $( this ),
			elemWidth = elem.outerWidth(),
			elemHeight = elem.outerHeight(),
			marginLeft = parseCss( this, "marginLeft" ),
			marginTop = parseCss( this, "marginTop" ),
			collisionWidth = elemWidth + marginLeft + parseCss( this, "marginRight" ) + scrollInfo.width,
			collisionHeight = elemHeight + marginTop + parseCss( this, "marginBottom" ) + scrollInfo.height,
			position = $.extend( {}, basePosition ),
			myOffset = getOffsets( offsets.my, elem.outerWidth(), elem.outerHeight() );

		if ( options.my[ 0 ] === "right" ) {
			position.left -= elemWidth;
		} else if ( options.my[ 0 ] === "center" ) {
			position.left -= elemWidth / 2;
		}

		if ( options.my[ 1 ] === "bottom" ) {
			position.top -= elemHeight;
		} else if ( options.my[ 1 ] === "center" ) {
			position.top -= elemHeight / 2;
		}

		position.left += myOffset[ 0 ];
		position.top += myOffset[ 1 ];

		// if the browser doesn't support fractions, then round for consistent results
		if ( !$.support.offsetFractions ) {
			position.left = round( position.left );
			position.top = round( position.top );
		}

		collisionPosition = {
			marginLeft: marginLeft,
			marginTop: marginTop
		};

		$.each( [ "left", "top" ], function( i, dir ) {
			if ( $.ui.position[ collision[ i ] ] ) {
				$.ui.position[ collision[ i ] ][ dir ]( position, {
					targetWidth: targetWidth,
					targetHeight: targetHeight,
					elemWidth: elemWidth,
					elemHeight: elemHeight,
					collisionPosition: collisionPosition,
					collisionWidth: collisionWidth,
					collisionHeight: collisionHeight,
					offset: [ atOffset[ 0 ] + myOffset[ 0 ], atOffset [ 1 ] + myOffset[ 1 ] ],
					my: options.my,
					at: options.at,
					within: within,
					elem : elem
				});
			}
		});

		if ( options.using ) {
			// adds feedback as second argument to using callback, if present
			using = function( props ) {
				var left = targetOffset.left - position.left,
					right = left + targetWidth - elemWidth,
					top = targetOffset.top - position.top,
					bottom = top + targetHeight - elemHeight,
					feedback = {
						target: {
							element: target,
							left: targetOffset.left,
							top: targetOffset.top,
							width: targetWidth,
							height: targetHeight
						},
						element: {
							element: elem,
							left: position.left,
							top: position.top,
							width: elemWidth,
							height: elemHeight
						},
						horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
						vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
					};
				if ( targetWidth < elemWidth && abs( left + right ) < targetWidth ) {
					feedback.horizontal = "center";
				}
				if ( targetHeight < elemHeight && abs( top + bottom ) < targetHeight ) {
					feedback.vertical = "middle";
				}
				if ( max( abs( left ), abs( right ) ) > max( abs( top ), abs( bottom ) ) ) {
					feedback.important = "horizontal";
				} else {
					feedback.important = "vertical";
				}
				options.using.call( this, props, feedback );
			};
		}

		elem.offset( $.extend( position, { using: using } ) );
	});
};

$.ui.position = {
	fit: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
				outerWidth = within.width,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = withinOffset - collisionPosLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
				newOverRight;

			// element is wider than within
			if ( data.collisionWidth > outerWidth ) {
				// element is initially over the left side of within
				if ( overLeft > 0 && overRight <= 0 ) {
					newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
					position.left += overLeft - newOverRight;
				// element is initially over right side of within
				} else if ( overRight > 0 && overLeft <= 0 ) {
					position.left = withinOffset;
				// element is initially over both left and right sides of within
				} else {
					if ( overLeft > overRight ) {
						position.left = withinOffset + outerWidth - data.collisionWidth;
					} else {
						position.left = withinOffset;
					}
				}
			// too far left -> align with left edge
			} else if ( overLeft > 0 ) {
				position.left += overLeft;
			// too far right -> align with right edge
			} else if ( overRight > 0 ) {
				position.left -= overRight;
			// adjust based on position and margin
			} else {
				position.left = max( position.left - collisionPosLeft, position.left );
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
				outerHeight = data.within.height,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = withinOffset - collisionPosTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
				newOverBottom;

			// element is taller than within
			if ( data.collisionHeight > outerHeight ) {
				// element is initially over the top of within
				if ( overTop > 0 && overBottom <= 0 ) {
					newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
					position.top += overTop - newOverBottom;
				// element is initially over bottom of within
				} else if ( overBottom > 0 && overTop <= 0 ) {
					position.top = withinOffset;
				// element is initially over both top and bottom of within
				} else {
					if ( overTop > overBottom ) {
						position.top = withinOffset + outerHeight - data.collisionHeight;
					} else {
						position.top = withinOffset;
					}
				}
			// too far up -> align with top
			} else if ( overTop > 0 ) {
				position.top += overTop;
			// too far down -> align with bottom edge
			} else if ( overBottom > 0 ) {
				position.top -= overBottom;
			// adjust based on position and margin
			} else {
				position.top = max( position.top - collisionPosTop, position.top );
			}
		}
	},
	flip: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.left + within.scrollLeft,
				outerWidth = within.width,
				offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = collisionPosLeft - offsetLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
				myOffset = data.my[ 0 ] === "left" ?
					-data.elemWidth :
					data.my[ 0 ] === "right" ?
						data.elemWidth :
						0,
				atOffset = data.at[ 0 ] === "left" ?
					data.targetWidth :
					data.at[ 0 ] === "right" ?
						-data.targetWidth :
						0,
				offset = -2 * data.offset[ 0 ],
				newOverRight,
				newOverLeft;

			if ( overLeft < 0 ) {
				newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;
				if ( newOverRight < 0 || newOverRight < abs( overLeft ) ) {
					position.left += myOffset + atOffset + offset;
				}
			}
			else if ( overRight > 0 ) {
				newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;
				if ( newOverLeft > 0 || abs( newOverLeft ) < overRight ) {
					position.left += myOffset + atOffset + offset;
				}
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.top + within.scrollTop,
				outerHeight = within.height,
				offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = collisionPosTop - offsetTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
				top = data.my[ 1 ] === "top",
				myOffset = top ?
					-data.elemHeight :
					data.my[ 1 ] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[ 1 ] === "top" ?
					data.targetHeight :
					data.at[ 1 ] === "bottom" ?
						-data.targetHeight :
						0,
				offset = -2 * data.offset[ 1 ],
				newOverTop,
				newOverBottom;
			if ( overTop < 0 ) {
				newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
				if ( ( position.top + myOffset + atOffset + offset) > overTop && ( newOverBottom < 0 || newOverBottom < abs( overTop ) ) ) {
					position.top += myOffset + atOffset + offset;
				}
			}
			else if ( overBottom > 0 ) {
				newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
				if ( ( position.top + myOffset + atOffset + offset) > overBottom && ( newOverTop > 0 || abs( newOverTop ) < overBottom ) ) {
					position.top += myOffset + atOffset + offset;
				}
			}
		}
	},
	flipfit: {
		left: function() {
			$.ui.position.flip.left.apply( this, arguments );
			$.ui.position.fit.left.apply( this, arguments );
		},
		top: function() {
			$.ui.position.flip.top.apply( this, arguments );
			$.ui.position.fit.top.apply( this, arguments );
		}
	}
};

// fraction support test
(function () {
	var testElement, testElementParent, testElementStyle, offsetLeft, i,
		body = document.getElementsByTagName( "body" )[ 0 ],
		div = document.createElement( "div" );

	//Create a "fake body" for testing based on method used in jQuery.support
	testElement = document.createElement( body ? "div" : "body" );
	testElementStyle = {
		visibility: "hidden",
		width: 0,
		height: 0,
		border: 0,
		margin: 0,
		background: "none"
	};
	if ( body ) {
		$.extend( testElementStyle, {
			position: "absolute",
			left: "-1000px",
			top: "-1000px"
		});
	}
	for ( i in testElementStyle ) {
		testElement.style[ i ] = testElementStyle[ i ];
	}
	testElement.appendChild( div );
	testElementParent = body || document.documentElement;
	testElementParent.insertBefore( testElement, testElementParent.firstChild );

	div.style.cssText = "position: absolute; left: 10.7432222px;";

	offsetLeft = $( div ).offset().left;
	$.support.offsetFractions = offsetLeft > 10 && offsetLeft < 11;

	testElement.innerHTML = "";
	testElementParent.removeChild( testElement );
})();

}( jQuery ) );
(function( $, undefined ) {

$.widget("ui.draggable", $.ui.mouse, {
	version: "1.10.4",
	widgetEventPrefix: "drag",
	options: {
		addClasses: true,
		appendTo: "parent",
		axis: false,
		connectToSortable: false,
		containment: false,
		cursor: "auto",
		cursorAt: false,
		grid: false,
		handle: false,
		helper: "original",
		iframeFix: false,
		opacity: false,
		refreshPositions: false,
		revert: false,
		revertDuration: 500,
		scope: "default",
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		snap: false,
		snapMode: "both",
		snapTolerance: 20,
		stack: false,
		zIndex: false,

		// callbacks
		drag: null,
		start: null,
		stop: null
	},
	_create: function() {

		if (this.options.helper === "original" && !(/^(?:r|a|f)/).test(this.element.css("position"))) {
			this.element[0].style.position = "relative";
		}
		if (this.options.addClasses){
			this.element.addClass("ui-draggable");
		}
		if (this.options.disabled){
			this.element.addClass("ui-draggable-disabled");
		}

		this._mouseInit();

	},

	_destroy: function() {
		this.element.removeClass( "ui-draggable ui-draggable-dragging ui-draggable-disabled" );
		this._mouseDestroy();
	},

	_mouseCapture: function(event) {

		var o = this.options;

		// among others, prevent a drag on a resizable-handle
		if (this.helper || o.disabled || $(event.target).closest(".ui-resizable-handle").length > 0) {
			return false;
		}

		//Quit if we're not on a valid handle
		this.handle = this._getHandle(event);
		if (!this.handle) {
			return false;
		}

		$(o.iframeFix === true ? "iframe" : o.iframeFix).each(function() {
			$("<div class='ui-draggable-iframeFix' style='background: #fff;'></div>")
			.css({
				width: this.offsetWidth+"px", height: this.offsetHeight+"px",
				position: "absolute", opacity: "0.001", zIndex: 1000
			})
			.css($(this).offset())
			.appendTo("body");
		});

		return true;

	},

	_mouseStart: function(event) {

		var o = this.options;

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		this.helper.addClass("ui-draggable-dragging");

		//Cache the helper size
		this._cacheHelperProportions();

		//If ddmanager is used for droppables, set the global draggable
		if($.ui.ddmanager) {
			$.ui.ddmanager.current = this;
		}

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Store the helper's css position
		this.cssPosition = this.helper.css( "position" );
		this.scrollParent = this.helper.scrollParent();
		this.offsetParent = this.helper.offsetParent();
		this.offsetParentCssPosition = this.offsetParent.css( "position" );

		//The element's absolute position on the page minus margins
		this.offset = this.positionAbs = this.element.offset();
		this.offset = {
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};

		//Reset scroll cache
		this.offset.scroll = false;

		$.extend(this.offset, {
			click: { //Where the click happened, relative to the element
				left: event.pageX - this.offset.left,
				top: event.pageY - this.offset.top
			},
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
		});

		//Generate the original position
		this.originalPosition = this.position = this._generatePosition(event);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if "cursorAt" is supplied
		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

		//Set a containment if given in the options
		this._setContainment();

		//Trigger event + callbacks
		if(this._trigger("start", event) === false) {
			this._clear();
			return false;
		}

		//Recache the helper size
		this._cacheHelperProportions();

		//Prepare the droppable offsets
		if ($.ui.ddmanager && !o.dropBehaviour) {
			$.ui.ddmanager.prepareOffsets(this, event);
		}


		this._mouseDrag(event, true); //Execute the drag once - this causes the helper not to be visible before getting its correct position

		//If the ddmanager is used for droppables, inform the manager that dragging has started (see #5003)
		if ( $.ui.ddmanager ) {
			$.ui.ddmanager.dragStart(this, event);
		}

		return true;
	},

	_mouseDrag: function(event, noPropagation) {
		// reset any necessary cached properties (see #5009)
		if ( this.offsetParentCssPosition === "fixed" ) {
			this.offset.parent = this._getParentOffset();
		}

		//Compute the helpers position
		this.position = this._generatePosition(event);
		this.positionAbs = this._convertPositionTo("absolute");

		//Call plugins and callbacks and use the resulting position if something is returned
		if (!noPropagation) {
			var ui = this._uiHash();
			if(this._trigger("drag", event, ui) === false) {
				this._mouseUp({});
				return false;
			}
			this.position = ui.position;
		}

		if(!this.options.axis || this.options.axis !== "y") {
			this.helper[0].style.left = this.position.left+"px";
		}
		if(!this.options.axis || this.options.axis !== "x") {
			this.helper[0].style.top = this.position.top+"px";
		}
		if($.ui.ddmanager) {
			$.ui.ddmanager.drag(this, event);
		}

		return false;
	},

	_mouseStop: function(event) {

		//If we are using droppables, inform the manager about the drop
		var that = this,
			dropped = false;
		if ($.ui.ddmanager && !this.options.dropBehaviour) {
			dropped = $.ui.ddmanager.drop(this, event);
		}

		//if a drop comes from outside (a sortable)
		if(this.dropped) {
			dropped = this.dropped;
			this.dropped = false;
		}

		//if the original element is no longer in the DOM don't bother to continue (see #8269)
		if ( this.options.helper === "original" && !$.contains( this.element[ 0 ].ownerDocument, this.element[ 0 ] ) ) {
			return false;
		}

		if((this.options.revert === "invalid" && !dropped) || (this.options.revert === "valid" && dropped) || this.options.revert === true || ($.isFunction(this.options.revert) && this.options.revert.call(this.element, dropped))) {
			$(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function() {
				if(that._trigger("stop", event) !== false) {
					that._clear();
				}
			});
		} else {
			if(this._trigger("stop", event) !== false) {
				this._clear();
			}
		}

		return false;
	},

	_mouseUp: function(event) {
		//Remove frame helpers
		$("div.ui-draggable-iframeFix").each(function() {
			this.parentNode.removeChild(this);
		});

		//If the ddmanager is used for droppables, inform the manager that dragging has stopped (see #5003)
		if( $.ui.ddmanager ) {
			$.ui.ddmanager.dragStop(this, event);
		}

		return $.ui.mouse.prototype._mouseUp.call(this, event);
	},

	cancel: function() {

		if(this.helper.is(".ui-draggable-dragging")) {
			this._mouseUp({});
		} else {
			this._clear();
		}

		return this;

	},

	_getHandle: function(event) {
		return this.options.handle ?
			!!$( event.target ).closest( this.element.find( this.options.handle ) ).length :
			true;
	},

	_createHelper: function(event) {

		var o = this.options,
			helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event])) : (o.helper === "clone" ? this.element.clone().removeAttr("id") : this.element);

		if(!helper.parents("body").length) {
			helper.appendTo((o.appendTo === "parent" ? this.element[0].parentNode : o.appendTo));
		}

		if(helper[0] !== this.element[0] && !(/(fixed|absolute)/).test(helper.css("position"))) {
			helper.css("position", "absolute");
		}

		return helper;

	},

	_adjustOffsetFromHelper: function(obj) {
		if (typeof obj === "string") {
			obj = obj.split(" ");
		}
		if ($.isArray(obj)) {
			obj = {left: +obj[0], top: +obj[1] || 0};
		}
		if ("left" in obj) {
			this.offset.click.left = obj.left + this.margins.left;
		}
		if ("right" in obj) {
			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		}
		if ("top" in obj) {
			this.offset.click.top = obj.top + this.margins.top;
		}
		if ("bottom" in obj) {
			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
		}
	},

	_getParentOffset: function() {

		//Get the offsetParent and cache its position
		var po = this.offsetParent.offset();

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if(this.cssPosition === "absolute" && this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		//This needs to be actually done for all browsers, since pageX/pageY includes this information
		//Ugly IE fix
		if((this.offsetParent[0] === document.body) ||
			(this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() === "html" && $.ui.ie)) {
			po = { top: 0, left: 0 };
		}

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
		};

	},

	_getRelativeOffset: function() {

		if(this.cssPosition === "relative") {
			var p = this.element.position();
			return {
				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
			};
		} else {
			return { top: 0, left: 0 };
		}

	},

	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.element.css("marginLeft"),10) || 0),
			top: (parseInt(this.element.css("marginTop"),10) || 0),
			right: (parseInt(this.element.css("marginRight"),10) || 0),
			bottom: (parseInt(this.element.css("marginBottom"),10) || 0)
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var over, c, ce,
			o = this.options;

		if ( !o.containment ) {
			this.containment = null;
			return;
		}

		if ( o.containment === "window" ) {
			this.containment = [
				$( window ).scrollLeft() - this.offset.relative.left - this.offset.parent.left,
				$( window ).scrollTop() - this.offset.relative.top - this.offset.parent.top,
				$( window ).scrollLeft() + $( window ).width() - this.helperProportions.width - this.margins.left,
				$( window ).scrollTop() + ( $( window ).height() || document.body.parentNode.scrollHeight ) - this.helperProportions.height - this.margins.top
			];
			return;
		}

		if ( o.containment === "document") {
			this.containment = [
				0,
				0,
				$( document ).width() - this.helperProportions.width - this.margins.left,
				( $( document ).height() || document.body.parentNode.scrollHeight ) - this.helperProportions.height - this.margins.top
			];
			return;
		}

		if ( o.containment.constructor === Array ) {
			this.containment = o.containment;
			return;
		}

		if ( o.containment === "parent" ) {
			o.containment = this.helper[ 0 ].parentNode;
		}

		c = $( o.containment );
		ce = c[ 0 ];

		if( !ce ) {
			return;
		}

		over = c.css( "overflow" ) !== "hidden";

		this.containment = [
			( parseInt( c.css( "borderLeftWidth" ), 10 ) || 0 ) + ( parseInt( c.css( "paddingLeft" ), 10 ) || 0 ),
			( parseInt( c.css( "borderTopWidth" ), 10 ) || 0 ) + ( parseInt( c.css( "paddingTop" ), 10 ) || 0 ) ,
			( over ? Math.max( ce.scrollWidth, ce.offsetWidth ) : ce.offsetWidth ) - ( parseInt( c.css( "borderRightWidth" ), 10 ) || 0 ) - ( parseInt( c.css( "paddingRight" ), 10 ) || 0 ) - this.helperProportions.width - this.margins.left - this.margins.right,
			( over ? Math.max( ce.scrollHeight, ce.offsetHeight ) : ce.offsetHeight ) - ( parseInt( c.css( "borderBottomWidth" ), 10 ) || 0 ) - ( parseInt( c.css( "paddingBottom" ), 10 ) || 0 ) - this.helperProportions.height - this.margins.top  - this.margins.bottom
		];
		this.relative_container = c;
	},

	_convertPositionTo: function(d, pos) {

		if(!pos) {
			pos = this.position;
		}

		var mod = d === "absolute" ? 1 : -1,
			scroll = this.cssPosition === "absolute" && !( this.scrollParent[ 0 ] !== document && $.contains( this.scrollParent[ 0 ], this.offsetParent[ 0 ] ) ) ? this.offsetParent : this.scrollParent;

		//Cache the scroll
		if (!this.offset.scroll) {
			this.offset.scroll = {top : scroll.scrollTop(), left : scroll.scrollLeft()};
		}

		return {
			top: (
				pos.top	+																// The absolute mouse position
				this.offset.relative.top * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.top * mod -										// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : this.offset.scroll.top ) * mod )
			),
			left: (
				pos.left +																// The absolute mouse position
				this.offset.relative.left * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.left * mod	-										// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : this.offset.scroll.left ) * mod )
			)
		};

	},

	_generatePosition: function(event) {

		var containment, co, top, left,
			o = this.options,
			scroll = this.cssPosition === "absolute" && !( this.scrollParent[ 0 ] !== document && $.contains( this.scrollParent[ 0 ], this.offsetParent[ 0 ] ) ) ? this.offsetParent : this.scrollParent,
			pageX = event.pageX,
			pageY = event.pageY;

		//Cache the scroll
		if (!this.offset.scroll) {
			this.offset.scroll = {top : scroll.scrollTop(), left : scroll.scrollLeft()};
		}

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		// If we are not dragging yet, we won't check for options
		if ( this.originalPosition ) {
			if ( this.containment ) {
				if ( this.relative_container ){
					co = this.relative_container.offset();
					containment = [
						this.containment[ 0 ] + co.left,
						this.containment[ 1 ] + co.top,
						this.containment[ 2 ] + co.left,
						this.containment[ 3 ] + co.top
					];
				}
				else {
					containment = this.containment;
				}

				if(event.pageX - this.offset.click.left < containment[0]) {
					pageX = containment[0] + this.offset.click.left;
				}
				if(event.pageY - this.offset.click.top < containment[1]) {
					pageY = containment[1] + this.offset.click.top;
				}
				if(event.pageX - this.offset.click.left > containment[2]) {
					pageX = containment[2] + this.offset.click.left;
				}
				if(event.pageY - this.offset.click.top > containment[3]) {
					pageY = containment[3] + this.offset.click.top;
				}
			}

			if(o.grid) {
				//Check for grid elements set to 0 to prevent divide by 0 error causing invalid argument errors in IE (see ticket #6950)
				top = o.grid[1] ? this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1] : this.originalPageY;
				pageY = containment ? ((top - this.offset.click.top >= containment[1] || top - this.offset.click.top > containment[3]) ? top : ((top - this.offset.click.top >= containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

				left = o.grid[0] ? this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0] : this.originalPageX;
				pageX = containment ? ((left - this.offset.click.left >= containment[0] || left - this.offset.click.left > containment[2]) ? left : ((left - this.offset.click.left >= containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
			}

		}

		return {
			top: (
				pageY -																	// The absolute mouse position
				this.offset.click.top	-												// Click offset (relative to the element)
				this.offset.relative.top -												// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.top +												// The offsetParent's offset without borders (offset + border)
				( this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : this.offset.scroll.top )
			),
			left: (
				pageX -																	// The absolute mouse position
				this.offset.click.left -												// Click offset (relative to the element)
				this.offset.relative.left -												// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.left +												// The offsetParent's offset without borders (offset + border)
				( this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : this.offset.scroll.left )
			)
		};

	},

	_clear: function() {
		this.helper.removeClass("ui-draggable-dragging");
		if(this.helper[0] !== this.element[0] && !this.cancelHelperRemoval) {
			this.helper.remove();
		}
		this.helper = null;
		this.cancelHelperRemoval = false;
	},

	// From now on bulk stuff - mainly helpers

	_trigger: function(type, event, ui) {
		ui = ui || this._uiHash();
		$.ui.plugin.call(this, type, [event, ui]);
		//The absolute position has to be recalculated after plugins
		if(type === "drag") {
			this.positionAbs = this._convertPositionTo("absolute");
		}
		return $.Widget.prototype._trigger.call(this, type, event, ui);
	},

	plugins: {},

	_uiHash: function() {
		return {
			helper: this.helper,
			position: this.position,
			originalPosition: this.originalPosition,
			offset: this.positionAbs
		};
	}

});

$.ui.plugin.add("draggable", "connectToSortable", {
	start: function(event, ui) {

		var inst = $(this).data("ui-draggable"), o = inst.options,
			uiSortable = $.extend({}, ui, { item: inst.element });
		inst.sortables = [];
		$(o.connectToSortable).each(function() {
			var sortable = $.data(this, "ui-sortable");
			if (sortable && !sortable.options.disabled) {
				inst.sortables.push({
					instance: sortable,
					shouldRevert: sortable.options.revert
				});
				sortable.refreshPositions();	// Call the sortable's refreshPositions at drag start to refresh the containerCache since the sortable container cache is used in drag and needs to be up to date (this will ensure it's initialised as well as being kept in step with any changes that might have happened on the page).
				sortable._trigger("activate", event, uiSortable);
			}
		});

	},
	stop: function(event, ui) {

		//If we are still over the sortable, we fake the stop event of the sortable, but also remove helper
		var inst = $(this).data("ui-draggable"),
			uiSortable = $.extend({}, ui, { item: inst.element });

		$.each(inst.sortables, function() {
			if(this.instance.isOver) {

				this.instance.isOver = 0;

				inst.cancelHelperRemoval = true; //Don't remove the helper in the draggable instance
				this.instance.cancelHelperRemoval = false; //Remove it in the sortable instance (so sortable plugins like revert still work)

				//The sortable revert is supported, and we have to set a temporary dropped variable on the draggable to support revert: "valid/invalid"
				if(this.shouldRevert) {
					this.instance.options.revert = this.shouldRevert;
				}

				//Trigger the stop of the sortable
				this.instance._mouseStop(event);

				this.instance.options.helper = this.instance.options._helper;

				//If the helper has been the original item, restore properties in the sortable
				if(inst.options.helper === "original") {
					this.instance.currentItem.css({ top: "auto", left: "auto" });
				}

			} else {
				this.instance.cancelHelperRemoval = false; //Remove the helper in the sortable instance
				this.instance._trigger("deactivate", event, uiSortable);
			}

		});

	},
	drag: function(event, ui) {

		var inst = $(this).data("ui-draggable"), that = this;

		$.each(inst.sortables, function() {

			var innermostIntersecting = false,
				thisSortable = this;

			//Copy over some variables to allow calling the sortable's native _intersectsWith
			this.instance.positionAbs = inst.positionAbs;
			this.instance.helperProportions = inst.helperProportions;
			this.instance.offset.click = inst.offset.click;

			if(this.instance._intersectsWith(this.instance.containerCache)) {
				innermostIntersecting = true;
				$.each(inst.sortables, function () {
					this.instance.positionAbs = inst.positionAbs;
					this.instance.helperProportions = inst.helperProportions;
					this.instance.offset.click = inst.offset.click;
					if (this !== thisSortable &&
						this.instance._intersectsWith(this.instance.containerCache) &&
						$.contains(thisSortable.instance.element[0], this.instance.element[0])
					) {
						innermostIntersecting = false;
					}
					return innermostIntersecting;
				});
			}


			if(innermostIntersecting) {
				//If it intersects, we use a little isOver variable and set it once, so our move-in stuff gets fired only once
				if(!this.instance.isOver) {

					this.instance.isOver = 1;
					//Now we fake the start of dragging for the sortable instance,
					//by cloning the list group item, appending it to the sortable and using it as inst.currentItem
					//We can then fire the start event of the sortable with our passed browser event, and our own helper (so it doesn't create a new one)
					this.instance.currentItem = $(that).clone().removeAttr("id").appendTo(this.instance.element).data("ui-sortable-item", true);
					this.instance.options._helper = this.instance.options.helper; //Store helper option to later restore it
					this.instance.options.helper = function() { return ui.helper[0]; };

					event.target = this.instance.currentItem[0];
					this.instance._mouseCapture(event, true);
					this.instance._mouseStart(event, true, true);

					//Because the browser event is way off the new appended portlet, we modify a couple of variables to reflect the changes
					this.instance.offset.click.top = inst.offset.click.top;
					this.instance.offset.click.left = inst.offset.click.left;
					this.instance.offset.parent.left -= inst.offset.parent.left - this.instance.offset.parent.left;
					this.instance.offset.parent.top -= inst.offset.parent.top - this.instance.offset.parent.top;

					inst._trigger("toSortable", event);
					inst.dropped = this.instance.element; //draggable revert needs that
					//hack so receive/update callbacks work (mostly)
					inst.currentItem = inst.element;
					this.instance.fromOutside = inst;

				}

				//Provided we did all the previous steps, we can fire the drag event of the sortable on every draggable drag, when it intersects with the sortable
				if(this.instance.currentItem) {
					this.instance._mouseDrag(event);
				}

			} else {

				//If it doesn't intersect with the sortable, and it intersected before,
				//we fake the drag stop of the sortable, but make sure it doesn't remove the helper by using cancelHelperRemoval
				if(this.instance.isOver) {

					this.instance.isOver = 0;
					this.instance.cancelHelperRemoval = true;

					//Prevent reverting on this forced stop
					this.instance.options.revert = false;

					// The out event needs to be triggered independently
					this.instance._trigger("out", event, this.instance._uiHash(this.instance));

					this.instance._mouseStop(event, true);
					this.instance.options.helper = this.instance.options._helper;

					//Now we remove our currentItem, the list group clone again, and the placeholder, and animate the helper back to it's original size
					this.instance.currentItem.remove();
					if(this.instance.placeholder) {
						this.instance.placeholder.remove();
					}

					inst._trigger("fromSortable", event);
					inst.dropped = false; //draggable revert needs that
				}

			}

		});

	}
});

$.ui.plugin.add("draggable", "cursor", {
	start: function() {
		var t = $("body"), o = $(this).data("ui-draggable").options;
		if (t.css("cursor")) {
			o._cursor = t.css("cursor");
		}
		t.css("cursor", o.cursor);
	},
	stop: function() {
		var o = $(this).data("ui-draggable").options;
		if (o._cursor) {
			$("body").css("cursor", o._cursor);
		}
	}
});

$.ui.plugin.add("draggable", "opacity", {
	start: function(event, ui) {
		var t = $(ui.helper), o = $(this).data("ui-draggable").options;
		if(t.css("opacity")) {
			o._opacity = t.css("opacity");
		}
		t.css("opacity", o.opacity);
	},
	stop: function(event, ui) {
		var o = $(this).data("ui-draggable").options;
		if(o._opacity) {
			$(ui.helper).css("opacity", o._opacity);
		}
	}
});

$.ui.plugin.add("draggable", "scroll", {
	start: function() {
		var i = $(this).data("ui-draggable");
		if(i.scrollParent[0] !== document && i.scrollParent[0].tagName !== "HTML") {
			i.overflowOffset = i.scrollParent.offset();
		}
	},
	drag: function( event ) {

		var i = $(this).data("ui-draggable"), o = i.options, scrolled = false;

		if(i.scrollParent[0] !== document && i.scrollParent[0].tagName !== "HTML") {

			if(!o.axis || o.axis !== "x") {
				if((i.overflowOffset.top + i.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity) {
					i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop + o.scrollSpeed;
				} else if(event.pageY - i.overflowOffset.top < o.scrollSensitivity) {
					i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop - o.scrollSpeed;
				}
			}

			if(!o.axis || o.axis !== "y") {
				if((i.overflowOffset.left + i.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity) {
					i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft + o.scrollSpeed;
				} else if(event.pageX - i.overflowOffset.left < o.scrollSensitivity) {
					i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft - o.scrollSpeed;
				}
			}

		} else {

			if(!o.axis || o.axis !== "x") {
				if(event.pageY - $(document).scrollTop() < o.scrollSensitivity) {
					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
				} else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity) {
					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
				}
			}

			if(!o.axis || o.axis !== "y") {
				if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity) {
					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
				} else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity) {
					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
				}
			}

		}

		if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour) {
			$.ui.ddmanager.prepareOffsets(i, event);
		}

	}
});

$.ui.plugin.add("draggable", "snap", {
	start: function() {

		var i = $(this).data("ui-draggable"),
			o = i.options;

		i.snapElements = [];

		$(o.snap.constructor !== String ? ( o.snap.items || ":data(ui-draggable)" ) : o.snap).each(function() {
			var $t = $(this),
				$o = $t.offset();
			if(this !== i.element[0]) {
				i.snapElements.push({
					item: this,
					width: $t.outerWidth(), height: $t.outerHeight(),
					top: $o.top, left: $o.left
				});
			}
		});

	},
	drag: function(event, ui) {

		var ts, bs, ls, rs, l, r, t, b, i, first,
			inst = $(this).data("ui-draggable"),
			o = inst.options,
			d = o.snapTolerance,
			x1 = ui.offset.left, x2 = x1 + inst.helperProportions.width,
			y1 = ui.offset.top, y2 = y1 + inst.helperProportions.height;

		for (i = inst.snapElements.length - 1; i >= 0; i--){

			l = inst.snapElements[i].left;
			r = l + inst.snapElements[i].width;
			t = inst.snapElements[i].top;
			b = t + inst.snapElements[i].height;

			if ( x2 < l - d || x1 > r + d || y2 < t - d || y1 > b + d || !$.contains( inst.snapElements[ i ].item.ownerDocument, inst.snapElements[ i ].item ) ) {
				if(inst.snapElements[i].snapping) {
					(inst.options.snap.release && inst.options.snap.release.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
				}
				inst.snapElements[i].snapping = false;
				continue;
			}

			if(o.snapMode !== "inner") {
				ts = Math.abs(t - y2) <= d;
				bs = Math.abs(b - y1) <= d;
				ls = Math.abs(l - x2) <= d;
				rs = Math.abs(r - x1) <= d;
				if(ts) {
					ui.position.top = inst._convertPositionTo("relative", { top: t - inst.helperProportions.height, left: 0 }).top - inst.margins.top;
				}
				if(bs) {
					ui.position.top = inst._convertPositionTo("relative", { top: b, left: 0 }).top - inst.margins.top;
				}
				if(ls) {
					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l - inst.helperProportions.width }).left - inst.margins.left;
				}
				if(rs) {
					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r }).left - inst.margins.left;
				}
			}

			first = (ts || bs || ls || rs);

			if(o.snapMode !== "outer") {
				ts = Math.abs(t - y1) <= d;
				bs = Math.abs(b - y2) <= d;
				ls = Math.abs(l - x1) <= d;
				rs = Math.abs(r - x2) <= d;
				if(ts) {
					ui.position.top = inst._convertPositionTo("relative", { top: t, left: 0 }).top - inst.margins.top;
				}
				if(bs) {
					ui.position.top = inst._convertPositionTo("relative", { top: b - inst.helperProportions.height, left: 0 }).top - inst.margins.top;
				}
				if(ls) {
					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l }).left - inst.margins.left;
				}
				if(rs) {
					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r - inst.helperProportions.width }).left - inst.margins.left;
				}
			}

			if(!inst.snapElements[i].snapping && (ts || bs || ls || rs || first)) {
				(inst.options.snap.snap && inst.options.snap.snap.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
			}
			inst.snapElements[i].snapping = (ts || bs || ls || rs || first);

		}

	}
});

$.ui.plugin.add("draggable", "stack", {
	start: function() {
		var min,
			o = this.data("ui-draggable").options,
			group = $.makeArray($(o.stack)).sort(function(a,b) {
				return (parseInt($(a).css("zIndex"),10) || 0) - (parseInt($(b).css("zIndex"),10) || 0);
			});

		if (!group.length) { return; }

		min = parseInt($(group[0]).css("zIndex"), 10) || 0;
		$(group).each(function(i) {
			$(this).css("zIndex", min + i);
		});
		this.css("zIndex", (min + group.length));
	}
});

$.ui.plugin.add("draggable", "zIndex", {
	start: function(event, ui) {
		var t = $(ui.helper), o = $(this).data("ui-draggable").options;
		if(t.css("zIndex")) {
			o._zIndex = t.css("zIndex");
		}
		t.css("zIndex", o.zIndex);
	},
	stop: function(event, ui) {
		var o = $(this).data("ui-draggable").options;
		if(o._zIndex) {
			$(ui.helper).css("zIndex", o._zIndex);
		}
	}
});

})(jQuery);
(function( $, undefined ) {

function num(v) {
	return parseInt(v, 10) || 0;
}

function isNumber(value) {
	return !isNaN(parseInt(value, 10));
}

$.widget("ui.resizable", $.ui.mouse, {
	version: "1.10.4",
	widgetEventPrefix: "resize",
	options: {
		alsoResize: false,
		animate: false,
		animateDuration: "slow",
		animateEasing: "swing",
		aspectRatio: false,
		autoHide: false,
		containment: false,
		ghost: false,
		grid: false,
		handles: "e,s,se",
		helper: false,
		maxHeight: null,
		maxWidth: null,
		minHeight: 10,
		minWidth: 10,
		// See #7960
		zIndex: 90,

		// callbacks
		resize: null,
		start: null,
		stop: null
	},
	_create: function() {

		var n, i, handle, axis, hname,
			that = this,
			o = this.options;
		this.element.addClass("ui-resizable");

		$.extend(this, {
			_aspectRatio: !!(o.aspectRatio),
			aspectRatio: o.aspectRatio,
			originalElement: this.element,
			_proportionallyResizeElements: [],
			_helper: o.helper || o.ghost || o.animate ? o.helper || "ui-resizable-helper" : null
		});

		//Wrap the element if it cannot hold child nodes
		if(this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i)) {

			//Create a wrapper element and set the wrapper to the new current internal element
			this.element.wrap(
				$("<div class='ui-wrapper' style='overflow: hidden;'></div>").css({
					position: this.element.css("position"),
					width: this.element.outerWidth(),
					height: this.element.outerHeight(),
					top: this.element.css("top"),
					left: this.element.css("left")
				})
			);

			//Overwrite the original this.element
			this.element = this.element.parent().data(
				"ui-resizable", this.element.data("ui-resizable")
			);

			this.elementIsWrapper = true;

			//Move margins to the wrapper
			this.element.css({ marginLeft: this.originalElement.css("marginLeft"), marginTop: this.originalElement.css("marginTop"), marginRight: this.originalElement.css("marginRight"), marginBottom: this.originalElement.css("marginBottom") });
			this.originalElement.css({ marginLeft: 0, marginTop: 0, marginRight: 0, marginBottom: 0});

			//Prevent Safari textarea resize
			this.originalResizeStyle = this.originalElement.css("resize");
			this.originalElement.css("resize", "none");

			//Push the actual element to our proportionallyResize internal array
			this._proportionallyResizeElements.push(this.originalElement.css({ position: "static", zoom: 1, display: "block" }));

			// avoid IE jump (hard set the margin)
			this.originalElement.css({ margin: this.originalElement.css("margin") });

			// fix handlers offset
			this._proportionallyResize();

		}

		this.handles = o.handles || (!$(".ui-resizable-handle", this.element).length ? "e,s,se" : { n: ".ui-resizable-n", e: ".ui-resizable-e", s: ".ui-resizable-s", w: ".ui-resizable-w", se: ".ui-resizable-se", sw: ".ui-resizable-sw", ne: ".ui-resizable-ne", nw: ".ui-resizable-nw" });
		if(this.handles.constructor === String) {

			if ( this.handles === "all") {
				this.handles = "n,e,s,w,se,sw,ne,nw";
			}

			n = this.handles.split(",");
			this.handles = {};

			for(i = 0; i < n.length; i++) {

				handle = $.trim(n[i]);
				hname = "ui-resizable-"+handle;
				axis = $("<div class='ui-resizable-handle " + hname + "'></div>");

				// Apply zIndex to all handles - see #7960
				axis.css({ zIndex: o.zIndex });

				//TODO : What's going on here?
				if ("se" === handle) {
					axis.addClass("ui-icon ui-icon-gripsmall-diagonal-se");
				}

				//Insert into internal handles object and append to element
				this.handles[handle] = ".ui-resizable-"+handle;
				this.element.append(axis);
			}

		}

		this._renderAxis = function(target) {

			var i, axis, padPos, padWrapper;

			target = target || this.element;

			for(i in this.handles) {

				if(this.handles[i].constructor === String) {
					this.handles[i] = $(this.handles[i], this.element).show();
				}

				//Apply pad to wrapper element, needed to fix axis position (textarea, inputs, scrolls)
				if (this.elementIsWrapper && this.originalElement[0].nodeName.match(/textarea|input|select|button/i)) {

					axis = $(this.handles[i], this.element);

					//Checking the correct pad and border
					padWrapper = /sw|ne|nw|se|n|s/.test(i) ? axis.outerHeight() : axis.outerWidth();

					//The padding type i have to apply...
					padPos = [ "padding",
						/ne|nw|n/.test(i) ? "Top" :
						/se|sw|s/.test(i) ? "Bottom" :
						/^e$/.test(i) ? "Right" : "Left" ].join("");

					target.css(padPos, padWrapper);

					this._proportionallyResize();

				}

				//TODO: What's that good for? There's not anything to be executed left
				if(!$(this.handles[i]).length) {
					continue;
				}
			}
		};

		//TODO: make renderAxis a prototype function
		this._renderAxis(this.element);

		this._handles = $(".ui-resizable-handle", this.element)
			.disableSelection();

		//Matching axis name
		this._handles.mouseover(function() {
			if (!that.resizing) {
				if (this.className) {
					axis = this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i);
				}
				//Axis, default = se
				that.axis = axis && axis[1] ? axis[1] : "se";
			}
		});

		//If we want to auto hide the elements
		if (o.autoHide) {
			this._handles.hide();
			$(this.element)
				.addClass("ui-resizable-autohide")
				.mouseenter(function() {
					if (o.disabled) {
						return;
					}
					$(this).removeClass("ui-resizable-autohide");
					that._handles.show();
				})
				.mouseleave(function(){
					if (o.disabled) {
						return;
					}
					if (!that.resizing) {
						$(this).addClass("ui-resizable-autohide");
						that._handles.hide();
					}
				});
		}

		//Initialize the mouse interaction
		this._mouseInit();

	},

	_destroy: function() {

		this._mouseDestroy();

		var wrapper,
			_destroy = function(exp) {
				$(exp).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing")
					.removeData("resizable").removeData("ui-resizable").unbind(".resizable").find(".ui-resizable-handle").remove();
			};

		//TODO: Unwrap at same DOM position
		if (this.elementIsWrapper) {
			_destroy(this.element);
			wrapper = this.element;
			this.originalElement.css({
				position: wrapper.css("position"),
				width: wrapper.outerWidth(),
				height: wrapper.outerHeight(),
				top: wrapper.css("top"),
				left: wrapper.css("left")
			}).insertAfter( wrapper );
			wrapper.remove();
		}

		this.originalElement.css("resize", this.originalResizeStyle);
		_destroy(this.originalElement);

		return this;
	},

	_mouseCapture: function(event) {
		var i, handle,
			capture = false;

		for (i in this.handles) {
			handle = $(this.handles[i])[0];
			if (handle === event.target || $.contains(handle, event.target)) {
				capture = true;
			}
		}

		return !this.options.disabled && capture;
	},

	_mouseStart: function(event) {

		var curleft, curtop, cursor,
			o = this.options,
			iniPos = this.element.position(),
			el = this.element;

		this.resizing = true;

		// bugfix for http://dev.jquery.com/ticket/1749
		if ( (/absolute/).test( el.css("position") ) ) {
			el.css({ position: "absolute", top: el.css("top"), left: el.css("left") });
		} else if (el.is(".ui-draggable")) {
			el.css({ position: "absolute", top: iniPos.top, left: iniPos.left });
		}

		this._renderProxy();

		curleft = num(this.helper.css("left"));
		curtop = num(this.helper.css("top"));

		if (o.containment) {
			curleft += $(o.containment).scrollLeft() || 0;
			curtop += $(o.containment).scrollTop() || 0;
		}

		//Store needed variables
		this.offset = this.helper.offset();
		this.position = { left: curleft, top: curtop };
		this.size = this._helper ? { width: this.helper.width(), height: this.helper.height() } : { width: el.width(), height: el.height() };
		this.originalSize = this._helper ? { width: el.outerWidth(), height: el.outerHeight() } : { width: el.width(), height: el.height() };
		this.originalPosition = { left: curleft, top: curtop };
		this.sizeDiff = { width: el.outerWidth() - el.width(), height: el.outerHeight() - el.height() };
		this.originalMousePosition = { left: event.pageX, top: event.pageY };

		//Aspect Ratio
		this.aspectRatio = (typeof o.aspectRatio === "number") ? o.aspectRatio : ((this.originalSize.width / this.originalSize.height) || 1);

		cursor = $(".ui-resizable-" + this.axis).css("cursor");
		$("body").css("cursor", cursor === "auto" ? this.axis + "-resize" : cursor);

		el.addClass("ui-resizable-resizing");
		this._propagate("start", event);
		return true;
	},

	_mouseDrag: function(event) {

		//Increase performance, avoid regex
		var data,
			el = this.helper, props = {},
			smp = this.originalMousePosition,
			a = this.axis,
			prevTop = this.position.top,
			prevLeft = this.position.left,
			prevWidth = this.size.width,
			prevHeight = this.size.height,
			dx = (event.pageX-smp.left)||0,
			dy = (event.pageY-smp.top)||0,
			trigger = this._change[a];

		if (!trigger) {
			return false;
		}

		// Calculate the attrs that will be change
		data = trigger.apply(this, [event, dx, dy]);

		// Put this in the mouseDrag handler since the user can start pressing shift while resizing
		this._updateVirtualBoundaries(event.shiftKey);
		if (this._aspectRatio || event.shiftKey) {
			data = this._updateRatio(data, event);
		}

		data = this._respectSize(data, event);

		this._updateCache(data);

		// plugins callbacks need to be called first
		this._propagate("resize", event);

		if (this.position.top !== prevTop) {
			props.top = this.position.top + "px";
		}
		if (this.position.left !== prevLeft) {
			props.left = this.position.left + "px";
		}
		if (this.size.width !== prevWidth) {
			props.width = this.size.width + "px";
		}
		if (this.size.height !== prevHeight) {
			props.height = this.size.height + "px";
		}
		el.css(props);

		if (!this._helper && this._proportionallyResizeElements.length) {
			this._proportionallyResize();
		}

		// Call the user callback if the element was resized
		if ( ! $.isEmptyObject(props) ) {
			this._trigger("resize", event, this.ui());
		}

		return false;
	},

	_mouseStop: function(event) {

		this.resizing = false;
		var pr, ista, soffseth, soffsetw, s, left, top,
			o = this.options, that = this;

		if(this._helper) {

			pr = this._proportionallyResizeElements;
			ista = pr.length && (/textarea/i).test(pr[0].nodeName);
			soffseth = ista && $.ui.hasScroll(pr[0], "left") /* TODO - jump height */ ? 0 : that.sizeDiff.height;
			soffsetw = ista ? 0 : that.sizeDiff.width;

			s = { width: (that.helper.width()  - soffsetw), height: (that.helper.height() - soffseth) };
			left = (parseInt(that.element.css("left"), 10) + (that.position.left - that.originalPosition.left)) || null;
			top = (parseInt(that.element.css("top"), 10) + (that.position.top - that.originalPosition.top)) || null;

			if (!o.animate) {
				this.element.css($.extend(s, { top: top, left: left }));
			}

			that.helper.height(that.size.height);
			that.helper.width(that.size.width);

			if (this._helper && !o.animate) {
				this._proportionallyResize();
			}
		}

		$("body").css("cursor", "auto");

		this.element.removeClass("ui-resizable-resizing");

		this._propagate("stop", event);

		if (this._helper) {
			this.helper.remove();
		}

		return false;

	},

	_updateVirtualBoundaries: function(forceAspectRatio) {
		var pMinWidth, pMaxWidth, pMinHeight, pMaxHeight, b,
			o = this.options;

		b = {
			minWidth: isNumber(o.minWidth) ? o.minWidth : 0,
			maxWidth: isNumber(o.maxWidth) ? o.maxWidth : Infinity,
			minHeight: isNumber(o.minHeight) ? o.minHeight : 0,
			maxHeight: isNumber(o.maxHeight) ? o.maxHeight : Infinity
		};

		if(this._aspectRatio || forceAspectRatio) {
			// We want to create an enclosing box whose aspect ration is the requested one
			// First, compute the "projected" size for each dimension based on the aspect ratio and other dimension
			pMinWidth = b.minHeight * this.aspectRatio;
			pMinHeight = b.minWidth / this.aspectRatio;
			pMaxWidth = b.maxHeight * this.aspectRatio;
			pMaxHeight = b.maxWidth / this.aspectRatio;

			if(pMinWidth > b.minWidth) {
				b.minWidth = pMinWidth;
			}
			if(pMinHeight > b.minHeight) {
				b.minHeight = pMinHeight;
			}
			if(pMaxWidth < b.maxWidth) {
				b.maxWidth = pMaxWidth;
			}
			if(pMaxHeight < b.maxHeight) {
				b.maxHeight = pMaxHeight;
			}
		}
		this._vBoundaries = b;
	},

	_updateCache: function(data) {
		this.offset = this.helper.offset();
		if (isNumber(data.left)) {
			this.position.left = data.left;
		}
		if (isNumber(data.top)) {
			this.position.top = data.top;
		}
		if (isNumber(data.height)) {
			this.size.height = data.height;
		}
		if (isNumber(data.width)) {
			this.size.width = data.width;
		}
	},

	_updateRatio: function( data ) {

		var cpos = this.position,
			csize = this.size,
			a = this.axis;

		if (isNumber(data.height)) {
			data.width = (data.height * this.aspectRatio);
		} else if (isNumber(data.width)) {
			data.height = (data.width / this.aspectRatio);
		}

		if (a === "sw") {
			data.left = cpos.left + (csize.width - data.width);
			data.top = null;
		}
		if (a === "nw") {
			data.top = cpos.top + (csize.height - data.height);
			data.left = cpos.left + (csize.width - data.width);
		}

		return data;
	},

	_respectSize: function( data ) {

		var o = this._vBoundaries,
			a = this.axis,
			ismaxw = isNumber(data.width) && o.maxWidth && (o.maxWidth < data.width), ismaxh = isNumber(data.height) && o.maxHeight && (o.maxHeight < data.height),
			isminw = isNumber(data.width) && o.minWidth && (o.minWidth > data.width), isminh = isNumber(data.height) && o.minHeight && (o.minHeight > data.height),
			dw = this.originalPosition.left + this.originalSize.width,
			dh = this.position.top + this.size.height,
			cw = /sw|nw|w/.test(a), ch = /nw|ne|n/.test(a);
		if (isminw) {
			data.width = o.minWidth;
		}
		if (isminh) {
			data.height = o.minHeight;
		}
		if (ismaxw) {
			data.width = o.maxWidth;
		}
		if (ismaxh) {
			data.height = o.maxHeight;
		}

		if (isminw && cw) {
			data.left = dw - o.minWidth;
		}
		if (ismaxw && cw) {
			data.left = dw - o.maxWidth;
		}
		if (isminh && ch) {
			data.top = dh - o.minHeight;
		}
		if (ismaxh && ch) {
			data.top = dh - o.maxHeight;
		}

		// fixing jump error on top/left - bug #2330
		if (!data.width && !data.height && !data.left && data.top) {
			data.top = null;
		} else if (!data.width && !data.height && !data.top && data.left) {
			data.left = null;
		}

		return data;
	},

	_proportionallyResize: function() {

		if (!this._proportionallyResizeElements.length) {
			return;
		}

		var i, j, borders, paddings, prel,
			element = this.helper || this.element;

		for ( i=0; i < this._proportionallyResizeElements.length; i++) {

			prel = this._proportionallyResizeElements[i];

			if (!this.borderDif) {
				this.borderDif = [];
				borders = [prel.css("borderTopWidth"), prel.css("borderRightWidth"), prel.css("borderBottomWidth"), prel.css("borderLeftWidth")];
				paddings = [prel.css("paddingTop"), prel.css("paddingRight"), prel.css("paddingBottom"), prel.css("paddingLeft")];

				for ( j = 0; j < borders.length; j++ ) {
					this.borderDif[ j ] = ( parseInt( borders[ j ], 10 ) || 0 ) + ( parseInt( paddings[ j ], 10 ) || 0 );
				}
			}

			prel.css({
				height: (element.height() - this.borderDif[0] - this.borderDif[2]) || 0,
				width: (element.width() - this.borderDif[1] - this.borderDif[3]) || 0
			});

		}

	},

	_renderProxy: function() {

		var el = this.element, o = this.options;
		this.elementOffset = el.offset();

		if(this._helper) {

			this.helper = this.helper || $("<div style='overflow:hidden;'></div>");

			this.helper.addClass(this._helper).css({
				width: this.element.outerWidth() - 1,
				height: this.element.outerHeight() - 1,
				position: "absolute",
				left: this.elementOffset.left +"px",
				top: this.elementOffset.top +"px",
				zIndex: ++o.zIndex //TODO: Don't modify option
			});

			this.helper
				.appendTo("body")
				.disableSelection();

		} else {
			this.helper = this.element;
		}

	},

	_change: {
		e: function(event, dx) {
			return { width: this.originalSize.width + dx };
		},
		w: function(event, dx) {
			var cs = this.originalSize, sp = this.originalPosition;
			return { left: sp.left + dx, width: cs.width - dx };
		},
		n: function(event, dx, dy) {
			var cs = this.originalSize, sp = this.originalPosition;
			return { top: sp.top + dy, height: cs.height - dy };
		},
		s: function(event, dx, dy) {
			return { height: this.originalSize.height + dy };
		},
		se: function(event, dx, dy) {
			return $.extend(this._change.s.apply(this, arguments), this._change.e.apply(this, [event, dx, dy]));
		},
		sw: function(event, dx, dy) {
			return $.extend(this._change.s.apply(this, arguments), this._change.w.apply(this, [event, dx, dy]));
		},
		ne: function(event, dx, dy) {
			return $.extend(this._change.n.apply(this, arguments), this._change.e.apply(this, [event, dx, dy]));
		},
		nw: function(event, dx, dy) {
			return $.extend(this._change.n.apply(this, arguments), this._change.w.apply(this, [event, dx, dy]));
		}
	},

	_propagate: function(n, event) {
		$.ui.plugin.call(this, n, [event, this.ui()]);
		(n !== "resize" && this._trigger(n, event, this.ui()));
	},

	plugins: {},

	ui: function() {
		return {
			originalElement: this.originalElement,
			element: this.element,
			helper: this.helper,
			position: this.position,
			size: this.size,
			originalSize: this.originalSize,
			originalPosition: this.originalPosition
		};
	}

});

/*
 * Resizable Extensions
 */

$.ui.plugin.add("resizable", "animate", {

	stop: function( event ) {
		var that = $(this).data("ui-resizable"),
			o = that.options,
			pr = that._proportionallyResizeElements,
			ista = pr.length && (/textarea/i).test(pr[0].nodeName),
			soffseth = ista && $.ui.hasScroll(pr[0], "left") /* TODO - jump height */ ? 0 : that.sizeDiff.height,
			soffsetw = ista ? 0 : that.sizeDiff.width,
			style = { width: (that.size.width - soffsetw), height: (that.size.height - soffseth) },
			left = (parseInt(that.element.css("left"), 10) + (that.position.left - that.originalPosition.left)) || null,
			top = (parseInt(that.element.css("top"), 10) + (that.position.top - that.originalPosition.top)) || null;

		that.element.animate(
			$.extend(style, top && left ? { top: top, left: left } : {}), {
				duration: o.animateDuration,
				easing: o.animateEasing,
				step: function() {

					var data = {
						width: parseInt(that.element.css("width"), 10),
						height: parseInt(that.element.css("height"), 10),
						top: parseInt(that.element.css("top"), 10),
						left: parseInt(that.element.css("left"), 10)
					};

					if (pr && pr.length) {
						$(pr[0]).css({ width: data.width, height: data.height });
					}

					// propagating resize, and updating values for each animation step
					that._updateCache(data);
					that._propagate("resize", event);

				}
			}
		);
	}

});

$.ui.plugin.add("resizable", "containment", {

	start: function() {
		var element, p, co, ch, cw, width, height,
			that = $(this).data("ui-resizable"),
			o = that.options,
			el = that.element,
			oc = o.containment,
			ce = (oc instanceof $) ? oc.get(0) : (/parent/.test(oc)) ? el.parent().get(0) : oc;

		if (!ce) {
			return;
		}

		that.containerElement = $(ce);

		if (/document/.test(oc) || oc === document) {
			that.containerOffset = { left: 0, top: 0 };
			that.containerPosition = { left: 0, top: 0 };

			that.parentData = {
				element: $(document), left: 0, top: 0,
				width: $(document).width(), height: $(document).height() || document.body.parentNode.scrollHeight
			};
		}

		// i'm a node, so compute top, left, right, bottom
		else {
			element = $(ce);
			p = [];
			$([ "Top", "Right", "Left", "Bottom" ]).each(function(i, name) { p[i] = num(element.css("padding" + name)); });

			that.containerOffset = element.offset();
			that.containerPosition = element.position();
			that.containerSize = { height: (element.innerHeight() - p[3]), width: (element.innerWidth() - p[1]) };

			co = that.containerOffset;
			ch = that.containerSize.height;
			cw = that.containerSize.width;
			width = ($.ui.hasScroll(ce, "left") ? ce.scrollWidth : cw );
			height = ($.ui.hasScroll(ce) ? ce.scrollHeight : ch);

			that.parentData = {
				element: ce, left: co.left, top: co.top, width: width, height: height
			};
		}
	},

	resize: function( event ) {
		var woset, hoset, isParent, isOffsetRelative,
			that = $(this).data("ui-resizable"),
			o = that.options,
			co = that.containerOffset, cp = that.position,
			pRatio = that._aspectRatio || event.shiftKey,
			cop = { top:0, left:0 }, ce = that.containerElement;

		if (ce[0] !== document && (/static/).test(ce.css("position"))) {
			cop = co;
		}

		if (cp.left < (that._helper ? co.left : 0)) {
			that.size.width = that.size.width + (that._helper ? (that.position.left - co.left) : (that.position.left - cop.left));
			if (pRatio) {
				that.size.height = that.size.width / that.aspectRatio;
			}
			that.position.left = o.helper ? co.left : 0;
		}

		if (cp.top < (that._helper ? co.top : 0)) {
			that.size.height = that.size.height + (that._helper ? (that.position.top - co.top) : that.position.top);
			if (pRatio) {
				that.size.width = that.size.height * that.aspectRatio;
			}
			that.position.top = that._helper ? co.top : 0;
		}

		that.offset.left = that.parentData.left+that.position.left;
		that.offset.top = that.parentData.top+that.position.top;

		woset = Math.abs( (that._helper ? that.offset.left - cop.left : (that.offset.left - cop.left)) + that.sizeDiff.width );
		hoset = Math.abs( (that._helper ? that.offset.top - cop.top : (that.offset.top - co.top)) + that.sizeDiff.height );

		isParent = that.containerElement.get(0) === that.element.parent().get(0);
		isOffsetRelative = /relative|absolute/.test(that.containerElement.css("position"));

		if ( isParent && isOffsetRelative ) {
			woset -= Math.abs( that.parentData.left );
		}

		if (woset + that.size.width >= that.parentData.width) {
			that.size.width = that.parentData.width - woset;
			if (pRatio) {
				that.size.height = that.size.width / that.aspectRatio;
			}
		}

		if (hoset + that.size.height >= that.parentData.height) {
			that.size.height = that.parentData.height - hoset;
			if (pRatio) {
				that.size.width = that.size.height * that.aspectRatio;
			}
		}
	},

	stop: function(){
		var that = $(this).data("ui-resizable"),
			o = that.options,
			co = that.containerOffset,
			cop = that.containerPosition,
			ce = that.containerElement,
			helper = $(that.helper),
			ho = helper.offset(),
			w = helper.outerWidth() - that.sizeDiff.width,
			h = helper.outerHeight() - that.sizeDiff.height;

		if (that._helper && !o.animate && (/relative/).test(ce.css("position"))) {
			$(this).css({ left: ho.left - cop.left - co.left, width: w, height: h });
		}

		if (that._helper && !o.animate && (/static/).test(ce.css("position"))) {
			$(this).css({ left: ho.left - cop.left - co.left, width: w, height: h });
		}

	}
});

$.ui.plugin.add("resizable", "alsoResize", {

	start: function () {
		var that = $(this).data("ui-resizable"),
			o = that.options,
			_store = function (exp) {
				$(exp).each(function() {
					var el = $(this);
					el.data("ui-resizable-alsoresize", {
						width: parseInt(el.width(), 10), height: parseInt(el.height(), 10),
						left: parseInt(el.css("left"), 10), top: parseInt(el.css("top"), 10)
					});
				});
			};

		if (typeof(o.alsoResize) === "object" && !o.alsoResize.parentNode) {
			if (o.alsoResize.length) { o.alsoResize = o.alsoResize[0]; _store(o.alsoResize); }
			else { $.each(o.alsoResize, function (exp) { _store(exp); }); }
		}else{
			_store(o.alsoResize);
		}
	},

	resize: function (event, ui) {
		var that = $(this).data("ui-resizable"),
			o = that.options,
			os = that.originalSize,
			op = that.originalPosition,
			delta = {
				height: (that.size.height - os.height) || 0, width: (that.size.width - os.width) || 0,
				top: (that.position.top - op.top) || 0, left: (that.position.left - op.left) || 0
			},

			_alsoResize = function (exp, c) {
				$(exp).each(function() {
					var el = $(this), start = $(this).data("ui-resizable-alsoresize"), style = {},
						css = c && c.length ? c : el.parents(ui.originalElement[0]).length ? ["width", "height"] : ["width", "height", "top", "left"];

					$.each(css, function (i, prop) {
						var sum = (start[prop]||0) + (delta[prop]||0);
						if (sum && sum >= 0) {
							style[prop] = sum || null;
						}
					});

					el.css(style);
				});
			};

		if (typeof(o.alsoResize) === "object" && !o.alsoResize.nodeType) {
			$.each(o.alsoResize, function (exp, c) { _alsoResize(exp, c); });
		}else{
			_alsoResize(o.alsoResize);
		}
	},

	stop: function () {
		$(this).removeData("resizable-alsoresize");
	}
});

$.ui.plugin.add("resizable", "ghost", {

	start: function() {

		var that = $(this).data("ui-resizable"), o = that.options, cs = that.size;

		that.ghost = that.originalElement.clone();
		that.ghost
			.css({ opacity: 0.25, display: "block", position: "relative", height: cs.height, width: cs.width, margin: 0, left: 0, top: 0 })
			.addClass("ui-resizable-ghost")
			.addClass(typeof o.ghost === "string" ? o.ghost : "");

		that.ghost.appendTo(that.helper);

	},

	resize: function(){
		var that = $(this).data("ui-resizable");
		if (that.ghost) {
			that.ghost.css({ position: "relative", height: that.size.height, width: that.size.width });
		}
	},

	stop: function() {
		var that = $(this).data("ui-resizable");
		if (that.ghost && that.helper) {
			that.helper.get(0).removeChild(that.ghost.get(0));
		}
	}

});

$.ui.plugin.add("resizable", "grid", {

	resize: function() {
		var that = $(this).data("ui-resizable"),
			o = that.options,
			cs = that.size,
			os = that.originalSize,
			op = that.originalPosition,
			a = that.axis,
			grid = typeof o.grid === "number" ? [o.grid, o.grid] : o.grid,
			gridX = (grid[0]||1),
			gridY = (grid[1]||1),
			ox = Math.round((cs.width - os.width) / gridX) * gridX,
			oy = Math.round((cs.height - os.height) / gridY) * gridY,
			newWidth = os.width + ox,
			newHeight = os.height + oy,
			isMaxWidth = o.maxWidth && (o.maxWidth < newWidth),
			isMaxHeight = o.maxHeight && (o.maxHeight < newHeight),
			isMinWidth = o.minWidth && (o.minWidth > newWidth),
			isMinHeight = o.minHeight && (o.minHeight > newHeight);

		o.grid = grid;

		if (isMinWidth) {
			newWidth = newWidth + gridX;
		}
		if (isMinHeight) {
			newHeight = newHeight + gridY;
		}
		if (isMaxWidth) {
			newWidth = newWidth - gridX;
		}
		if (isMaxHeight) {
			newHeight = newHeight - gridY;
		}

		if (/^(se|s|e)$/.test(a)) {
			that.size.width = newWidth;
			that.size.height = newHeight;
		} else if (/^(ne)$/.test(a)) {
			that.size.width = newWidth;
			that.size.height = newHeight;
			that.position.top = op.top - oy;
		} else if (/^(sw)$/.test(a)) {
			that.size.width = newWidth;
			that.size.height = newHeight;
			that.position.left = op.left - ox;
		} else {
			if ( newHeight - gridY > 0 ) {
				that.size.height = newHeight;
				that.position.top = op.top - oy;
			} else {
				that.size.height = gridY;
				that.position.top = op.top + os.height - gridY;
			}
			if ( newWidth - gridX > 0 ) {
				that.size.width = newWidth;
				that.position.left = op.left - ox;
			} else {
				that.size.width = gridX;
				that.position.left = op.left + os.width - gridX;
			}
		}
	}

});

})(jQuery);
(function( $, undefined ) {

$.widget( "ui.autocomplete", {
	version: "1.10.4",
	defaultElement: "<input>",
	options: {
		appendTo: null,
		autoFocus: false,
		delay: 300,
		minLength: 1,
		position: {
			my: "left top",
			at: "left bottom",
			collision: "none"
		},
		source: null,

		// callbacks
		change: null,
		close: null,
		focus: null,
		open: null,
		response: null,
		search: null,
		select: null
	},

	requestIndex: 0,
	pending: 0,

	_create: function() {
		// Some browsers only repeat keydown events, not keypress events,
		// so we use the suppressKeyPress flag to determine if we've already
		// handled the keydown event. #7269
		// Unfortunately the code for & in keypress is the same as the up arrow,
		// so we use the suppressKeyPressRepeat flag to avoid handling keypress
		// events when we know the keydown event was used to modify the
		// search term. #7799
		var suppressKeyPress, suppressKeyPressRepeat, suppressInput,
			nodeName = this.element[0].nodeName.toLowerCase(),
			isTextarea = nodeName === "textarea",
			isInput = nodeName === "input";

		this.isMultiLine =
			// Textareas are always multi-line
			isTextarea ? true :
			// Inputs are always single-line, even if inside a contentEditable element
			// IE also treats inputs as contentEditable
			isInput ? false :
			// All other element types are determined by whether or not they're contentEditable
			this.element.prop( "isContentEditable" );

		this.valueMethod = this.element[ isTextarea || isInput ? "val" : "text" ];
		this.isNewMenu = true;

		this.element
			.addClass( "ui-autocomplete-input" )
			.attr( "autocomplete", "off" );

		this._on( this.element, {
			keydown: function( event ) {
				if ( this.element.prop( "readOnly" ) ) {
					suppressKeyPress = true;
					suppressInput = true;
					suppressKeyPressRepeat = true;
					return;
				}

				suppressKeyPress = false;
				suppressInput = false;
				suppressKeyPressRepeat = false;
				var keyCode = $.ui.keyCode;
				switch( event.keyCode ) {
				case keyCode.PAGE_UP:
					suppressKeyPress = true;
					this._move( "previousPage", event );
					break;
				case keyCode.PAGE_DOWN:
					suppressKeyPress = true;
					this._move( "nextPage", event );
					break;
				case keyCode.UP:
					suppressKeyPress = true;
					this._keyEvent( "previous", event );
					break;
				case keyCode.DOWN:
					suppressKeyPress = true;
					this._keyEvent( "next", event );
					break;
				case keyCode.ENTER:
				case keyCode.NUMPAD_ENTER:
					// when menu is open and has focus
					if ( this.menu.active ) {
						// #6055 - Opera still allows the keypress to occur
						// which causes forms to submit
						suppressKeyPress = true;
						event.preventDefault();
						this.menu.select( event );
					}
					break;
				case keyCode.TAB:
					if ( this.menu.active ) {
						this.menu.select( event );
					}
					break;
				case keyCode.ESCAPE:
					if ( this.menu.element.is( ":visible" ) ) {
						this._value( this.term );
						this.close( event );
						// Different browsers have different default behavior for escape
						// Single press can mean undo or clear
						// Double press in IE means clear the whole form
						event.preventDefault();
					}
					break;
				default:
					suppressKeyPressRepeat = true;
					// search timeout should be triggered before the input value is changed
					this._searchTimeout( event );
					break;
				}
			},
			keypress: function( event ) {
				if ( suppressKeyPress ) {
					suppressKeyPress = false;
					if ( !this.isMultiLine || this.menu.element.is( ":visible" ) ) {
						event.preventDefault();
					}
					return;
				}
				if ( suppressKeyPressRepeat ) {
					return;
				}

				// replicate some key handlers to allow them to repeat in Firefox and Opera
				var keyCode = $.ui.keyCode;
				switch( event.keyCode ) {
				case keyCode.PAGE_UP:
					this._move( "previousPage", event );
					break;
				case keyCode.PAGE_DOWN:
					this._move( "nextPage", event );
					break;
				case keyCode.UP:
					this._keyEvent( "previous", event );
					break;
				case keyCode.DOWN:
					this._keyEvent( "next", event );
					break;
				}
			},
			input: function( event ) {
				if ( suppressInput ) {
					suppressInput = false;
					event.preventDefault();
					return;
				}
				this._searchTimeout( event );
			},
			focus: function() {
				this.selectedItem = null;
				this.previous = this._value();
			},
			blur: function( event ) {
				if ( this.cancelBlur ) {
					delete this.cancelBlur;
					return;
				}

				clearTimeout( this.searching );
				this.close( event );
				this._change( event );
			}
		});

		this._initSource();
		this.menu = $( "<ul>" )
			.addClass( "ui-autocomplete ui-front" )
			.appendTo( this._appendTo() )
			.menu({
				// disable ARIA support, the live region takes care of that
				role: null
			})
			.hide()
			.data( "ui-menu" );

		this._on( this.menu.element, {
			mousedown: function( event ) {
				// prevent moving focus out of the text field
				event.preventDefault();

				// IE doesn't prevent moving focus even with event.preventDefault()
				// so we set a flag to know when we should ignore the blur event
				this.cancelBlur = true;
				this._delay(function() {
					delete this.cancelBlur;
				});

				// clicking on the scrollbar causes focus to shift to the body
				// but we can't detect a mouseup or a click immediately afterward
				// so we have to track the next mousedown and close the menu if
				// the user clicks somewhere outside of the autocomplete
				var menuElement = this.menu.element[ 0 ];
				if ( !$( event.target ).closest( ".ui-menu-item" ).length ) {
					this._delay(function() {
						var that = this;
						this.document.one( "mousedown", function( event ) {
							if ( event.target !== that.element[ 0 ] &&
									event.target !== menuElement &&
									!$.contains( menuElement, event.target ) ) {
								that.close();
							}
						});
					});
				}
			},
			menufocus: function( event, ui ) {
				// support: Firefox
				// Prevent accidental activation of menu items in Firefox (#7024 #9118)
				if ( this.isNewMenu ) {
					this.isNewMenu = false;
					if ( event.originalEvent && /^mouse/.test( event.originalEvent.type ) ) {
						this.menu.blur();

						this.document.one( "mousemove", function() {
							$( event.target ).trigger( event.originalEvent );
						});

						return;
					}
				}

				var item = ui.item.data( "ui-autocomplete-item" );
				if ( false !== this._trigger( "focus", event, { item: item } ) ) {
					// use value to match what will end up in the input, if it was a key event
					if ( event.originalEvent && /^key/.test( event.originalEvent.type ) ) {
						this._value( item.value );
					}
				} else {
					// Normally the input is populated with the item's value as the
					// menu is navigated, causing screen readers to notice a change and
					// announce the item. Since the focus event was canceled, this doesn't
					// happen, so we update the live region so that screen readers can
					// still notice the change and announce it.
					this.liveRegion.text( item.value );
				}
			},
			menuselect: function( event, ui ) {
				var item = ui.item.data( "ui-autocomplete-item" ),
					previous = this.previous;

				// only trigger when focus was lost (click on menu)
				if ( this.element[0] !== this.document[0].activeElement ) {
					this.element.focus();
					this.previous = previous;
					// #6109 - IE triggers two focus events and the second
					// is asynchronous, so we need to reset the previous
					// term synchronously and asynchronously :-(
					this._delay(function() {
						this.previous = previous;
						this.selectedItem = item;
					});
				}

				if ( false !== this._trigger( "select", event, { item: item } ) ) {
					this._value( item.value );
				}
				// reset the term after the select event
				// this allows custom select handling to work properly
				this.term = this._value();

				this.close( event );
				this.selectedItem = item;
			}
		});

		this.liveRegion = $( "<span>", {
				role: "status",
				"aria-live": "polite"
			})
			.addClass( "ui-helper-hidden-accessible" )
			.insertBefore( this.element );

		// turning off autocomplete prevents the browser from remembering the
		// value when navigating through history, so we re-enable autocomplete
		// if the page is unloaded before the widget is destroyed. #7790
		this._on( this.window, {
			beforeunload: function() {
				this.element.removeAttr( "autocomplete" );
			}
		});
	},

	_destroy: function() {
		clearTimeout( this.searching );
		this.element
			.removeClass( "ui-autocomplete-input" )
			.removeAttr( "autocomplete" );
		this.menu.element.remove();
		this.liveRegion.remove();
	},

	_setOption: function( key, value ) {
		this._super( key, value );
		if ( key === "source" ) {
			this._initSource();
		}
		if ( key === "appendTo" ) {
			this.menu.element.appendTo( this._appendTo() );
		}
		if ( key === "disabled" && value && this.xhr ) {
			this.xhr.abort();
		}
	},

	_appendTo: function() {
		var element = this.options.appendTo;

		if ( element ) {
			element = element.jquery || element.nodeType ?
				$( element ) :
				this.document.find( element ).eq( 0 );
		}

		if ( !element ) {
			element = this.element.closest( ".ui-front" );
		}

		if ( !element.length ) {
			element = this.document[0].body;
		}

		return element;
	},

	_initSource: function() {
		var array, url,
			that = this;
		if ( $.isArray(this.options.source) ) {
			array = this.options.source;
			this.source = function( request, response ) {
				response( $.ui.autocomplete.filter( array, request.term ) );
			};
		} else if ( typeof this.options.source === "string" ) {
			url = this.options.source;
			this.source = function( request, response ) {
				if ( that.xhr ) {
					that.xhr.abort();
				}
				that.xhr = $.ajax({
					url: url,
					data: request,
					dataType: "json",
					success: function( data ) {
						response( data );
					},
					error: function() {
						response( [] );
					}
				});
			};
		} else {
			this.source = this.options.source;
		}
	},

	_searchTimeout: function( event ) {
		clearTimeout( this.searching );
		this.searching = this._delay(function() {
			// only search if the value has changed
			if ( this.term !== this._value() ) {
				this.selectedItem = null;
				this.search( null, event );
			}
		}, this.options.delay );
	},

	search: function( value, event ) {
		value = value != null ? value : this._value();

		// always save the actual value, not the one passed as an argument
		this.term = this._value();

		if ( value.length < this.options.minLength ) {
			return this.close( event );
		}

		if ( this._trigger( "search", event ) === false ) {
			return;
		}

		return this._search( value );
	},

	_search: function( value ) {
		this.pending++;
		this.element.addClass( "ui-autocomplete-loading" );
		this.cancelSearch = false;

		this.source( { term: value }, this._response() );
	},

	_response: function() {
		var index = ++this.requestIndex;

		return $.proxy(function( content ) {
			if ( index === this.requestIndex ) {
				this.__response( content );
			}

			this.pending--;
			if ( !this.pending ) {
				this.element.removeClass( "ui-autocomplete-loading" );
			}
		}, this );
	},

	__response: function( content ) {
		if ( content ) {
			content = this._normalize( content );
		}
		this._trigger( "response", null, { content: content } );
		if ( !this.options.disabled && content && content.length && !this.cancelSearch ) {
			this._suggest( content );
			this._trigger( "open" );
		} else {
			// use ._close() instead of .close() so we don't cancel future searches
			this._close();
		}
	},

	close: function( event ) {
		this.cancelSearch = true;
		this._close( event );
	},

	_close: function( event ) {
		if ( this.menu.element.is( ":visible" ) ) {
			this.menu.element.hide();
			this.menu.blur();
			this.isNewMenu = true;
			this._trigger( "close", event );
		}
	},

	_change: function( event ) {
		if ( this.previous !== this._value() ) {
			this._trigger( "change", event, { item: this.selectedItem } );
		}
	},

	_normalize: function( items ) {
		// assume all items have the right format when the first item is complete
		if ( items.length && items[0].label && items[0].value ) {
			return items;
		}
		return $.map( items, function( item ) {
			if ( typeof item === "string" ) {
				return {
					label: item,
					value: item
				};
			}
			return $.extend({
				label: item.label || item.value,
				value: item.value || item.label
			}, item );
		});
	},

	_suggest: function( items ) {
		var ul = this.menu.element.empty();
		this._renderMenu( ul, items );
		this.isNewMenu = true;
		this.menu.refresh();

		// size and position menu
		ul.show();
		this._resizeMenu();
		ul.position( $.extend({
			of: this.element
		}, this.options.position ));

		if ( this.options.autoFocus ) {
			this.menu.next();
		}
	},

	_resizeMenu: function() {
		var ul = this.menu.element;
		ul.outerWidth( Math.max(
			// Firefox wraps long text (possibly a rounding bug)
			// so we add 1px to avoid the wrapping (#7513)
			ul.width( "" ).outerWidth() + 1,
			this.element.outerWidth()
		) );
	},

	_renderMenu: function( ul, items ) {
		var that = this;
		$.each( items, function( index, item ) {
			that._renderItemData( ul, item );
		});
	},

	_renderItemData: function( ul, item ) {
		return this._renderItem( ul, item ).data( "ui-autocomplete-item", item );
	},

	_renderItem: function( ul, item ) {
		return $( "<li>" )
			.append( $( "<a>" ).text( item.label ) )
			.appendTo( ul );
	},

	_move: function( direction, event ) {
		if ( !this.menu.element.is( ":visible" ) ) {
			this.search( null, event );
			return;
		}
		if ( this.menu.isFirstItem() && /^previous/.test( direction ) ||
				this.menu.isLastItem() && /^next/.test( direction ) ) {
			this._value( this.term );
			this.menu.blur();
			return;
		}
		this.menu[ direction ]( event );
	},

	widget: function() {
		return this.menu.element;
	},

	_value: function() {
		return this.valueMethod.apply( this.element, arguments );
	},

	_keyEvent: function( keyEvent, event ) {
		if ( !this.isMultiLine || this.menu.element.is( ":visible" ) ) {
			this._move( keyEvent, event );

			// prevents moving cursor to beginning/end of the text field in some browsers
			event.preventDefault();
		}
	}
});

$.extend( $.ui.autocomplete, {
	escapeRegex: function( value ) {
		return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
	},
	filter: function(array, term) {
		var matcher = new RegExp( $.ui.autocomplete.escapeRegex(term), "i" );
		return $.grep( array, function(value) {
			return matcher.test( value.label || value.value || value );
		});
	}
});


// live region extension, adding a `messages` option
// NOTE: This is an experimental API. We are still investigating
// a full solution for string manipulation and internationalization.
$.widget( "ui.autocomplete", $.ui.autocomplete, {
	options: {
		messages: {
			noResults: "No search results.",
			results: function( amount ) {
				return amount + ( amount > 1 ? " results are" : " result is" ) +
					" available, use up and down arrow keys to navigate.";
			}
		}
	},

	__response: function( content ) {
		var message;
		this._superApply( arguments );
		if ( this.options.disabled || this.cancelSearch ) {
			return;
		}
		if ( content && content.length ) {
			message = this.options.messages.results( content.length );
		} else {
			message = this.options.messages.noResults;
		}
		this.liveRegion.text( message );
	}
});

}( jQuery ));
(function( $, undefined ) {

var lastActive,
	baseClasses = "ui-button ui-widget ui-state-default ui-corner-all",
	typeClasses = "ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon-primary ui-button-text-icon-secondary ui-button-text-only",
	formResetHandler = function() {
		var form = $( this );
		setTimeout(function() {
			form.find( ":ui-button" ).button( "refresh" );
		}, 1 );
	},
	radioGroup = function( radio ) {
		var name = radio.name,
			form = radio.form,
			radios = $( [] );
		if ( name ) {
			name = name.replace( /'/g, "\\'" );
			if ( form ) {
				radios = $( form ).find( "[name='" + name + "']" );
			} else {
				radios = $( "[name='" + name + "']", radio.ownerDocument )
					.filter(function() {
						return !this.form;
					});
			}
		}
		return radios;
	};

$.widget( "ui.button", {
	version: "1.10.4",
	defaultElement: "<button>",
	options: {
		disabled: null,
		text: true,
		label: null,
		icons: {
			primary: null,
			secondary: null
		}
	},
	_create: function() {
		this.element.closest( "form" )
			.unbind( "reset" + this.eventNamespace )
			.bind( "reset" + this.eventNamespace, formResetHandler );

		if ( typeof this.options.disabled !== "boolean" ) {
			this.options.disabled = !!this.element.prop( "disabled" );
		} else {
			this.element.prop( "disabled", this.options.disabled );
		}

		this._determineButtonType();
		this.hasTitle = !!this.buttonElement.attr( "title" );

		var that = this,
			options = this.options,
			toggleButton = this.type === "checkbox" || this.type === "radio",
			activeClass = !toggleButton ? "ui-state-active" : "";

		if ( options.label === null ) {
			options.label = (this.type === "input" ? this.buttonElement.val() : this.buttonElement.html());
		}

		this._hoverable( this.buttonElement );

		this.buttonElement
			.addClass( baseClasses )
			.attr( "role", "button" )
			.bind( "mouseenter" + this.eventNamespace, function() {
				if ( options.disabled ) {
					return;
				}
				if ( this === lastActive ) {
					$( this ).addClass( "ui-state-active" );
				}
			})
			.bind( "mouseleave" + this.eventNamespace, function() {
				if ( options.disabled ) {
					return;
				}
				$( this ).removeClass( activeClass );
			})
			.bind( "click" + this.eventNamespace, function( event ) {
				if ( options.disabled ) {
					event.preventDefault();
					event.stopImmediatePropagation();
				}
			});

		// Can't use _focusable() because the element that receives focus
		// and the element that gets the ui-state-focus class are different
		this._on({
			focus: function() {
				this.buttonElement.addClass( "ui-state-focus" );
			},
			blur: function() {
				this.buttonElement.removeClass( "ui-state-focus" );
			}
		});

		if ( toggleButton ) {
			this.element.bind( "change" + this.eventNamespace, function() {
				that.refresh();
			});
		}

		if ( this.type === "checkbox" ) {
			this.buttonElement.bind( "click" + this.eventNamespace, function() {
				if ( options.disabled ) {
					return false;
				}
			});
		} else if ( this.type === "radio" ) {
			this.buttonElement.bind( "click" + this.eventNamespace, function() {
				if ( options.disabled ) {
					return false;
				}
				$( this ).addClass( "ui-state-active" );
				that.buttonElement.attr( "aria-pressed", "true" );

				var radio = that.element[ 0 ];
				radioGroup( radio )
					.not( radio )
					.map(function() {
						return $( this ).button( "widget" )[ 0 ];
					})
					.removeClass( "ui-state-active" )
					.attr( "aria-pressed", "false" );
			});
		} else {
			this.buttonElement
				.bind( "mousedown" + this.eventNamespace, function() {
					if ( options.disabled ) {
						return false;
					}
					$( this ).addClass( "ui-state-active" );
					lastActive = this;
					that.document.one( "mouseup", function() {
						lastActive = null;
					});
				})
				.bind( "mouseup" + this.eventNamespace, function() {
					if ( options.disabled ) {
						return false;
					}
					$( this ).removeClass( "ui-state-active" );
				})
				.bind( "keydown" + this.eventNamespace, function(event) {
					if ( options.disabled ) {
						return false;
					}
					if ( event.keyCode === $.ui.keyCode.SPACE || event.keyCode === $.ui.keyCode.ENTER ) {
						$( this ).addClass( "ui-state-active" );
					}
				})
				// see #8559, we bind to blur here in case the button element loses
				// focus between keydown and keyup, it would be left in an "active" state
				.bind( "keyup" + this.eventNamespace + " blur" + this.eventNamespace, function() {
					$( this ).removeClass( "ui-state-active" );
				});

			if ( this.buttonElement.is("a") ) {
				this.buttonElement.keyup(function(event) {
					if ( event.keyCode === $.ui.keyCode.SPACE ) {
						// TODO pass through original event correctly (just as 2nd argument doesn't work)
						$( this ).click();
					}
				});
			}
		}

		// TODO: pull out $.Widget's handling for the disabled option into
		// $.Widget.prototype._setOptionDisabled so it's easy to proxy and can
		// be overridden by individual plugins
		this._setOption( "disabled", options.disabled );
		this._resetButton();
	},

	_determineButtonType: function() {
		var ancestor, labelSelector, checked;

		if ( this.element.is("[type=checkbox]") ) {
			this.type = "checkbox";
		} else if ( this.element.is("[type=radio]") ) {
			this.type = "radio";
		} else if ( this.element.is("input") ) {
			this.type = "input";
		} else {
			this.type = "button";
		}

		if ( this.type === "checkbox" || this.type === "radio" ) {
			// we don't search against the document in case the element
			// is disconnected from the DOM
			ancestor = this.element.parents().last();
			labelSelector = "label[for='" + this.element.attr("id") + "']";
			this.buttonElement = ancestor.find( labelSelector );
			if ( !this.buttonElement.length ) {
				ancestor = ancestor.length ? ancestor.siblings() : this.element.siblings();
				this.buttonElement = ancestor.filter( labelSelector );
				if ( !this.buttonElement.length ) {
					this.buttonElement = ancestor.find( labelSelector );
				}
			}
			this.element.addClass( "ui-helper-hidden-accessible" );

			checked = this.element.is( ":checked" );
			if ( checked ) {
				this.buttonElement.addClass( "ui-state-active" );
			}
			this.buttonElement.prop( "aria-pressed", checked );
		} else {
			this.buttonElement = this.element;
		}
	},

	widget: function() {
		return this.buttonElement;
	},

	_destroy: function() {
		this.element
			.removeClass( "ui-helper-hidden-accessible" );
		this.buttonElement
			.removeClass( baseClasses + " ui-state-active " + typeClasses )
			.removeAttr( "role" )
			.removeAttr( "aria-pressed" )
			.html( this.buttonElement.find(".ui-button-text").html() );

		if ( !this.hasTitle ) {
			this.buttonElement.removeAttr( "title" );
		}
	},

	_setOption: function( key, value ) {
		this._super( key, value );
		if ( key === "disabled" ) {
			this.element.prop( "disabled", !!value );
			if ( value ) {
				this.buttonElement.removeClass( "ui-state-focus" );
			}
			return;
		}
		this._resetButton();
	},

	refresh: function() {
		//See #8237 & #8828
		var isDisabled = this.element.is( "input, button" ) ? this.element.is( ":disabled" ) : this.element.hasClass( "ui-button-disabled" );

		if ( isDisabled !== this.options.disabled ) {
			this._setOption( "disabled", isDisabled );
		}
		if ( this.type === "radio" ) {
			radioGroup( this.element[0] ).each(function() {
				if ( $( this ).is( ":checked" ) ) {
					$( this ).button( "widget" )
						.addClass( "ui-state-active" )
						.attr( "aria-pressed", "true" );
				} else {
					$( this ).button( "widget" )
						.removeClass( "ui-state-active" )
						.attr( "aria-pressed", "false" );
				}
			});
		} else if ( this.type === "checkbox" ) {
			if ( this.element.is( ":checked" ) ) {
				this.buttonElement
					.addClass( "ui-state-active" )
					.attr( "aria-pressed", "true" );
			} else {
				this.buttonElement
					.removeClass( "ui-state-active" )
					.attr( "aria-pressed", "false" );
			}
		}
	},

	_resetButton: function() {
		if ( this.type === "input" ) {
			if ( this.options.label ) {
				this.element.val( this.options.label );
			}
			return;
		}
		var buttonElement = this.buttonElement.removeClass( typeClasses ),
			buttonText = $( "<span></span>", this.document[0] )
				.addClass( "ui-button-text" )
				.html( this.options.label )
				.appendTo( buttonElement.empty() )
				.text(),
			icons = this.options.icons,
			multipleIcons = icons.primary && icons.secondary,
			buttonClasses = [];

		if ( icons.primary || icons.secondary ) {
			if ( this.options.text ) {
				buttonClasses.push( "ui-button-text-icon" + ( multipleIcons ? "s" : ( icons.primary ? "-primary" : "-secondary" ) ) );
			}

			if ( icons.primary ) {
				buttonElement.prepend( "<span class='ui-button-icon-primary ui-icon " + icons.primary + "'></span>" );
			}

			if ( icons.secondary ) {
				buttonElement.append( "<span class='ui-button-icon-secondary ui-icon " + icons.secondary + "'></span>" );
			}

			if ( !this.options.text ) {
				buttonClasses.push( multipleIcons ? "ui-button-icons-only" : "ui-button-icon-only" );

				if ( !this.hasTitle ) {
					buttonElement.attr( "title", $.trim( buttonText ) );
				}
			}
		} else {
			buttonClasses.push( "ui-button-text-only" );
		}
		buttonElement.addClass( buttonClasses.join( " " ) );
	}
});

$.widget( "ui.buttonset", {
	version: "1.10.4",
	options: {
		items: "button, input[type=button], input[type=submit], input[type=reset], input[type=checkbox], input[type=radio], a, :data(ui-button)"
	},

	_create: function() {
		this.element.addClass( "ui-buttonset" );
	},

	_init: function() {
		this.refresh();
	},

	_setOption: function( key, value ) {
		if ( key === "disabled" ) {
			this.buttons.button( "option", key, value );
		}

		this._super( key, value );
	},

	refresh: function() {
		var rtl = this.element.css( "direction" ) === "rtl";

		this.buttons = this.element.find( this.options.items )
			.filter( ":ui-button" )
				.button( "refresh" )
			.end()
			.not( ":ui-button" )
				.button()
			.end()
			.map(function() {
				return $( this ).button( "widget" )[ 0 ];
			})
				.removeClass( "ui-corner-all ui-corner-left ui-corner-right" )
				.filter( ":first" )
					.addClass( rtl ? "ui-corner-right" : "ui-corner-left" )
				.end()
				.filter( ":last" )
					.addClass( rtl ? "ui-corner-left" : "ui-corner-right" )
				.end()
			.end();
	},

	_destroy: function() {
		this.element.removeClass( "ui-buttonset" );
		this.buttons
			.map(function() {
				return $( this ).button( "widget" )[ 0 ];
			})
				.removeClass( "ui-corner-left ui-corner-right" )
			.end()
			.button( "destroy" );
	}
});

}( jQuery ) );
(function( $, undefined ) {

$.extend($.ui, { datepicker: { version: "1.10.4" } });

var PROP_NAME = "datepicker",
	instActive;

/* Date picker manager.
   Use the singleton instance of this class, $.datepicker, to interact with the date picker.
   Settings for (groups of) date pickers are maintained in an instance object,
   allowing multiple different settings on the same page. */

function Datepicker() {
	this._curInst = null; // The current instance in use
	this._keyEvent = false; // If the last event was a key event
	this._disabledInputs = []; // List of date picker inputs that have been disabled
	this._datepickerShowing = false; // True if the popup picker is showing , false if not
	this._inDialog = false; // True if showing within a "dialog", false if not
	this._mainDivId = "ui-datepicker-div"; // The ID of the main datepicker division
	this._inlineClass = "ui-datepicker-inline"; // The name of the inline marker class
	this._appendClass = "ui-datepicker-append"; // The name of the append marker class
	this._triggerClass = "ui-datepicker-trigger"; // The name of the trigger marker class
	this._dialogClass = "ui-datepicker-dialog"; // The name of the dialog marker class
	this._disableClass = "ui-datepicker-disabled"; // The name of the disabled covering marker class
	this._unselectableClass = "ui-datepicker-unselectable"; // The name of the unselectable cell marker class
	this._currentClass = "ui-datepicker-current-day"; // The name of the current day marker class
	this._dayOverClass = "ui-datepicker-days-cell-over"; // The name of the day hover marker class
	this.regional = []; // Available regional settings, indexed by language code
	this.regional[""] = { // Default regional settings
		closeText: "Done", // Display text for close link
		prevText: "Prev", // Display text for previous month link
		nextText: "Next", // Display text for next month link
		currentText: "Today", // Display text for current month link
		monthNames: ["January","February","March","April","May","June",
			"July","August","September","October","November","December"], // Names of months for drop-down and formatting
		monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], // For formatting
		dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], // For formatting
		dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], // For formatting
		dayNamesMin: ["Su","Mo","Tu","We","Th","Fr","Sa"], // Column headings for days starting at Sunday
		weekHeader: "Wk", // Column header for week of the year
		dateFormat: "mm/dd/yy", // See format options on parseDate
		firstDay: 0, // The first day of the week, Sun = 0, Mon = 1, ...
		isRTL: false, // True if right-to-left language, false if left-to-right
		showMonthAfterYear: false, // True if the year select precedes month, false for month then year
		yearSuffix: "" // Additional text to append to the year in the month headers
	};
	this._defaults = { // Global defaults for all the date picker instances
		showOn: "focus", // "focus" for popup on focus,
			// "button" for trigger button, or "both" for either
		showAnim: "fadeIn", // Name of jQuery animation for popup
		showOptions: {}, // Options for enhanced animations
		defaultDate: null, // Used when field is blank: actual date,
			// +/-number for offset from today, null for today
		appendText: "", // Display text following the input box, e.g. showing the format
		buttonText: "...", // Text for trigger button
		buttonImage: "", // URL for trigger button image
		buttonImageOnly: false, // True if the image appears alone, false if it appears on a button
		hideIfNoPrevNext: false, // True to hide next/previous month links
			// if not applicable, false to just disable them
		navigationAsDateFormat: false, // True if date formatting applied to prev/today/next links
		gotoCurrent: false, // True if today link goes back to current selection instead
		changeMonth: false, // True if month can be selected directly, false if only prev/next
		changeYear: false, // True if year can be selected directly, false if only prev/next
		yearRange: "c-10:c+10", // Range of years to display in drop-down,
			// either relative to today's year (-nn:+nn), relative to currently displayed year
			// (c-nn:c+nn), absolute (nnnn:nnnn), or a combination of the above (nnnn:-n)
		showOtherMonths: false, // True to show dates in other months, false to leave blank
		selectOtherMonths: false, // True to allow selection of dates in other months, false for unselectable
		showWeek: false, // True to show week of the year, false to not show it
		calculateWeek: this.iso8601Week, // How to calculate the week of the year,
			// takes a Date and returns the number of the week for it
		shortYearCutoff: "+10", // Short year values < this are in the current century,
			// > this are in the previous century,
			// string value starting with "+" for current year + value
		minDate: null, // The earliest selectable date, or null for no limit
		maxDate: null, // The latest selectable date, or null for no limit
		duration: "fast", // Duration of display/closure
		beforeShowDay: null, // Function that takes a date and returns an array with
			// [0] = true if selectable, false if not, [1] = custom CSS class name(s) or "",
			// [2] = cell title (optional), e.g. $.datepicker.noWeekends
		beforeShow: null, // Function that takes an input field and
			// returns a set of custom settings for the date picker
		onSelect: null, // Define a callback function when a date is selected
		onChangeMonthYear: null, // Define a callback function when the month or year is changed
		onClose: null, // Define a callback function when the datepicker is closed
		numberOfMonths: 1, // Number of months to show at a time
		showCurrentAtPos: 0, // The position in multipe months at which to show the current month (starting at 0)
		stepMonths: 1, // Number of months to step back/forward
		stepBigMonths: 12, // Number of months to step back/forward for the big links
		altField: "", // Selector for an alternate field to store selected dates into
		altFormat: "", // The date format to use for the alternate field
		constrainInput: true, // The input is constrained by the current date format
		showButtonPanel: false, // True to show button panel, false to not show it
		autoSize: false, // True to size the input for the date format, false to leave as is
		disabled: false // The initial disabled state
	};
	$.extend(this._defaults, this.regional[""]);
	this.dpDiv = bindHover($("<div id='" + this._mainDivId + "' class='ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>"));
}

$.extend(Datepicker.prototype, {
	/* Class name added to elements to indicate already configured with a date picker. */
	markerClassName: "hasDatepicker",

	//Keep track of the maximum number of rows displayed (see #7043)
	maxRows: 4,

	// TODO rename to "widget" when switching to widget factory
	_widgetDatepicker: function() {
		return this.dpDiv;
	},

	/* Override the default settings for all instances of the date picker.
	 * @param  settings  object - the new settings to use as defaults (anonymous object)
	 * @return the manager object
	 */
	setDefaults: function(settings) {
		extendRemove(this._defaults, settings || {});
		return this;
	},

	/* Attach the date picker to a jQuery selection.
	 * @param  target	element - the target input field or division or span
	 * @param  settings  object - the new settings to use for this date picker instance (anonymous)
	 */
	_attachDatepicker: function(target, settings) {
		var nodeName, inline, inst;
		nodeName = target.nodeName.toLowerCase();
		inline = (nodeName === "div" || nodeName === "span");
		if (!target.id) {
			this.uuid += 1;
			target.id = "dp" + this.uuid;
		}
		inst = this._newInst($(target), inline);
		inst.settings = $.extend({}, settings || {});
		if (nodeName === "input") {
			this._connectDatepicker(target, inst);
		} else if (inline) {
			this._inlineDatepicker(target, inst);
		}
	},

	/* Create a new instance object. */
	_newInst: function(target, inline) {
		var id = target[0].id.replace(/([^A-Za-z0-9_\-])/g, "\\\\$1"); // escape jQuery meta chars
		return {id: id, input: target, // associated target
			selectedDay: 0, selectedMonth: 0, selectedYear: 0, // current selection
			drawMonth: 0, drawYear: 0, // month being drawn
			inline: inline, // is datepicker inline or not
			dpDiv: (!inline ? this.dpDiv : // presentation div
			bindHover($("<div class='" + this._inlineClass + " ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>")))};
	},

	/* Attach the date picker to an input field. */
	_connectDatepicker: function(target, inst) {
		var input = $(target);
		inst.append = $([]);
		inst.trigger = $([]);
		if (input.hasClass(this.markerClassName)) {
			return;
		}
		this._attachments(input, inst);
		input.addClass(this.markerClassName).keydown(this._doKeyDown).
			keypress(this._doKeyPress).keyup(this._doKeyUp);
		this._autoSize(inst);
		$.data(target, PROP_NAME, inst);
		//If disabled option is true, disable the datepicker once it has been attached to the input (see ticket #5665)
		if( inst.settings.disabled ) {
			this._disableDatepicker( target );
		}
	},

	/* Make attachments based on settings. */
	_attachments: function(input, inst) {
		var showOn, buttonText, buttonImage,
			appendText = this._get(inst, "appendText"),
			isRTL = this._get(inst, "isRTL");

		if (inst.append) {
			inst.append.remove();
		}
		if (appendText) {
			inst.append = $("<span class='" + this._appendClass + "'>" + appendText + "</span>");
			input[isRTL ? "before" : "after"](inst.append);
		}

		input.unbind("focus", this._showDatepicker);

		if (inst.trigger) {
			inst.trigger.remove();
		}

		showOn = this._get(inst, "showOn");
		if (showOn === "focus" || showOn === "both") { // pop-up date picker when in the marked field
			input.focus(this._showDatepicker);
		}
		if (showOn === "button" || showOn === "both") { // pop-up date picker when button clicked
			buttonText = this._get(inst, "buttonText");
			buttonImage = this._get(inst, "buttonImage");
			inst.trigger = $(this._get(inst, "buttonImageOnly") ?
				$("<img/>").addClass(this._triggerClass).
					attr({ src: buttonImage, alt: buttonText, title: buttonText }) :
				$("<button type='button'></button>").addClass(this._triggerClass).
					html(!buttonImage ? buttonText : $("<img/>").attr(
					{ src:buttonImage, alt:buttonText, title:buttonText })));
			input[isRTL ? "before" : "after"](inst.trigger);
			inst.trigger.click(function() {
				if ($.datepicker._datepickerShowing && $.datepicker._lastInput === input[0]) {
					$.datepicker._hideDatepicker();
				} else if ($.datepicker._datepickerShowing && $.datepicker._lastInput !== input[0]) {
					$.datepicker._hideDatepicker();
					$.datepicker._showDatepicker(input[0]);
				} else {
					$.datepicker._showDatepicker(input[0]);
				}
				return false;
			});
		}
	},

	/* Apply the maximum length for the date format. */
	_autoSize: function(inst) {
		if (this._get(inst, "autoSize") && !inst.inline) {
			var findMax, max, maxI, i,
				date = new Date(2009, 12 - 1, 20), // Ensure double digits
				dateFormat = this._get(inst, "dateFormat");

			if (dateFormat.match(/[DM]/)) {
				findMax = function(names) {
					max = 0;
					maxI = 0;
					for (i = 0; i < names.length; i++) {
						if (names[i].length > max) {
							max = names[i].length;
							maxI = i;
						}
					}
					return maxI;
				};
				date.setMonth(findMax(this._get(inst, (dateFormat.match(/MM/) ?
					"monthNames" : "monthNamesShort"))));
				date.setDate(findMax(this._get(inst, (dateFormat.match(/DD/) ?
					"dayNames" : "dayNamesShort"))) + 20 - date.getDay());
			}
			inst.input.attr("size", this._formatDate(inst, date).length);
		}
	},

	/* Attach an inline date picker to a div. */
	_inlineDatepicker: function(target, inst) {
		var divSpan = $(target);
		if (divSpan.hasClass(this.markerClassName)) {
			return;
		}
		divSpan.addClass(this.markerClassName).append(inst.dpDiv);
		$.data(target, PROP_NAME, inst);
		this._setDate(inst, this._getDefaultDate(inst), true);
		this._updateDatepicker(inst);
		this._updateAlternate(inst);
		//If disabled option is true, disable the datepicker before showing it (see ticket #5665)
		if( inst.settings.disabled ) {
			this._disableDatepicker( target );
		}
		// Set display:block in place of inst.dpDiv.show() which won't work on disconnected elements
		// http://bugs.jqueryui.com/ticket/7552 - A Datepicker created on a detached div has zero height
		inst.dpDiv.css( "display", "block" );
	},

	/* Pop-up the date picker in a "dialog" box.
	 * @param  input element - ignored
	 * @param  date	string or Date - the initial date to display
	 * @param  onSelect  function - the function to call when a date is selected
	 * @param  settings  object - update the dialog date picker instance's settings (anonymous object)
	 * @param  pos int[2] - coordinates for the dialog's position within the screen or
	 *					event - with x/y coordinates or
	 *					leave empty for default (screen centre)
	 * @return the manager object
	 */
	_dialogDatepicker: function(input, date, onSelect, settings, pos) {
		var id, browserWidth, browserHeight, scrollX, scrollY,
			inst = this._dialogInst; // internal instance

		if (!inst) {
			this.uuid += 1;
			id = "dp" + this.uuid;
			this._dialogInput = $("<input type='text' id='" + id +
				"' style='position: absolute; top: -100px; width: 0px;'/>");
			this._dialogInput.keydown(this._doKeyDown);
			$("body").append(this._dialogInput);
			inst = this._dialogInst = this._newInst(this._dialogInput, false);
			inst.settings = {};
			$.data(this._dialogInput[0], PROP_NAME, inst);
		}
		extendRemove(inst.settings, settings || {});
		date = (date && date.constructor === Date ? this._formatDate(inst, date) : date);
		this._dialogInput.val(date);

		this._pos = (pos ? (pos.length ? pos : [pos.pageX, pos.pageY]) : null);
		if (!this._pos) {
			browserWidth = document.documentElement.clientWidth;
			browserHeight = document.documentElement.clientHeight;
			scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
			scrollY = document.documentElement.scrollTop || document.body.scrollTop;
			this._pos = // should use actual width/height below
				[(browserWidth / 2) - 100 + scrollX, (browserHeight / 2) - 150 + scrollY];
		}

		// move input on screen for focus, but hidden behind dialog
		this._dialogInput.css("left", (this._pos[0] + 20) + "px").css("top", this._pos[1] + "px");
		inst.settings.onSelect = onSelect;
		this._inDialog = true;
		this.dpDiv.addClass(this._dialogClass);
		this._showDatepicker(this._dialogInput[0]);
		if ($.blockUI) {
			$.blockUI(this.dpDiv);
		}
		$.data(this._dialogInput[0], PROP_NAME, inst);
		return this;
	},

	/* Detach a datepicker from its control.
	 * @param  target	element - the target input field or division or span
	 */
	_destroyDatepicker: function(target) {
		var nodeName,
			$target = $(target),
			inst = $.data(target, PROP_NAME);

		if (!$target.hasClass(this.markerClassName)) {
			return;
		}

		nodeName = target.nodeName.toLowerCase();
		$.removeData(target, PROP_NAME);
		if (nodeName === "input") {
			inst.append.remove();
			inst.trigger.remove();
			$target.removeClass(this.markerClassName).
				unbind("focus", this._showDatepicker).
				unbind("keydown", this._doKeyDown).
				unbind("keypress", this._doKeyPress).
				unbind("keyup", this._doKeyUp);
		} else if (nodeName === "div" || nodeName === "span") {
			$target.removeClass(this.markerClassName).empty();
		}
	},

	/* Enable the date picker to a jQuery selection.
	 * @param  target	element - the target input field or division or span
	 */
	_enableDatepicker: function(target) {
		var nodeName, inline,
			$target = $(target),
			inst = $.data(target, PROP_NAME);

		if (!$target.hasClass(this.markerClassName)) {
			return;
		}

		nodeName = target.nodeName.toLowerCase();
		if (nodeName === "input") {
			target.disabled = false;
			inst.trigger.filter("button").
				each(function() { this.disabled = false; }).end().
				filter("img").css({opacity: "1.0", cursor: ""});
		} else if (nodeName === "div" || nodeName === "span") {
			inline = $target.children("." + this._inlineClass);
			inline.children().removeClass("ui-state-disabled");
			inline.find("select.ui-datepicker-month, select.ui-datepicker-year").
				prop("disabled", false);
		}
		this._disabledInputs = $.map(this._disabledInputs,
			function(value) { return (value === target ? null : value); }); // delete entry
	},

	/* Disable the date picker to a jQuery selection.
	 * @param  target	element - the target input field or division or span
	 */
	_disableDatepicker: function(target) {
		var nodeName, inline,
			$target = $(target),
			inst = $.data(target, PROP_NAME);

		if (!$target.hasClass(this.markerClassName)) {
			return;
		}

		nodeName = target.nodeName.toLowerCase();
		if (nodeName === "input") {
			target.disabled = true;
			inst.trigger.filter("button").
				each(function() { this.disabled = true; }).end().
				filter("img").css({opacity: "0.5", cursor: "default"});
		} else if (nodeName === "div" || nodeName === "span") {
			inline = $target.children("." + this._inlineClass);
			inline.children().addClass("ui-state-disabled");
			inline.find("select.ui-datepicker-month, select.ui-datepicker-year").
				prop("disabled", true);
		}
		this._disabledInputs = $.map(this._disabledInputs,
			function(value) { return (value === target ? null : value); }); // delete entry
		this._disabledInputs[this._disabledInputs.length] = target;
	},

	/* Is the first field in a jQuery collection disabled as a datepicker?
	 * @param  target	element - the target input field or division or span
	 * @return boolean - true if disabled, false if enabled
	 */
	_isDisabledDatepicker: function(target) {
		if (!target) {
			return false;
		}
		for (var i = 0; i < this._disabledInputs.length; i++) {
			if (this._disabledInputs[i] === target) {
				return true;
			}
		}
		return false;
	},

	/* Retrieve the instance data for the target control.
	 * @param  target  element - the target input field or division or span
	 * @return  object - the associated instance data
	 * @throws  error if a jQuery problem getting data
	 */
	_getInst: function(target) {
		try {
			return $.data(target, PROP_NAME);
		}
		catch (err) {
			throw "Missing instance data for this datepicker";
		}
	},

	/* Update or retrieve the settings for a date picker attached to an input field or division.
	 * @param  target  element - the target input field or division or span
	 * @param  name	object - the new settings to update or
	 *				string - the name of the setting to change or retrieve,
	 *				when retrieving also "all" for all instance settings or
	 *				"defaults" for all global defaults
	 * @param  value   any - the new value for the setting
	 *				(omit if above is an object or to retrieve a value)
	 */
	_optionDatepicker: function(target, name, value) {
		var settings, date, minDate, maxDate,
			inst = this._getInst(target);

		if (arguments.length === 2 && typeof name === "string") {
			return (name === "defaults" ? $.extend({}, $.datepicker._defaults) :
				(inst ? (name === "all" ? $.extend({}, inst.settings) :
				this._get(inst, name)) : null));
		}

		settings = name || {};
		if (typeof name === "string") {
			settings = {};
			settings[name] = value;
		}

		if (inst) {
			if (this._curInst === inst) {
				this._hideDatepicker();
			}

			date = this._getDateDatepicker(target, true);
			minDate = this._getMinMaxDate(inst, "min");
			maxDate = this._getMinMaxDate(inst, "max");
			extendRemove(inst.settings, settings);
			// reformat the old minDate/maxDate values if dateFormat changes and a new minDate/maxDate isn't provided
			if (minDate !== null && settings.dateFormat !== undefined && settings.minDate === undefined) {
				inst.settings.minDate = this._formatDate(inst, minDate);
			}
			if (maxDate !== null && settings.dateFormat !== undefined && settings.maxDate === undefined) {
				inst.settings.maxDate = this._formatDate(inst, maxDate);
			}
			if ( "disabled" in settings ) {
				if ( settings.disabled ) {
					this._disableDatepicker(target);
				} else {
					this._enableDatepicker(target);
				}
			}
			this._attachments($(target), inst);
			this._autoSize(inst);
			this._setDate(inst, date);
			this._updateAlternate(inst);
			this._updateDatepicker(inst);
		}
	},

	// change method deprecated
	_changeDatepicker: function(target, name, value) {
		this._optionDatepicker(target, name, value);
	},

	/* Redraw the date picker attached to an input field or division.
	 * @param  target  element - the target input field or division or span
	 */
	_refreshDatepicker: function(target) {
		var inst = this._getInst(target);
		if (inst) {
			this._updateDatepicker(inst);
		}
	},

	/* Set the dates for a jQuery selection.
	 * @param  target element - the target input field or division or span
	 * @param  date	Date - the new date
	 */
	_setDateDatepicker: function(target, date) {
		var inst = this._getInst(target);
		if (inst) {
			this._setDate(inst, date);
			this._updateDatepicker(inst);
			this._updateAlternate(inst);
		}
	},

	/* Get the date(s) for the first entry in a jQuery selection.
	 * @param  target element - the target input field or division or span
	 * @param  noDefault boolean - true if no default date is to be used
	 * @return Date - the current date
	 */
	_getDateDatepicker: function(target, noDefault) {
		var inst = this._getInst(target);
		if (inst && !inst.inline) {
			this._setDateFromField(inst, noDefault);
		}
		return (inst ? this._getDate(inst) : null);
	},

	/* Handle keystrokes. */
	_doKeyDown: function(event) {
		var onSelect, dateStr, sel,
			inst = $.datepicker._getInst(event.target),
			handled = true,
			isRTL = inst.dpDiv.is(".ui-datepicker-rtl");

		inst._keyEvent = true;
		if ($.datepicker._datepickerShowing) {
			switch (event.keyCode) {
				case 9: $.datepicker._hideDatepicker();
						handled = false;
						break; // hide on tab out
				case 13: sel = $("td." + $.datepicker._dayOverClass + ":not(." +
									$.datepicker._currentClass + ")", inst.dpDiv);
						if (sel[0]) {
							$.datepicker._selectDay(event.target, inst.selectedMonth, inst.selectedYear, sel[0]);
						}

						onSelect = $.datepicker._get(inst, "onSelect");
						if (onSelect) {
							dateStr = $.datepicker._formatDate(inst);

							// trigger custom callback
							onSelect.apply((inst.input ? inst.input[0] : null), [dateStr, inst]);
						} else {
							$.datepicker._hideDatepicker();
						}

						return false; // don't submit the form
				case 27: $.datepicker._hideDatepicker();
						break; // hide on escape
				case 33: $.datepicker._adjustDate(event.target, (event.ctrlKey ?
							-$.datepicker._get(inst, "stepBigMonths") :
							-$.datepicker._get(inst, "stepMonths")), "M");
						break; // previous month/year on page up/+ ctrl
				case 34: $.datepicker._adjustDate(event.target, (event.ctrlKey ?
							+$.datepicker._get(inst, "stepBigMonths") :
							+$.datepicker._get(inst, "stepMonths")), "M");
						break; // next month/year on page down/+ ctrl
				case 35: if (event.ctrlKey || event.metaKey) {
							$.datepicker._clearDate(event.target);
						}
						handled = event.ctrlKey || event.metaKey;
						break; // clear on ctrl or command +end
				case 36: if (event.ctrlKey || event.metaKey) {
							$.datepicker._gotoToday(event.target);
						}
						handled = event.ctrlKey || event.metaKey;
						break; // current on ctrl or command +home
				case 37: if (event.ctrlKey || event.metaKey) {
							$.datepicker._adjustDate(event.target, (isRTL ? +1 : -1), "D");
						}
						handled = event.ctrlKey || event.metaKey;
						// -1 day on ctrl or command +left
						if (event.originalEvent.altKey) {
							$.datepicker._adjustDate(event.target, (event.ctrlKey ?
								-$.datepicker._get(inst, "stepBigMonths") :
								-$.datepicker._get(inst, "stepMonths")), "M");
						}
						// next month/year on alt +left on Mac
						break;
				case 38: if (event.ctrlKey || event.metaKey) {
							$.datepicker._adjustDate(event.target, -7, "D");
						}
						handled = event.ctrlKey || event.metaKey;
						break; // -1 week on ctrl or command +up
				case 39: if (event.ctrlKey || event.metaKey) {
							$.datepicker._adjustDate(event.target, (isRTL ? -1 : +1), "D");
						}
						handled = event.ctrlKey || event.metaKey;
						// +1 day on ctrl or command +right
						if (event.originalEvent.altKey) {
							$.datepicker._adjustDate(event.target, (event.ctrlKey ?
								+$.datepicker._get(inst, "stepBigMonths") :
								+$.datepicker._get(inst, "stepMonths")), "M");
						}
						// next month/year on alt +right
						break;
				case 40: if (event.ctrlKey || event.metaKey) {
							$.datepicker._adjustDate(event.target, +7, "D");
						}
						handled = event.ctrlKey || event.metaKey;
						break; // +1 week on ctrl or command +down
				default: handled = false;
			}
		} else if (event.keyCode === 36 && event.ctrlKey) { // display the date picker on ctrl+home
			$.datepicker._showDatepicker(this);
		} else {
			handled = false;
		}

		if (handled) {
			event.preventDefault();
			event.stopPropagation();
		}
	},

	/* Filter entered characters - based on date format. */
	_doKeyPress: function(event) {
		var chars, chr,
			inst = $.datepicker._getInst(event.target);

		if ($.datepicker._get(inst, "constrainInput")) {
			chars = $.datepicker._possibleChars($.datepicker._get(inst, "dateFormat"));
			chr = String.fromCharCode(event.charCode == null ? event.keyCode : event.charCode);
			return event.ctrlKey || event.metaKey || (chr < " " || !chars || chars.indexOf(chr) > -1);
		}
	},

	/* Synchronise manual entry and field/alternate field. */
	_doKeyUp: function(event) {
		var date,
			inst = $.datepicker._getInst(event.target);

		if (inst.input.val() !== inst.lastVal) {
			try {
				date = $.datepicker.parseDate($.datepicker._get(inst, "dateFormat"),
					(inst.input ? inst.input.val() : null),
					$.datepicker._getFormatConfig(inst));

				if (date) { // only if valid
					$.datepicker._setDateFromField(inst);
					$.datepicker._updateAlternate(inst);
					$.datepicker._updateDatepicker(inst);
				}
			}
			catch (err) {
			}
		}
		return true;
	},

	/* Pop-up the date picker for a given input field.
	 * If false returned from beforeShow event handler do not show.
	 * @param  input  element - the input field attached to the date picker or
	 *					event - if triggered by focus
	 */
	_showDatepicker: function(input) {
		input = input.target || input;
		if (input.nodeName.toLowerCase() !== "input") { // find from button/image trigger
			input = $("input", input.parentNode)[0];
		}

		if ($.datepicker._isDisabledDatepicker(input) || $.datepicker._lastInput === input) { // already here
			return;
		}

		var inst, beforeShow, beforeShowSettings, isFixed,
			offset, showAnim, duration;

		inst = $.datepicker._getInst(input);
		if ($.datepicker._curInst && $.datepicker._curInst !== inst) {
			$.datepicker._curInst.dpDiv.stop(true, true);
			if ( inst && $.datepicker._datepickerShowing ) {
				$.datepicker._hideDatepicker( $.datepicker._curInst.input[0] );
			}
		}

		beforeShow = $.datepicker._get(inst, "beforeShow");
		beforeShowSettings = beforeShow ? beforeShow.apply(input, [input, inst]) : {};
		if(beforeShowSettings === false){
			return;
		}
		extendRemove(inst.settings, beforeShowSettings);

		inst.lastVal = null;
		$.datepicker._lastInput = input;
		$.datepicker._setDateFromField(inst);

		if ($.datepicker._inDialog) { // hide cursor
			input.value = "";
		}
		if (!$.datepicker._pos) { // position below input
			$.datepicker._pos = $.datepicker._findPos(input);
			$.datepicker._pos[1] += input.offsetHeight; // add the height
		}

		isFixed = false;
		$(input).parents().each(function() {
			isFixed |= $(this).css("position") === "fixed";
			return !isFixed;
		});

		offset = {left: $.datepicker._pos[0], top: $.datepicker._pos[1]};
		$.datepicker._pos = null;
		//to avoid flashes on Firefox
		inst.dpDiv.empty();
		// determine sizing offscreen
		inst.dpDiv.css({position: "absolute", display: "block", top: "-1000px"});
		$.datepicker._updateDatepicker(inst);
		// fix width for dynamic number of date pickers
		// and adjust position before showing
		offset = $.datepicker._checkOffset(inst, offset, isFixed);
		inst.dpDiv.css({position: ($.datepicker._inDialog && $.blockUI ?
			"static" : (isFixed ? "fixed" : "absolute")), display: "none",
			left: offset.left + "px", top: offset.top + "px"});

		if (!inst.inline) {
			showAnim = $.datepicker._get(inst, "showAnim");
			duration = $.datepicker._get(inst, "duration");
			inst.dpDiv.zIndex($(input).zIndex()+1);
			$.datepicker._datepickerShowing = true;

			if ( $.effects && $.effects.effect[ showAnim ] ) {
				inst.dpDiv.show(showAnim, $.datepicker._get(inst, "showOptions"), duration);
			} else {
				inst.dpDiv[showAnim || "show"](showAnim ? duration : null);
			}

			if ( $.datepicker._shouldFocusInput( inst ) ) {
				inst.input.focus();
			}

			$.datepicker._curInst = inst;
		}
	},

	/* Generate the date picker content. */
	_updateDatepicker: function(inst) {
		this.maxRows = 4; //Reset the max number of rows being displayed (see #7043)
		instActive = inst; // for delegate hover events
		inst.dpDiv.empty().append(this._generateHTML(inst));
		this._attachHandlers(inst);
		inst.dpDiv.find("." + this._dayOverClass + " a").mouseover();

		var origyearshtml,
			numMonths = this._getNumberOfMonths(inst),
			cols = numMonths[1],
			width = 17;

		inst.dpDiv.removeClass("ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4").width("");
		if (cols > 1) {
			inst.dpDiv.addClass("ui-datepicker-multi-" + cols).css("width", (width * cols) + "em");
		}
		inst.dpDiv[(numMonths[0] !== 1 || numMonths[1] !== 1 ? "add" : "remove") +
			"Class"]("ui-datepicker-multi");
		inst.dpDiv[(this._get(inst, "isRTL") ? "add" : "remove") +
			"Class"]("ui-datepicker-rtl");

		if (inst === $.datepicker._curInst && $.datepicker._datepickerShowing && $.datepicker._shouldFocusInput( inst ) ) {
			inst.input.focus();
		}

		// deffered render of the years select (to avoid flashes on Firefox)
		if( inst.yearshtml ){
			origyearshtml = inst.yearshtml;
			setTimeout(function(){
				//assure that inst.yearshtml didn't change.
				if( origyearshtml === inst.yearshtml && inst.yearshtml ){
					inst.dpDiv.find("select.ui-datepicker-year:first").replaceWith(inst.yearshtml);
				}
				origyearshtml = inst.yearshtml = null;
			}, 0);
		}
	},

	// #6694 - don't focus the input if it's already focused
	// this breaks the change event in IE
	// Support: IE and jQuery <1.9
	_shouldFocusInput: function( inst ) {
		return inst.input && inst.input.is( ":visible" ) && !inst.input.is( ":disabled" ) && !inst.input.is( ":focus" );
	},

	/* Check positioning to remain on screen. */
	_checkOffset: function(inst, offset, isFixed) {
		var dpWidth = inst.dpDiv.outerWidth(),
			dpHeight = inst.dpDiv.outerHeight(),
			inputWidth = inst.input ? inst.input.outerWidth() : 0,
			inputHeight = inst.input ? inst.input.outerHeight() : 0,
			viewWidth = document.documentElement.clientWidth + (isFixed ? 0 : $(document).scrollLeft()),
			viewHeight = document.documentElement.clientHeight + (isFixed ? 0 : $(document).scrollTop());

		offset.left -= (this._get(inst, "isRTL") ? (dpWidth - inputWidth) : 0);
		offset.left -= (isFixed && offset.left === inst.input.offset().left) ? $(document).scrollLeft() : 0;
		offset.top -= (isFixed && offset.top === (inst.input.offset().top + inputHeight)) ? $(document).scrollTop() : 0;

		// now check if datepicker is showing outside window viewport - move to a better place if so.
		offset.left -= Math.min(offset.left, (offset.left + dpWidth > viewWidth && viewWidth > dpWidth) ?
			Math.abs(offset.left + dpWidth - viewWidth) : 0);
		offset.top -= Math.min(offset.top, (offset.top + dpHeight > viewHeight && viewHeight > dpHeight) ?
			Math.abs(dpHeight + inputHeight) : 0);

		return offset;
	},

	/* Find an object's position on the screen. */
	_findPos: function(obj) {
		var position,
			inst = this._getInst(obj),
			isRTL = this._get(inst, "isRTL");

		while (obj && (obj.type === "hidden" || obj.nodeType !== 1 || $.expr.filters.hidden(obj))) {
			obj = obj[isRTL ? "previousSibling" : "nextSibling"];
		}

		position = $(obj).offset();
		return [position.left, position.top];
	},

	/* Hide the date picker from view.
	 * @param  input  element - the input field attached to the date picker
	 */
	_hideDatepicker: function(input) {
		var showAnim, duration, postProcess, onClose,
			inst = this._curInst;

		if (!inst || (input && inst !== $.data(input, PROP_NAME))) {
			return;
		}

		if (this._datepickerShowing) {
			showAnim = this._get(inst, "showAnim");
			duration = this._get(inst, "duration");
			postProcess = function() {
				$.datepicker._tidyDialog(inst);
			};

			// DEPRECATED: after BC for 1.8.x $.effects[ showAnim ] is not needed
			if ( $.effects && ( $.effects.effect[ showAnim ] || $.effects[ showAnim ] ) ) {
				inst.dpDiv.hide(showAnim, $.datepicker._get(inst, "showOptions"), duration, postProcess);
			} else {
				inst.dpDiv[(showAnim === "slideDown" ? "slideUp" :
					(showAnim === "fadeIn" ? "fadeOut" : "hide"))]((showAnim ? duration : null), postProcess);
			}

			if (!showAnim) {
				postProcess();
			}
			this._datepickerShowing = false;

			onClose = this._get(inst, "onClose");
			if (onClose) {
				onClose.apply((inst.input ? inst.input[0] : null), [(inst.input ? inst.input.val() : ""), inst]);
			}

			this._lastInput = null;
			if (this._inDialog) {
				this._dialogInput.css({ position: "absolute", left: "0", top: "-100px" });
				if ($.blockUI) {
					$.unblockUI();
					$("body").append(this.dpDiv);
				}
			}
			this._inDialog = false;
		}
	},

	/* Tidy up after a dialog display. */
	_tidyDialog: function(inst) {
		inst.dpDiv.removeClass(this._dialogClass).unbind(".ui-datepicker-calendar");
	},

	/* Close date picker if clicked elsewhere. */
	_checkExternalClick: function(event) {
		if (!$.datepicker._curInst) {
			return;
		}

		var $target = $(event.target),
			inst = $.datepicker._getInst($target[0]);

		if ( ( ( $target[0].id !== $.datepicker._mainDivId &&
				$target.parents("#" + $.datepicker._mainDivId).length === 0 &&
				!$target.hasClass($.datepicker.markerClassName) &&
				!$target.closest("." + $.datepicker._triggerClass).length &&
				$.datepicker._datepickerShowing && !($.datepicker._inDialog && $.blockUI) ) ) ||
			( $target.hasClass($.datepicker.markerClassName) && $.datepicker._curInst !== inst ) ) {
				$.datepicker._hideDatepicker();
		}
	},

	/* Adjust one of the date sub-fields. */
	_adjustDate: function(id, offset, period) {
		var target = $(id),
			inst = this._getInst(target[0]);

		if (this._isDisabledDatepicker(target[0])) {
			return;
		}
		this._adjustInstDate(inst, offset +
			(period === "M" ? this._get(inst, "showCurrentAtPos") : 0), // undo positioning
			period);
		this._updateDatepicker(inst);
	},

	/* Action for current link. */
	_gotoToday: function(id) {
		var date,
			target = $(id),
			inst = this._getInst(target[0]);

		if (this._get(inst, "gotoCurrent") && inst.currentDay) {
			inst.selectedDay = inst.currentDay;
			inst.drawMonth = inst.selectedMonth = inst.currentMonth;
			inst.drawYear = inst.selectedYear = inst.currentYear;
		} else {
			date = new Date();
			inst.selectedDay = date.getDate();
			inst.drawMonth = inst.selectedMonth = date.getMonth();
			inst.drawYear = inst.selectedYear = date.getFullYear();
		}
		this._notifyChange(inst);
		this._adjustDate(target);
	},

	/* Action for selecting a new month/year. */
	_selectMonthYear: function(id, select, period) {
		var target = $(id),
			inst = this._getInst(target[0]);

		inst["selected" + (period === "M" ? "Month" : "Year")] =
		inst["draw" + (period === "M" ? "Month" : "Year")] =
			parseInt(select.options[select.selectedIndex].value,10);

		this._notifyChange(inst);
		this._adjustDate(target);
	},

	/* Action for selecting a day. */
	_selectDay: function(id, month, year, td) {
		var inst,
			target = $(id);

		if ($(td).hasClass(this._unselectableClass) || this._isDisabledDatepicker(target[0])) {
			return;
		}

		inst = this._getInst(target[0]);
		inst.selectedDay = inst.currentDay = $("a", td).html();
		inst.selectedMonth = inst.currentMonth = month;
		inst.selectedYear = inst.currentYear = year;
		this._selectDate(id, this._formatDate(inst,
			inst.currentDay, inst.currentMonth, inst.currentYear));
	},

	/* Erase the input field and hide the date picker. */
	_clearDate: function(id) {
		var target = $(id);
		this._selectDate(target, "");
	},

	/* Update the input field with the selected date. */
	_selectDate: function(id, dateStr) {
		var onSelect,
			target = $(id),
			inst = this._getInst(target[0]);

		dateStr = (dateStr != null ? dateStr : this._formatDate(inst));
		if (inst.input) {
			inst.input.val(dateStr);
		}
		this._updateAlternate(inst);

		onSelect = this._get(inst, "onSelect");
		if (onSelect) {
			onSelect.apply((inst.input ? inst.input[0] : null), [dateStr, inst]);  // trigger custom callback
		} else if (inst.input) {
			inst.input.trigger("change"); // fire the change event
		}

		if (inst.inline){
			this._updateDatepicker(inst);
		} else {
			this._hideDatepicker();
			this._lastInput = inst.input[0];
			if (typeof(inst.input[0]) !== "object") {
				inst.input.focus(); // restore focus
			}
			this._lastInput = null;
		}
	},

	/* Update any alternate field to synchronise with the main field. */
	_updateAlternate: function(inst) {
		var altFormat, date, dateStr,
			altField = this._get(inst, "altField");

		if (altField) { // update alternate field too
			altFormat = this._get(inst, "altFormat") || this._get(inst, "dateFormat");
			date = this._getDate(inst);
			dateStr = this.formatDate(altFormat, date, this._getFormatConfig(inst));
			$(altField).each(function() { $(this).val(dateStr); });
		}
	},

	/* Set as beforeShowDay function to prevent selection of weekends.
	 * @param  date  Date - the date to customise
	 * @return [boolean, string] - is this date selectable?, what is its CSS class?
	 */
	noWeekends: function(date) {
		var day = date.getDay();
		return [(day > 0 && day < 6), ""];
	},

	/* Set as calculateWeek to determine the week of the year based on the ISO 8601 definition.
	 * @param  date  Date - the date to get the week for
	 * @return  number - the number of the week within the year that contains this date
	 */
	iso8601Week: function(date) {
		var time,
			checkDate = new Date(date.getTime());

		// Find Thursday of this week starting on Monday
		checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));

		time = checkDate.getTime();
		checkDate.setMonth(0); // Compare with Jan 1
		checkDate.setDate(1);
		return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
	},

	/* Parse a string value into a date object.
	 * See formatDate below for the possible formats.
	 *
	 * @param  format string - the expected format of the date
	 * @param  value string - the date in the above format
	 * @param  settings Object - attributes include:
	 *					shortYearCutoff  number - the cutoff year for determining the century (optional)
	 *					dayNamesShort	string[7] - abbreviated names of the days from Sunday (optional)
	 *					dayNames		string[7] - names of the days from Sunday (optional)
	 *					monthNamesShort string[12] - abbreviated names of the months (optional)
	 *					monthNames		string[12] - names of the months (optional)
	 * @return  Date - the extracted date value or null if value is blank
	 */
	parseDate: function (format, value, settings) {
		if (format == null || value == null) {
			throw "Invalid arguments";
		}

		value = (typeof value === "object" ? value.toString() : value + "");
		if (value === "") {
			return null;
		}

		var iFormat, dim, extra,
			iValue = 0,
			shortYearCutoffTemp = (settings ? settings.shortYearCutoff : null) || this._defaults.shortYearCutoff,
			shortYearCutoff = (typeof shortYearCutoffTemp !== "string" ? shortYearCutoffTemp :
				new Date().getFullYear() % 100 + parseInt(shortYearCutoffTemp, 10)),
			dayNamesShort = (settings ? settings.dayNamesShort : null) || this._defaults.dayNamesShort,
			dayNames = (settings ? settings.dayNames : null) || this._defaults.dayNames,
			monthNamesShort = (settings ? settings.monthNamesShort : null) || this._defaults.monthNamesShort,
			monthNames = (settings ? settings.monthNames : null) || this._defaults.monthNames,
			year = -1,
			month = -1,
			day = -1,
			doy = -1,
			literal = false,
			date,
			// Check whether a format character is doubled
			lookAhead = function(match) {
				var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
				if (matches) {
					iFormat++;
				}
				return matches;
			},
			// Extract a number from the string value
			getNumber = function(match) {
				var isDoubled = lookAhead(match),
					size = (match === "@" ? 14 : (match === "!" ? 20 :
					(match === "y" && isDoubled ? 4 : (match === "o" ? 3 : 2)))),
					digits = new RegExp("^\\d{1," + size + "}"),
					num = value.substring(iValue).match(digits);
				if (!num) {
					throw "Missing number at position " + iValue;
				}
				iValue += num[0].length;
				return parseInt(num[0], 10);
			},
			// Extract a name from the string value and convert to an index
			getName = function(match, shortNames, longNames) {
				var index = -1,
					names = $.map(lookAhead(match) ? longNames : shortNames, function (v, k) {
						return [ [k, v] ];
					}).sort(function (a, b) {
						return -(a[1].length - b[1].length);
					});

				$.each(names, function (i, pair) {
					var name = pair[1];
					if (value.substr(iValue, name.length).toLowerCase() === name.toLowerCase()) {
						index = pair[0];
						iValue += name.length;
						return false;
					}
				});
				if (index !== -1) {
					return index + 1;
				} else {
					throw "Unknown name at position " + iValue;
				}
			},
			// Confirm that a literal character matches the string value
			checkLiteral = function() {
				if (value.charAt(iValue) !== format.charAt(iFormat)) {
					throw "Unexpected literal at position " + iValue;
				}
				iValue++;
			};

		for (iFormat = 0; iFormat < format.length; iFormat++) {
			if (literal) {
				if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
					literal = false;
				} else {
					checkLiteral();
				}
			} else {
				switch (format.charAt(iFormat)) {
					case "d":
						day = getNumber("d");
						break;
					case "D":
						getName("D", dayNamesShort, dayNames);
						break;
					case "o":
						doy = getNumber("o");
						break;
					case "m":
						month = getNumber("m");
						break;
					case "M":
						month = getName("M", monthNamesShort, monthNames);
						break;
					case "y":
						year = getNumber("y");
						break;
					case "@":
						date = new Date(getNumber("@"));
						year = date.getFullYear();
						month = date.getMonth() + 1;
						day = date.getDate();
						break;
					case "!":
						date = new Date((getNumber("!") - this._ticksTo1970) / 10000);
						year = date.getFullYear();
						month = date.getMonth() + 1;
						day = date.getDate();
						break;
					case "'":
						if (lookAhead("'")){
							checkLiteral();
						} else {
							literal = true;
						}
						break;
					default:
						checkLiteral();
				}
			}
		}

		if (iValue < value.length){
			extra = value.substr(iValue);
			if (!/^\s+/.test(extra)) {
				throw "Extra/unparsed characters found in date: " + extra;
			}
		}

		if (year === -1) {
			year = new Date().getFullYear();
		} else if (year < 100) {
			year += new Date().getFullYear() - new Date().getFullYear() % 100 +
				(year <= shortYearCutoff ? 0 : -100);
		}

		if (doy > -1) {
			month = 1;
			day = doy;
			do {
				dim = this._getDaysInMonth(year, month - 1);
				if (day <= dim) {
					break;
				}
				month++;
				day -= dim;
			} while (true);
		}

		date = this._daylightSavingAdjust(new Date(year, month - 1, day));
		if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
			throw "Invalid date"; // E.g. 31/02/00
		}
		return date;
	},

	/* Standard date formats. */
	ATOM: "yy-mm-dd", // RFC 3339 (ISO 8601)
	COOKIE: "D, dd M yy",
	ISO_8601: "yy-mm-dd",
	RFC_822: "D, d M y",
	RFC_850: "DD, dd-M-y",
	RFC_1036: "D, d M y",
	RFC_1123: "D, d M yy",
	RFC_2822: "D, d M yy",
	RSS: "D, d M y", // RFC 822
	TICKS: "!",
	TIMESTAMP: "@",
	W3C: "yy-mm-dd", // ISO 8601

	_ticksTo1970: (((1970 - 1) * 365 + Math.floor(1970 / 4) - Math.floor(1970 / 100) +
		Math.floor(1970 / 400)) * 24 * 60 * 60 * 10000000),

	/* Format a date object into a string value.
	 * The format can be combinations of the following:
	 * d  - day of month (no leading zero)
	 * dd - day of month (two digit)
	 * o  - day of year (no leading zeros)
	 * oo - day of year (three digit)
	 * D  - day name short
	 * DD - day name long
	 * m  - month of year (no leading zero)
	 * mm - month of year (two digit)
	 * M  - month name short
	 * MM - month name long
	 * y  - year (two digit)
	 * yy - year (four digit)
	 * @ - Unix timestamp (ms since 01/01/1970)
	 * ! - Windows ticks (100ns since 01/01/0001)
	 * "..." - literal text
	 * '' - single quote
	 *
	 * @param  format string - the desired format of the date
	 * @param  date Date - the date value to format
	 * @param  settings Object - attributes include:
	 *					dayNamesShort	string[7] - abbreviated names of the days from Sunday (optional)
	 *					dayNames		string[7] - names of the days from Sunday (optional)
	 *					monthNamesShort string[12] - abbreviated names of the months (optional)
	 *					monthNames		string[12] - names of the months (optional)
	 * @return  string - the date in the above format
	 */
	formatDate: function (format, date, settings) {
		if (!date) {
			return "";
		}

		var iFormat,
			dayNamesShort = (settings ? settings.dayNamesShort : null) || this._defaults.dayNamesShort,
			dayNames = (settings ? settings.dayNames : null) || this._defaults.dayNames,
			monthNamesShort = (settings ? settings.monthNamesShort : null) || this._defaults.monthNamesShort,
			monthNames = (settings ? settings.monthNames : null) || this._defaults.monthNames,
			// Check whether a format character is doubled
			lookAhead = function(match) {
				var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
				if (matches) {
					iFormat++;
				}
				return matches;
			},
			// Format a number, with leading zero if necessary
			formatNumber = function(match, value, len) {
				var num = "" + value;
				if (lookAhead(match)) {
					while (num.length < len) {
						num = "0" + num;
					}
				}
				return num;
			},
			// Format a name, short or long as requested
			formatName = function(match, value, shortNames, longNames) {
				return (lookAhead(match) ? longNames[value] : shortNames[value]);
			},
			output = "",
			literal = false;

		if (date) {
			for (iFormat = 0; iFormat < format.length; iFormat++) {
				if (literal) {
					if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
						literal = false;
					} else {
						output += format.charAt(iFormat);
					}
				} else {
					switch (format.charAt(iFormat)) {
						case "d":
							output += formatNumber("d", date.getDate(), 2);
							break;
						case "D":
							output += formatName("D", date.getDay(), dayNamesShort, dayNames);
							break;
						case "o":
							output += formatNumber("o",
								Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000), 3);
							break;
						case "m":
							output += formatNumber("m", date.getMonth() + 1, 2);
							break;
						case "M":
							output += formatName("M", date.getMonth(), monthNamesShort, monthNames);
							break;
						case "y":
							output += (lookAhead("y") ? date.getFullYear() :
								(date.getYear() % 100 < 10 ? "0" : "") + date.getYear() % 100);
							break;
						case "@":
							output += date.getTime();
							break;
						case "!":
							output += date.getTime() * 10000 + this._ticksTo1970;
							break;
						case "'":
							if (lookAhead("'")) {
								output += "'";
							} else {
								literal = true;
							}
							break;
						default:
							output += format.charAt(iFormat);
					}
				}
			}
		}
		return output;
	},

	/* Extract all possible characters from the date format. */
	_possibleChars: function (format) {
		var iFormat,
			chars = "",
			literal = false,
			// Check whether a format character is doubled
			lookAhead = function(match) {
				var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
				if (matches) {
					iFormat++;
				}
				return matches;
			};

		for (iFormat = 0; iFormat < format.length; iFormat++) {
			if (literal) {
				if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
					literal = false;
				} else {
					chars += format.charAt(iFormat);
				}
			} else {
				switch (format.charAt(iFormat)) {
					case "d": case "m": case "y": case "@":
						chars += "0123456789";
						break;
					case "D": case "M":
						return null; // Accept anything
					case "'":
						if (lookAhead("'")) {
							chars += "'";
						} else {
							literal = true;
						}
						break;
					default:
						chars += format.charAt(iFormat);
				}
			}
		}
		return chars;
	},

	/* Get a setting value, defaulting if necessary. */
	_get: function(inst, name) {
		return inst.settings[name] !== undefined ?
			inst.settings[name] : this._defaults[name];
	},

	/* Parse existing date and initialise date picker. */
	_setDateFromField: function(inst, noDefault) {
		if (inst.input.val() === inst.lastVal) {
			return;
		}

		var dateFormat = this._get(inst, "dateFormat"),
			dates = inst.lastVal = inst.input ? inst.input.val() : null,
			defaultDate = this._getDefaultDate(inst),
			date = defaultDate,
			settings = this._getFormatConfig(inst);

		try {
			date = this.parseDate(dateFormat, dates, settings) || defaultDate;
		} catch (event) {
			dates = (noDefault ? "" : dates);
		}
		inst.selectedDay = date.getDate();
		inst.drawMonth = inst.selectedMonth = date.getMonth();
		inst.drawYear = inst.selectedYear = date.getFullYear();
		inst.currentDay = (dates ? date.getDate() : 0);
		inst.currentMonth = (dates ? date.getMonth() : 0);
		inst.currentYear = (dates ? date.getFullYear() : 0);
		this._adjustInstDate(inst);
	},

	/* Retrieve the default date shown on opening. */
	_getDefaultDate: function(inst) {
		return this._restrictMinMax(inst,
			this._determineDate(inst, this._get(inst, "defaultDate"), new Date()));
	},

	/* A date may be specified as an exact value or a relative one. */
	_determineDate: function(inst, date, defaultDate) {
		var offsetNumeric = function(offset) {
				var date = new Date();
				date.setDate(date.getDate() + offset);
				return date;
			},
			offsetString = function(offset) {
				try {
					return $.datepicker.parseDate($.datepicker._get(inst, "dateFormat"),
						offset, $.datepicker._getFormatConfig(inst));
				}
				catch (e) {
					// Ignore
				}

				var date = (offset.toLowerCase().match(/^c/) ?
					$.datepicker._getDate(inst) : null) || new Date(),
					year = date.getFullYear(),
					month = date.getMonth(),
					day = date.getDate(),
					pattern = /([+\-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g,
					matches = pattern.exec(offset);

				while (matches) {
					switch (matches[2] || "d") {
						case "d" : case "D" :
							day += parseInt(matches[1],10); break;
						case "w" : case "W" :
							day += parseInt(matches[1],10) * 7; break;
						case "m" : case "M" :
							month += parseInt(matches[1],10);
							day = Math.min(day, $.datepicker._getDaysInMonth(year, month));
							break;
						case "y": case "Y" :
							year += parseInt(matches[1],10);
							day = Math.min(day, $.datepicker._getDaysInMonth(year, month));
							break;
					}
					matches = pattern.exec(offset);
				}
				return new Date(year, month, day);
			},
			newDate = (date == null || date === "" ? defaultDate : (typeof date === "string" ? offsetString(date) :
				(typeof date === "number" ? (isNaN(date) ? defaultDate : offsetNumeric(date)) : new Date(date.getTime()))));

		newDate = (newDate && newDate.toString() === "Invalid Date" ? defaultDate : newDate);
		if (newDate) {
			newDate.setHours(0);
			newDate.setMinutes(0);
			newDate.setSeconds(0);
			newDate.setMilliseconds(0);
		}
		return this._daylightSavingAdjust(newDate);
	},

	/* Handle switch to/from daylight saving.
	 * Hours may be non-zero on daylight saving cut-over:
	 * > 12 when midnight changeover, but then cannot generate
	 * midnight datetime, so jump to 1AM, otherwise reset.
	 * @param  date  (Date) the date to check
	 * @return  (Date) the corrected date
	 */
	_daylightSavingAdjust: function(date) {
		if (!date) {
			return null;
		}
		date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
		return date;
	},

	/* Set the date(s) directly. */
	_setDate: function(inst, date, noChange) {
		var clear = !date,
			origMonth = inst.selectedMonth,
			origYear = inst.selectedYear,
			newDate = this._restrictMinMax(inst, this._determineDate(inst, date, new Date()));

		inst.selectedDay = inst.currentDay = newDate.getDate();
		inst.drawMonth = inst.selectedMonth = inst.currentMonth = newDate.getMonth();
		inst.drawYear = inst.selectedYear = inst.currentYear = newDate.getFullYear();
		if ((origMonth !== inst.selectedMonth || origYear !== inst.selectedYear) && !noChange) {
			this._notifyChange(inst);
		}
		this._adjustInstDate(inst);
		if (inst.input) {
			inst.input.val(clear ? "" : this._formatDate(inst));
		}
	},

	/* Retrieve the date(s) directly. */
	_getDate: function(inst) {
		var startDate = (!inst.currentYear || (inst.input && inst.input.val() === "") ? null :
			this._daylightSavingAdjust(new Date(
			inst.currentYear, inst.currentMonth, inst.currentDay)));
			return startDate;
	},

	/* Attach the onxxx handlers.  These are declared statically so
	 * they work with static code transformers like Caja.
	 */
	_attachHandlers: function(inst) {
		var stepMonths = this._get(inst, "stepMonths"),
			id = "#" + inst.id.replace( /\\\\/g, "\\" );
		inst.dpDiv.find("[data-handler]").map(function () {
			var handler = {
				prev: function () {
					$.datepicker._adjustDate(id, -stepMonths, "M");
				},
				next: function () {
					$.datepicker._adjustDate(id, +stepMonths, "M");
				},
				hide: function () {
					$.datepicker._hideDatepicker();
				},
				today: function () {
					$.datepicker._gotoToday(id);
				},
				selectDay: function () {
					$.datepicker._selectDay(id, +this.getAttribute("data-month"), +this.getAttribute("data-year"), this);
					return false;
				},
				selectMonth: function () {
					$.datepicker._selectMonthYear(id, this, "M");
					return false;
				},
				selectYear: function () {
					$.datepicker._selectMonthYear(id, this, "Y");
					return false;
				}
			};
			$(this).bind(this.getAttribute("data-event"), handler[this.getAttribute("data-handler")]);
		});
	},

	/* Generate the HTML for the current state of the date picker. */
	_generateHTML: function(inst) {
        $().log('Original generate html function!');
		var maxDraw, prevText, prev, nextText, next, currentText, gotoDate,
			controls, buttonPanel, firstDay, showWeek, dayNames, dayNamesMin,
			monthNames, monthNamesShort, beforeShowDay, showOtherMonths,
			selectOtherMonths, defaultDate, html, dow, row, group, col, selectedDate,
			cornerClass, calender, thead, day, daysInMonth, leadDays, curRows, numRows,
			printDate, dRow, tbody, daySettings, otherMonth, unselectable,
			tempDate = new Date(),
			today = this._daylightSavingAdjust(
				new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate())), // clear time
			isRTL = this._get(inst, "isRTL"),
			showButtonPanel = this._get(inst, "showButtonPanel"),
			hideIfNoPrevNext = this._get(inst, "hideIfNoPrevNext"),
			navigationAsDateFormat = this._get(inst, "navigationAsDateFormat"),
			numMonths = this._getNumberOfMonths(inst),
			showCurrentAtPos = this._get(inst, "showCurrentAtPos"),
			stepMonths = this._get(inst, "stepMonths"),
			isMultiMonth = (numMonths[0] !== 1 || numMonths[1] !== 1),
			currentDate = this._daylightSavingAdjust((!inst.currentDay ? new Date(9999, 9, 9) :
				new Date(inst.currentYear, inst.currentMonth, inst.currentDay))),
			minDate = this._getMinMaxDate(inst, "min"),
			maxDate = this._getMinMaxDate(inst, "max"),
			drawMonth = inst.drawMonth - showCurrentAtPos,
			drawYear = inst.drawYear;

		if (drawMonth < 0) {
			drawMonth += 12;
			drawYear--;
		}
		if (maxDate) {
			maxDraw = this._daylightSavingAdjust(new Date(maxDate.getFullYear(),
				maxDate.getMonth() - (numMonths[0] * numMonths[1]) + 1, maxDate.getDate()));
			maxDraw = (minDate && maxDraw < minDate ? minDate : maxDraw);
			while (this._daylightSavingAdjust(new Date(drawYear, drawMonth, 1)) > maxDraw) {
				drawMonth--;
				if (drawMonth < 0) {
					drawMonth = 11;
					drawYear--;
				}
			}
		}
		inst.drawMonth = drawMonth;
		inst.drawYear = drawYear;

		prevText = this._get(inst, "prevText");
		prevText = (!navigationAsDateFormat ? prevText : this.formatDate(prevText,
			this._daylightSavingAdjust(new Date(drawYear, drawMonth - stepMonths, 1)),
			this._getFormatConfig(inst)));

		prev = (this._canAdjustMonth(inst, -1, drawYear, drawMonth) ?
			"<a class='ui-datepicker-prev ui-corner-all' data-handler='prev' data-event='click'" +
			" title='" + prevText + "'><span class='ui-icon ui-icon-circle-triangle-" + ( isRTL ? "e" : "w") + "'>" + prevText + "</span></a>" :
			(hideIfNoPrevNext ? "" : "<a class='ui-datepicker-prev ui-corner-all ui-state-disabled' title='"+ prevText +"'><span class='ui-icon ui-icon-circle-triangle-" + ( isRTL ? "e" : "w") + "'>" + prevText + "</span></a>"));

		nextText = this._get(inst, "nextText");
		nextText = (!navigationAsDateFormat ? nextText : this.formatDate(nextText,
			this._daylightSavingAdjust(new Date(drawYear, drawMonth + stepMonths, 1)),
			this._getFormatConfig(inst)));

		next = (this._canAdjustMonth(inst, +1, drawYear, drawMonth) ?
			"<a class='ui-datepicker-next ui-corner-all' data-handler='next' data-event='click'" +
			" title='" + nextText + "'><span class='ui-icon ui-icon-circle-triangle-" + ( isRTL ? "w" : "e") + "'>" + nextText + "</span></a>" :
			(hideIfNoPrevNext ? "" : "<a class='ui-datepicker-next ui-corner-all ui-state-disabled' title='"+ nextText + "'><span class='ui-icon ui-icon-circle-triangle-" + ( isRTL ? "w" : "e") + "'>" + nextText + "</span></a>"));

		currentText = this._get(inst, "currentText");
		gotoDate = (this._get(inst, "gotoCurrent") && inst.currentDay ? currentDate : today);
		currentText = (!navigationAsDateFormat ? currentText :
			this.formatDate(currentText, gotoDate, this._getFormatConfig(inst)));

		controls = (!inst.inline ? "<button type='button' class='ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all' data-handler='hide' data-event='click'>" +
			this._get(inst, "closeText") + "</button>" : "");

		buttonPanel = (showButtonPanel) ? "<div class='ui-datepicker-buttonpane ui-widget-content'>" + (isRTL ? controls : "") +
			(this._isInRange(inst, gotoDate) ? "<button type='button' class='ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all' data-handler='today' data-event='click'" +
			">" + currentText + "</button>" : "") + (isRTL ? "" : controls) + "</div>" : "";

		firstDay = parseInt(this._get(inst, "firstDay"),10);
		firstDay = (isNaN(firstDay) ? 0 : firstDay);

		showWeek = this._get(inst, "showWeek");
		dayNames = this._get(inst, "dayNames");
		dayNamesMin = this._get(inst, "dayNamesMin");
		monthNames = this._get(inst, "monthNames");
		monthNamesShort = this._get(inst, "monthNamesShort");
		beforeShowDay = this._get(inst, "beforeShowDay");
		showOtherMonths = this._get(inst, "showOtherMonths");
		selectOtherMonths = this._get(inst, "selectOtherMonths");
		defaultDate = this._getDefaultDate(inst);
		html = "";
		dow;
		for (row = 0; row < numMonths[0]; row++) {
			group = "";
			this.maxRows = 4;
			for (col = 0; col < numMonths[1]; col++) {
				selectedDate = this._daylightSavingAdjust(new Date(drawYear, drawMonth, inst.selectedDay));
				cornerClass = " ui-corner-all";
				calender = "";
				if (isMultiMonth) {
					calender += "<div class='ui-datepicker-group";
					if (numMonths[1] > 1) {
						switch (col) {
							case 0: calender += " ui-datepicker-group-first";
								cornerClass = " ui-corner-" + (isRTL ? "right" : "left"); break;
							case numMonths[1]-1: calender += " ui-datepicker-group-last";
								cornerClass = " ui-corner-" + (isRTL ? "left" : "right"); break;
							default: calender += " ui-datepicker-group-middle"; cornerClass = ""; break;
						}
					}
					calender += "'>";
				}
				calender += "<div class='ui-datepicker-header ui-widget-header ui-helper-clearfix" + cornerClass + "'>" +
					(/all|left/.test(cornerClass) && row === 0 ? (isRTL ? next : prev) : "") +
					(/all|right/.test(cornerClass) && row === 0 ? (isRTL ? prev : next) : "") +
					this._generateMonthYearHeader(inst, drawMonth, drawYear, minDate, maxDate,
					row > 0 || col > 0, monthNames, monthNamesShort) + // draw month headers
					"</div><table class='ui-datepicker-calendar'><thead>" +
					"<tr>";
				thead = (showWeek ? "<th class='ui-datepicker-week-col'>" + this._get(inst, "weekHeader") + "</th>" : "");
				for (dow = 0; dow < 7; dow++) { // days of the week
					day = (dow + firstDay) % 7;
					thead += "<th" + ((dow + firstDay + 6) % 7 >= 5 ? " class='ui-datepicker-week-end'" : "") + ">" +
						"<span title='" + dayNames[day] + "'>" + dayNamesMin[day] + "</span></th>";
				}
				calender += thead + "</tr></thead><tbody>";
				daysInMonth = this._getDaysInMonth(drawYear, drawMonth);
				if (drawYear === inst.selectedYear && drawMonth === inst.selectedMonth) {
					inst.selectedDay = Math.min(inst.selectedDay, daysInMonth);
				}
				leadDays = (this._getFirstDayOfMonth(drawYear, drawMonth) - firstDay + 7) % 7;
				curRows = Math.ceil((leadDays + daysInMonth) / 7); // calculate the number of rows to generate
				numRows = (isMultiMonth ? this.maxRows > curRows ? this.maxRows : curRows : curRows); //If multiple months, use the higher number of rows (see #7043)
				this.maxRows = numRows;
				printDate = this._daylightSavingAdjust(new Date(drawYear, drawMonth, 1 - leadDays));
				for (dRow = 0; dRow < numRows; dRow++) { // create date picker rows
					calender += "<tr>";
					tbody = (!showWeek ? "" : "<td class='ui-datepicker-week-col'>" +
						this._get(inst, "calculateWeek")(printDate) + "</td>");
					for (dow = 0; dow < 7; dow++) { // create date picker days
						daySettings = (beforeShowDay ?
							beforeShowDay.apply((inst.input ? inst.input[0] : null), [printDate]) : [true, ""]);
						otherMonth = (printDate.getMonth() !== drawMonth);
						unselectable = (otherMonth && !selectOtherMonths) || !daySettings[0] ||
							(minDate && printDate < minDate) || (maxDate && printDate > maxDate);
						tbody += "<td class='" +
							((dow + firstDay + 6) % 7 >= 5 ? " ui-datepicker-week-end" : "") + // highlight weekends
							(otherMonth ? " ui-datepicker-other-month" : "") + // highlight days from other months
							((printDate.getTime() === selectedDate.getTime() && drawMonth === inst.selectedMonth && inst._keyEvent) || // user pressed key
							(defaultDate.getTime() === printDate.getTime() && defaultDate.getTime() === selectedDate.getTime()) ?
							// or defaultDate is current printedDate and defaultDate is selectedDate
							" " + this._dayOverClass : "") + // highlight selected day
							(unselectable ? " " + this._unselectableClass + " ui-state-disabled": "") +  // highlight unselectable days
							(otherMonth && !showOtherMonths ? "" : " " + daySettings[1] + // highlight custom dates
							(printDate.getTime() === currentDate.getTime() ? " " + this._currentClass : "") + // highlight selected day
							(printDate.getTime() === today.getTime() ? " ui-datepicker-today" : "")) + "'" + // highlight today (if different)
							((!otherMonth || showOtherMonths) && daySettings[2] ? " title='" + daySettings[2].replace(/'/g, "&#39;") + "'" : "") + // cell title
							(unselectable ? "" : " data-handler='selectDay' data-event='click' data-month='" + printDate.getMonth() + "' data-year='" + printDate.getFullYear() + "'") + ">" + // actions
							(otherMonth && !showOtherMonths ? "&#xa0;" : // display for other months
							(unselectable ? "<span class='ui-state-default'>" + printDate.getDate() + "</span>" : "<a class='ui-state-default" +
							(printDate.getTime() === today.getTime() ? " ui-state-highlight" : "") +
							(printDate.getTime() === currentDate.getTime() ? " ui-state-active" : "") + // highlight selected day
							(otherMonth ? " ui-priority-secondary" : "") + // distinguish dates from other months
							"' href='#'>" + printDate.getDate() + "</a>")) + "</td>"; // display selectable date
						printDate.setDate(printDate.getDate() + 1);
						printDate = this._daylightSavingAdjust(printDate);
					}
					calender += tbody + "</tr>";
				}
				drawMonth++;
				if (drawMonth > 11) {
					drawMonth = 0;
					drawYear++;
				}
				calender += "</tbody></table>" + (isMultiMonth ? "</div>" +
							((numMonths[0] > 0 && col === numMonths[1]-1) ? "<div class='ui-datepicker-row-break'></div>" : "") : "");
				group += calender;
			}
			html += group;
		}
		html += buttonPanel;
		inst._keyEvent = false;
		return html;
	},

	/* Generate the month and year header. */
	_generateMonthYearHeader: function(inst, drawMonth, drawYear, minDate, maxDate,
			secondary, monthNames, monthNamesShort) {

		var inMinYear, inMaxYear, month, years, thisYear, determineYear, year, endYear,
			changeMonth = this._get(inst, "changeMonth"),
			changeYear = this._get(inst, "changeYear"),
			showMonthAfterYear = this._get(inst, "showMonthAfterYear"),
			html = "<div class='ui-datepicker-title'>",
			monthHtml = "";

		// month selection
		if (secondary || !changeMonth) {
			monthHtml += "<span class='ui-datepicker-month'>" + monthNames[drawMonth] + "</span>";
		} else {
			inMinYear = (minDate && minDate.getFullYear() === drawYear);
			inMaxYear = (maxDate && maxDate.getFullYear() === drawYear);
			monthHtml += "<select class='ui-datepicker-month' data-handler='selectMonth' data-event='change'>";
			for ( month = 0; month < 12; month++) {
				if ((!inMinYear || month >= minDate.getMonth()) && (!inMaxYear || month <= maxDate.getMonth())) {
					monthHtml += "<option value='" + month + "'" +
						(month === drawMonth ? " selected='selected'" : "") +
						">" + monthNamesShort[month] + "</option>";
				}
			}
			monthHtml += "</select>";
		}

		if (!showMonthAfterYear) {
			html += monthHtml + (secondary || !(changeMonth && changeYear) ? "&#xa0;" : "");
		}

		// year selection
		if ( !inst.yearshtml ) {
			inst.yearshtml = "";
			if (secondary || !changeYear) {
				html += "<span class='ui-datepicker-year'>" + drawYear + "</span>";
			} else {
				// determine range of years to display
				years = this._get(inst, "yearRange").split(":");
				thisYear = new Date().getFullYear();
				determineYear = function(value) {
					var year = (value.match(/c[+\-].*/) ? drawYear + parseInt(value.substring(1), 10) :
						(value.match(/[+\-].*/) ? thisYear + parseInt(value, 10) :
						parseInt(value, 10)));
					return (isNaN(year) ? thisYear : year);
				};
				year = determineYear(years[0]);
				endYear = Math.max(year, determineYear(years[1] || ""));
				year = (minDate ? Math.max(year, minDate.getFullYear()) : year);
				endYear = (maxDate ? Math.min(endYear, maxDate.getFullYear()) : endYear);
				inst.yearshtml += "<select class='ui-datepicker-year' data-handler='selectYear' data-event='change'>";
				for (; year <= endYear; year++) {
					inst.yearshtml += "<option value='" + year + "'" +
						(year === drawYear ? " selected='selected'" : "") +
						">" + year + "</option>";
				}
				inst.yearshtml += "</select>";

				html += inst.yearshtml;
				inst.yearshtml = null;
			}
		}

		html += this._get(inst, "yearSuffix");
		if (showMonthAfterYear) {
			html += (secondary || !(changeMonth && changeYear) ? "&#xa0;" : "") + monthHtml;
		}
		html += "</div>"; // Close datepicker_header
		return html;
	},

	/* Adjust one of the date sub-fields. */
	_adjustInstDate: function(inst, offset, period) {
		var year = inst.drawYear + (period === "Y" ? offset : 0),
			month = inst.drawMonth + (period === "M" ? offset : 0),
			day = Math.min(inst.selectedDay, this._getDaysInMonth(year, month)) + (period === "D" ? offset : 0),
			date = this._restrictMinMax(inst, this._daylightSavingAdjust(new Date(year, month, day)));

		inst.selectedDay = date.getDate();
		inst.drawMonth = inst.selectedMonth = date.getMonth();
		inst.drawYear = inst.selectedYear = date.getFullYear();
		if (period === "M" || period === "Y") {
			this._notifyChange(inst);
		}
	},

	/* Ensure a date is within any min/max bounds. */
	_restrictMinMax: function(inst, date) {
		var minDate = this._getMinMaxDate(inst, "min"),
			maxDate = this._getMinMaxDate(inst, "max"),
			newDate = (minDate && date < minDate ? minDate : date);
		return (maxDate && newDate > maxDate ? maxDate : newDate);
	},

	/* Notify change of month/year. */
	_notifyChange: function(inst) {
		var onChange = this._get(inst, "onChangeMonthYear");
		if (onChange) {
			onChange.apply((inst.input ? inst.input[0] : null),
				[inst.selectedYear, inst.selectedMonth + 1, inst]);
		}
	},

	/* Determine the number of months to show. */
	_getNumberOfMonths: function(inst) {
		var numMonths = this._get(inst, "numberOfMonths");
		return (numMonths == null ? [1, 1] : (typeof numMonths === "number" ? [1, numMonths] : numMonths));
	},

	/* Determine the current maximum date - ensure no time components are set. */
	_getMinMaxDate: function(inst, minMax) {
		return this._determineDate(inst, this._get(inst, minMax + "Date"), null);
	},

	/* Find the number of days in a given month. */
	_getDaysInMonth: function(year, month) {
		return 32 - this._daylightSavingAdjust(new Date(year, month, 32)).getDate();
	},

	/* Find the day of the week of the first of a month. */
	_getFirstDayOfMonth: function(year, month) {
		return new Date(year, month, 1).getDay();
	},

	/* Determines if we should allow a "next/prev" month display change. */
	_canAdjustMonth: function(inst, offset, curYear, curMonth) {
		var numMonths = this._getNumberOfMonths(inst),
			date = this._daylightSavingAdjust(new Date(curYear,
			curMonth + (offset < 0 ? offset : numMonths[0] * numMonths[1]), 1));

		if (offset < 0) {
			date.setDate(this._getDaysInMonth(date.getFullYear(), date.getMonth()));
		}
		return this._isInRange(inst, date);
	},

	/* Is the given date in the accepted range? */
	_isInRange: function(inst, date) {
		var yearSplit, currentYear,
			minDate = this._getMinMaxDate(inst, "min"),
			maxDate = this._getMinMaxDate(inst, "max"),
			minYear = null,
			maxYear = null,
			years = this._get(inst, "yearRange");
			if (years){
				yearSplit = years.split(":");
				currentYear = new Date().getFullYear();
				minYear = parseInt(yearSplit[0], 10);
				maxYear = parseInt(yearSplit[1], 10);
				if ( yearSplit[0].match(/[+\-].*/) ) {
					minYear += currentYear;
				}
				if ( yearSplit[1].match(/[+\-].*/) ) {
					maxYear += currentYear;
				}
			}

		return ((!minDate || date.getTime() >= minDate.getTime()) &&
			(!maxDate || date.getTime() <= maxDate.getTime()) &&
			(!minYear || date.getFullYear() >= minYear) &&
			(!maxYear || date.getFullYear() <= maxYear));
	},

	/* Provide the configuration settings for formatting/parsing. */
	_getFormatConfig: function(inst) {
		var shortYearCutoff = this._get(inst, "shortYearCutoff");
		shortYearCutoff = (typeof shortYearCutoff !== "string" ? shortYearCutoff :
			new Date().getFullYear() % 100 + parseInt(shortYearCutoff, 10));
		return {shortYearCutoff: shortYearCutoff,
			dayNamesShort: this._get(inst, "dayNamesShort"), dayNames: this._get(inst, "dayNames"),
			monthNamesShort: this._get(inst, "monthNamesShort"), monthNames: this._get(inst, "monthNames")};
	},

	/* Format the given date for display. */
	_formatDate: function(inst, day, month, year) {
		if (!day) {
			inst.currentDay = inst.selectedDay;
			inst.currentMonth = inst.selectedMonth;
			inst.currentYear = inst.selectedYear;
		}
		var date = (day ? (typeof day === "object" ? day :
			this._daylightSavingAdjust(new Date(year, month, day))) :
			this._daylightSavingAdjust(new Date(inst.currentYear, inst.currentMonth, inst.currentDay)));
		return this.formatDate(this._get(inst, "dateFormat"), date, this._getFormatConfig(inst));
	}
});

/*
 * Bind hover events for datepicker elements.
 * Done via delegate so the binding only occurs once in the lifetime of the parent div.
 * Global instActive, set by _updateDatepicker allows the handlers to find their way back to the active picker.
 */
function bindHover(dpDiv) {
	var selector = "button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a";
	return dpDiv.delegate(selector, "mouseout", function() {
			$(this).removeClass("ui-state-hover");
			if (this.className.indexOf("ui-datepicker-prev") !== -1) {
				$(this).removeClass("ui-datepicker-prev-hover");
			}
			if (this.className.indexOf("ui-datepicker-next") !== -1) {
				$(this).removeClass("ui-datepicker-next-hover");
			}
		})
		.delegate(selector, "mouseover", function(){
			if (!$.datepicker._isDisabledDatepicker( instActive.inline ? dpDiv.parent()[0] : instActive.input[0])) {
				$(this).parents(".ui-datepicker-calendar").find("a").removeClass("ui-state-hover");
				$(this).addClass("ui-state-hover");
				if (this.className.indexOf("ui-datepicker-prev") !== -1) {
					$(this).addClass("ui-datepicker-prev-hover");
				}
				if (this.className.indexOf("ui-datepicker-next") !== -1) {
					$(this).addClass("ui-datepicker-next-hover");
				}
			}
		});
}

/* jQuery extend now ignores nulls! */
function extendRemove(target, props) {
	$.extend(target, props);
	for (var name in props) {
		if (props[name] == null) {
			target[name] = props[name];
		}
	}
	return target;
}

/* Invoke the datepicker functionality.
   @param  options  string - a command, optionally followed by additional parameters or
					Object - settings for attaching new datepicker functionality
   @return  jQuery object */
$.fn.datepicker = function(options){

	/* Verify an empty collection wasn't passed - Fixes #6976 */
	if ( !this.length ) {
		return this;
	}

	/* Initialise the date picker. */
	if (!$.datepicker.initialized) {
		$(document).mousedown($.datepicker._checkExternalClick);
		$.datepicker.initialized = true;
	}

	/* Append datepicker main container to body if not exist. */
	if ($("#"+$.datepicker._mainDivId).length === 0) {
		$("body").append($.datepicker.dpDiv);
	}

	var otherArgs = Array.prototype.slice.call(arguments, 1);
	if (typeof options === "string" && (options === "isDisabled" || options === "getDate" || options === "widget")) {
		return $.datepicker["_" + options + "Datepicker"].
			apply($.datepicker, [this[0]].concat(otherArgs));
	}
	if (options === "option" && arguments.length === 2 && typeof arguments[1] === "string") {
		return $.datepicker["_" + options + "Datepicker"].
			apply($.datepicker, [this[0]].concat(otherArgs));
	}
	return this.each(function() {
		typeof options === "string" ?
			$.datepicker["_" + options + "Datepicker"].
				apply($.datepicker, [this].concat(otherArgs)) :
			$.datepicker._attachDatepicker(this, options);
	});
};

$.datepicker = new Datepicker(); // singleton instance
$.datepicker.initialized = false;
$.datepicker.uuid = new Date().getTime();
$.datepicker.version = "1.10.4";

})(jQuery);
(function( $, undefined ) {

var sizeRelatedOptions = {
		buttons: true,
		height: true,
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true,
		width: true
	},
	resizableRelatedOptions = {
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true
	};

$.widget( "ui.dialog", {
	version: "1.10.4",
	options: {
		appendTo: "body",
		autoOpen: true,
		buttons: [],
		closeOnEscape: true,
		closeText: "close",
		dialogClass: "",
		draggable: true,
		hide: null,
		height: "auto",
		maxHeight: null,
		maxWidth: null,
		minHeight: 150,
		minWidth: 150,
		modal: false,
		position: {
			my: "center",
			at: "center",
			of: window,
			collision: "fit",
			// Ensure the titlebar is always visible
			using: function( pos ) {
				var topOffset = $( this ).css( pos ).offset().top;
				if ( topOffset < 0 ) {
					$( this ).css( "top", pos.top - topOffset );
				}
			}
		},
		resizable: true,
		show: null,
		title: null,
		width: 300,

		// callbacks
		beforeClose: null,
		close: null,
		drag: null,
		dragStart: null,
		dragStop: null,
		focus: null,
		open: null,
		resize: null,
		resizeStart: null,
		resizeStop: null
	},

	_create: function() {
		this.originalCss = {
			display: this.element[0].style.display,
			width: this.element[0].style.width,
			minHeight: this.element[0].style.minHeight,
			maxHeight: this.element[0].style.maxHeight,
			height: this.element[0].style.height
		};
		this.originalPosition = {
			parent: this.element.parent(),
			index: this.element.parent().children().index( this.element )
		};
		this.originalTitle = this.element.attr("title");
		this.options.title = this.options.title || this.originalTitle;

		this._createWrapper();

		this.element
			.show()
			.removeAttr("title")
			.addClass("ui-dialog-content ui-widget-content")
			.appendTo( this.uiDialog );

		this._createTitlebar();
		this._createButtonPane();

		if ( this.options.draggable && $.fn.draggable ) {
			this._makeDraggable();
		}
		if ( this.options.resizable && $.fn.resizable ) {
			this._makeResizable();
		}

		this._isOpen = false;
	},

	_init: function() {
		if ( this.options.autoOpen ) {
			this.open();
		}
	},

	_appendTo: function() {
		var element = this.options.appendTo;
		if ( element && (element.jquery || element.nodeType) ) {
			return $( element );
		}
		return this.document.find( element || "body" ).eq( 0 );
	},

	_destroy: function() {
		var next,
			originalPosition = this.originalPosition;

		this._destroyOverlay();

		this.element
			.removeUniqueId()
			.removeClass("ui-dialog-content ui-widget-content")
			.css( this.originalCss )
			// Without detaching first, the following becomes really slow
			.detach();

		this.uiDialog.stop( true, true ).remove();

		if ( this.originalTitle ) {
			this.element.attr( "title", this.originalTitle );
		}

		next = originalPosition.parent.children().eq( originalPosition.index );
		// Don't try to place the dialog next to itself (#8613)
		if ( next.length && next[0] !== this.element[0] ) {
			next.before( this.element );
		} else {
			originalPosition.parent.append( this.element );
		}
	},

	widget: function() {
		return this.uiDialog;
	},

	disable: $.noop,
	enable: $.noop,

	close: function( event ) {
		var activeElement,
			that = this;

		if ( !this._isOpen || this._trigger( "beforeClose", event ) === false ) {
			return;
		}

		this._isOpen = false;
		this._destroyOverlay();

		if ( !this.opener.filter(":focusable").focus().length ) {

			// support: IE9
			// IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
			try {
				activeElement = this.document[ 0 ].activeElement;

				// Support: IE9, IE10
				// If the <body> is blurred, IE will switch windows, see #4520
				if ( activeElement && activeElement.nodeName.toLowerCase() !== "body" ) {

					// Hiding a focused element doesn't trigger blur in WebKit
					// so in case we have nothing to focus on, explicitly blur the active element
					// https://bugs.webkit.org/show_bug.cgi?id=47182
					$( activeElement ).blur();
				}
			} catch ( error ) {}
		}

		this._hide( this.uiDialog, this.options.hide, function() {
			that._trigger( "close", event );
		});
	},

	isOpen: function() {
		return this._isOpen;
	},

	moveToTop: function() {
		this._moveToTop();
	},

	_moveToTop: function( event, silent ) {
		var moved = !!this.uiDialog.nextAll(":visible").insertBefore( this.uiDialog ).length;
		if ( moved && !silent ) {
			this._trigger( "focus", event );
		}
		return moved;
	},

	open: function() {
		var that = this;
		if ( this._isOpen ) {
			if ( this._moveToTop() ) {
				this._focusTabbable();
			}
			return;
		}

		this._isOpen = true;
		this.opener = $( this.document[0].activeElement );

		this._size();
		this._position();
		this._createOverlay();
		this._moveToTop( null, true );
		this._show( this.uiDialog, this.options.show, function() {
			that._focusTabbable();
			that._trigger("focus");
		});

		this._trigger("open");
	},

	_focusTabbable: function() {
		// Set focus to the first match:
		// 1. First element inside the dialog matching [autofocus]
		// 2. Tabbable element inside the content element
		// 3. Tabbable element inside the buttonpane
		// 4. The close button
		// 5. The dialog itself
		var hasFocus = this.element.find("[autofocus]");
		if ( !hasFocus.length ) {
			hasFocus = this.element.find(":tabbable");
		}
		if ( !hasFocus.length ) {
			hasFocus = this.uiDialogButtonPane.find(":tabbable");
		}
		if ( !hasFocus.length ) {
			hasFocus = this.uiDialogTitlebarClose.filter(":tabbable");
		}
		if ( !hasFocus.length ) {
			hasFocus = this.uiDialog;
		}
		hasFocus.eq( 0 ).focus();
	},

	_keepFocus: function( event ) {
		function checkFocus() {
			var activeElement = this.document[0].activeElement,
				isActive = this.uiDialog[0] === activeElement ||
					$.contains( this.uiDialog[0], activeElement );
			if ( !isActive ) {
				this._focusTabbable();
			}
		}
		event.preventDefault();
		checkFocus.call( this );
		// support: IE
		// IE <= 8 doesn't prevent moving focus even with event.preventDefault()
		// so we check again later
		this._delay( checkFocus );
	},

	_createWrapper: function() {
		this.uiDialog = $("<div>")
			.addClass( "ui-dialog ui-widget ui-widget-content ui-corner-all ui-front " +
				this.options.dialogClass )
			.hide()
			.attr({
				// Setting tabIndex makes the div focusable
				tabIndex: -1,
				role: "dialog"
			})
			.appendTo( this._appendTo() );

		this._on( this.uiDialog, {
			keydown: function( event ) {
				if ( this.options.closeOnEscape && !event.isDefaultPrevented() && event.keyCode &&
						event.keyCode === $.ui.keyCode.ESCAPE ) {
					event.preventDefault();
					this.close( event );
					return;
				}

				// prevent tabbing out of dialogs
				if ( event.keyCode !== $.ui.keyCode.TAB ) {
					return;
				}
				var tabbables = this.uiDialog.find(":tabbable"),
					first = tabbables.filter(":first"),
					last  = tabbables.filter(":last");

				if ( ( event.target === last[0] || event.target === this.uiDialog[0] ) && !event.shiftKey ) {
					first.focus( 1 );
					event.preventDefault();
				} else if ( ( event.target === first[0] || event.target === this.uiDialog[0] ) && event.shiftKey ) {
					last.focus( 1 );
					event.preventDefault();
				}
			},
			mousedown: function( event ) {
				if ( this._moveToTop( event ) ) {
					this._focusTabbable();
				}
			}
		});

		// We assume that any existing aria-describedby attribute means
		// that the dialog content is marked up properly
		// otherwise we brute force the content as the description
		if ( !this.element.find("[aria-describedby]").length ) {
			this.uiDialog.attr({
				"aria-describedby": this.element.uniqueId().attr("id")
			});
		}
	},

	_createTitlebar: function() {
		var uiDialogTitle;

		this.uiDialogTitlebar = $("<div>")
			.addClass("ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix")
			.prependTo( this.uiDialog );
		this._on( this.uiDialogTitlebar, {
			mousedown: function( event ) {
				// Don't prevent click on close button (#8838)
				// Focusing a dialog that is partially scrolled out of view
				// causes the browser to scroll it into view, preventing the click event
				if ( !$( event.target ).closest(".ui-dialog-titlebar-close") ) {
					// Dialog isn't getting focus when dragging (#8063)
					this.uiDialog.focus();
				}
			}
		});

		// support: IE
		// Use type="button" to prevent enter keypresses in textboxes from closing the
		// dialog in IE (#9312)
		this.uiDialogTitlebarClose = $( "<button type='button'></button>" )
			.button({
				label: this.options.closeText,
				icons: {
					primary: "ui-icon-closethick"
				},
				text: false
			})
			.addClass("ui-dialog-titlebar-close")
			.appendTo( this.uiDialogTitlebar );
		this._on( this.uiDialogTitlebarClose, {
			click: function( event ) {
				event.preventDefault();
				this.close( event );
			}
		});

		uiDialogTitle = $("<span>")
			.uniqueId()
			.addClass("ui-dialog-title")
			.prependTo( this.uiDialogTitlebar );
		this._title( uiDialogTitle );

		this.uiDialog.attr({
			"aria-labelledby": uiDialogTitle.attr("id")
		});
	},

	_title: function( title ) {
		if ( !this.options.title ) {
			title.html("&#160;");
		}
		title.text( this.options.title );
	},

	_createButtonPane: function() {
		this.uiDialogButtonPane = $("<div>")
			.addClass("ui-dialog-buttonpane ui-widget-content ui-helper-clearfix");

		this.uiButtonSet = $("<div>")
			.addClass("ui-dialog-buttonset")
			.appendTo( this.uiDialogButtonPane );

		this._createButtons();
	},

	_createButtons: function() {
		var that = this,
			buttons = this.options.buttons;

		// if we already have a button pane, remove it
		this.uiDialogButtonPane.remove();
		this.uiButtonSet.empty();

		if ( $.isEmptyObject( buttons ) || ($.isArray( buttons ) && !buttons.length) ) {
			this.uiDialog.removeClass("ui-dialog-buttons");
			return;
		}

		$.each( buttons, function( name, props ) {
			var click, buttonOptions;
			props = $.isFunction( props ) ?
				{ click: props, text: name } :
				props;
			// Default to a non-submitting button
			props = $.extend( { type: "button" }, props );
			// Change the context for the click callback to be the main element
			click = props.click;
			props.click = function() {
				click.apply( that.element[0], arguments );
			};
			buttonOptions = {
				icons: props.icons,
				text: props.showText
			};
			delete props.icons;
			delete props.showText;
			$( "<button></button>", props )
				.button( buttonOptions )
				.appendTo( that.uiButtonSet );
		});
		this.uiDialog.addClass("ui-dialog-buttons");
		this.uiDialogButtonPane.appendTo( this.uiDialog );
	},

	_makeDraggable: function() {
		var that = this,
			options = this.options;

		function filteredUi( ui ) {
			return {
				position: ui.position,
				offset: ui.offset
			};
		}

		this.uiDialog.draggable({
			cancel: ".ui-dialog-content, .ui-dialog-titlebar-close",
			handle: ".ui-dialog-titlebar",
			containment: "document",
			start: function( event, ui ) {
				$( this ).addClass("ui-dialog-dragging");
				that._blockFrames();
				that._trigger( "dragStart", event, filteredUi( ui ) );
			},
			drag: function( event, ui ) {
				that._trigger( "drag", event, filteredUi( ui ) );
			},
			stop: function( event, ui ) {
				options.position = [
					ui.position.left - that.document.scrollLeft(),
					ui.position.top - that.document.scrollTop()
				];
				$( this ).removeClass("ui-dialog-dragging");
				that._unblockFrames();
				that._trigger( "dragStop", event, filteredUi( ui ) );
			}
		});
	},

	_makeResizable: function() {
		var that = this,
			options = this.options,
			handles = options.resizable,
			// .ui-resizable has position: relative defined in the stylesheet
			// but dialogs have to use absolute or fixed positioning
			position = this.uiDialog.css("position"),
			resizeHandles = typeof handles === "string" ?
				handles	:
				"n,e,s,w,se,sw,ne,nw";

		function filteredUi( ui ) {
			return {
				originalPosition: ui.originalPosition,
				originalSize: ui.originalSize,
				position: ui.position,
				size: ui.size
			};
		}

		this.uiDialog.resizable({
			cancel: ".ui-dialog-content",
			containment: "document",
			alsoResize: this.element,
			maxWidth: options.maxWidth,
			maxHeight: options.maxHeight,
			minWidth: options.minWidth,
			minHeight: this._minHeight(),
			handles: resizeHandles,
			start: function( event, ui ) {
				$( this ).addClass("ui-dialog-resizing");
				that._blockFrames();
				that._trigger( "resizeStart", event, filteredUi( ui ) );
			},
			resize: function( event, ui ) {
				that._trigger( "resize", event, filteredUi( ui ) );
			},
			stop: function( event, ui ) {
				options.height = $( this ).height();
				options.width = $( this ).width();
				$( this ).removeClass("ui-dialog-resizing");
				that._unblockFrames();
				that._trigger( "resizeStop", event, filteredUi( ui ) );
			}
		})
		.css( "position", position );
	},

	_minHeight: function() {
		var options = this.options;

		return options.height === "auto" ?
			options.minHeight :
			Math.min( options.minHeight, options.height );
	},

	_position: function() {
		// Need to show the dialog to get the actual offset in the position plugin
		var isVisible = this.uiDialog.is(":visible");
		if ( !isVisible ) {
			this.uiDialog.show();
		}
		this.uiDialog.position( this.options.position );
		if ( !isVisible ) {
			this.uiDialog.hide();
		}
	},

	_setOptions: function( options ) {
		var that = this,
			resize = false,
			resizableOptions = {};

		$.each( options, function( key, value ) {
			that._setOption( key, value );

			if ( key in sizeRelatedOptions ) {
				resize = true;
			}
			if ( key in resizableRelatedOptions ) {
				resizableOptions[ key ] = value;
			}
		});

		if ( resize ) {
			this._size();
			this._position();
		}
		if ( this.uiDialog.is(":data(ui-resizable)") ) {
			this.uiDialog.resizable( "option", resizableOptions );
		}
	},

	_setOption: function( key, value ) {
		var isDraggable, isResizable,
			uiDialog = this.uiDialog;

		if ( key === "dialogClass" ) {
			uiDialog
				.removeClass( this.options.dialogClass )
				.addClass( value );
		}

		if ( key === "disabled" ) {
			return;
		}

		this._super( key, value );

		if ( key === "appendTo" ) {
			this.uiDialog.appendTo( this._appendTo() );
		}

		if ( key === "buttons" ) {
			this._createButtons();
		}

		if ( key === "closeText" ) {
			this.uiDialogTitlebarClose.button({
				// Ensure that we always pass a string
				label: "" + value
			});
		}

		if ( key === "draggable" ) {
			isDraggable = uiDialog.is(":data(ui-draggable)");
			if ( isDraggable && !value ) {
				uiDialog.draggable("destroy");
			}

			if ( !isDraggable && value ) {
				this._makeDraggable();
			}
		}

		if ( key === "position" ) {
			this._position();
		}

		if ( key === "resizable" ) {
			// currently resizable, becoming non-resizable
			isResizable = uiDialog.is(":data(ui-resizable)");
			if ( isResizable && !value ) {
				uiDialog.resizable("destroy");
			}

			// currently resizable, changing handles
			if ( isResizable && typeof value === "string" ) {
				uiDialog.resizable( "option", "handles", value );
			}

			// currently non-resizable, becoming resizable
			if ( !isResizable && value !== false ) {
				this._makeResizable();
			}
		}

		if ( key === "title" ) {
			this._title( this.uiDialogTitlebar.find(".ui-dialog-title") );
		}
	},

	_size: function() {
		// If the user has resized the dialog, the .ui-dialog and .ui-dialog-content
		// divs will both have width and height set, so we need to reset them
		var nonContentHeight, minContentHeight, maxContentHeight,
			options = this.options;

		// Reset content sizing
		this.element.show().css({
			width: "auto",
			minHeight: 0,
			maxHeight: "none",
			height: 0
		});

		if ( options.minWidth > options.width ) {
			options.width = options.minWidth;
		}

		// reset wrapper sizing
		// determine the height of all the non-content elements
		nonContentHeight = this.uiDialog.css({
				height: "auto",
				width: options.width
			})
			.outerHeight();
		minContentHeight = Math.max( 0, options.minHeight - nonContentHeight );
		maxContentHeight = typeof options.maxHeight === "number" ?
			Math.max( 0, options.maxHeight - nonContentHeight ) :
			"none";

		if ( options.height === "auto" ) {
			this.element.css({
				minHeight: minContentHeight,
				maxHeight: maxContentHeight,
				height: "auto"
			});
		} else {
			this.element.height( Math.max( 0, options.height - nonContentHeight ) );
		}

		if (this.uiDialog.is(":data(ui-resizable)") ) {
			this.uiDialog.resizable( "option", "minHeight", this._minHeight() );
		}
	},

	_blockFrames: function() {
		this.iframeBlocks = this.document.find( "iframe" ).map(function() {
			var iframe = $( this );

			return $( "<div>" )
				.css({
					position: "absolute",
					width: iframe.outerWidth(),
					height: iframe.outerHeight()
				})
				.appendTo( iframe.parent() )
				.offset( iframe.offset() )[0];
		});
	},

	_unblockFrames: function() {
		if ( this.iframeBlocks ) {
			this.iframeBlocks.remove();
			delete this.iframeBlocks;
		}
	},

	_allowInteraction: function( event ) {
		if ( $( event.target ).closest(".ui-dialog").length ) {
			return true;
		}

		// TODO: Remove hack when datepicker implements
		// the .ui-front logic (#8989)
		return !!$( event.target ).closest(".ui-datepicker").length;
	},

	_createOverlay: function() {
		if ( !this.options.modal ) {
			return;
		}

		var that = this,
			widgetFullName = this.widgetFullName;
		if ( !$.ui.dialog.overlayInstances ) {
			// Prevent use of anchors and inputs.
			// We use a delay in case the overlay is created from an
			// event that we're going to be cancelling. (#2804)
			this._delay(function() {
				// Handle .dialog().dialog("close") (#4065)
				if ( $.ui.dialog.overlayInstances ) {
					this.document.bind( "focusin.dialog", function( event ) {
						if ( !that._allowInteraction( event ) ) {
							event.preventDefault();
							$(".ui-dialog:visible:last .ui-dialog-content")
								.data( widgetFullName )._focusTabbable();
						}
					});
				}
			});
		}

		this.overlay = $("<div>")
			.addClass("ui-widget-overlay ui-front")
			.appendTo( this._appendTo() );
		this._on( this.overlay, {
			mousedown: "_keepFocus"
		});
		$.ui.dialog.overlayInstances++;
	},

	_destroyOverlay: function() {
		if ( !this.options.modal ) {
			return;
		}

		if ( this.overlay ) {
			$.ui.dialog.overlayInstances--;

			if ( !$.ui.dialog.overlayInstances ) {
				this.document.unbind( "focusin.dialog" );
			}
			this.overlay.remove();
			this.overlay = null;
		}
	}
});

$.ui.dialog.overlayInstances = 0;

// DEPRECATED
if ( $.uiBackCompat !== false ) {
	// position option with array notation
	// just override with old implementation
	$.widget( "ui.dialog", $.ui.dialog, {
		_position: function() {
			var position = this.options.position,
				myAt = [],
				offset = [ 0, 0 ],
				isVisible;

			if ( position ) {
				if ( typeof position === "string" || (typeof position === "object" && "0" in position ) ) {
					myAt = position.split ? position.split(" ") : [ position[0], position[1] ];
					if ( myAt.length === 1 ) {
						myAt[1] = myAt[0];
					}

					$.each( [ "left", "top" ], function( i, offsetPosition ) {
						if ( +myAt[ i ] === myAt[ i ] ) {
							offset[ i ] = myAt[ i ];
							myAt[ i ] = offsetPosition;
						}
					});

					position = {
						my: myAt[0] + (offset[0] < 0 ? offset[0] : "+" + offset[0]) + " " +
							myAt[1] + (offset[1] < 0 ? offset[1] : "+" + offset[1]),
						at: myAt.join(" ")
					};
				}

				position = $.extend( {}, $.ui.dialog.prototype.options.position, position );
			} else {
				position = $.ui.dialog.prototype.options.position;
			}

			// need to show the dialog to get the actual offset in the position plugin
			isVisible = this.uiDialog.is(":visible");
			if ( !isVisible ) {
				this.uiDialog.show();
			}
			this.uiDialog.position( position );
			if ( !isVisible ) {
				this.uiDialog.hide();
			}
		}
	});
}

}( jQuery ) );
(function( $, undefined ) {

$.widget( "ui.menu", {
	version: "1.10.4",
	defaultElement: "<ul>",
	delay: 300,
	options: {
		icons: {
			submenu: "ui-icon-carat-1-e"
		},
		menus: "ul",
		position: {
			my: "left top",
			at: "right top"
		},
		role: "menu",

		// callbacks
		blur: null,
		focus: null,
		select: null
	},

	_create: function() {
		this.activeMenu = this.element;
		// flag used to prevent firing of the click handler
		// as the event bubbles up through nested menus
		this.mouseHandled = false;
		this.element
			.uniqueId()
			.addClass( "ui-menu ui-widget ui-widget-content ui-corner-all" )
			.toggleClass( "ui-menu-icons", !!this.element.find( ".ui-icon" ).length )
			.attr({
				role: this.options.role,
				tabIndex: 0
			})
			// need to catch all clicks on disabled menu
			// not possible through _on
			.bind( "click" + this.eventNamespace, $.proxy(function( event ) {
				if ( this.options.disabled ) {
					event.preventDefault();
				}
			}, this ));

		if ( this.options.disabled ) {
			this.element
				.addClass( "ui-state-disabled" )
				.attr( "aria-disabled", "true" );
		}

		this._on({
			// Prevent focus from sticking to links inside menu after clicking
			// them (focus should always stay on UL during navigation).
			"mousedown .ui-menu-item > a": function( event ) {
				event.preventDefault();
			},
			"click .ui-state-disabled > a": function( event ) {
				event.preventDefault();
			},
			"click .ui-menu-item:has(a)": function( event ) {
				var target = $( event.target ).closest( ".ui-menu-item" );
				if ( !this.mouseHandled && target.not( ".ui-state-disabled" ).length ) {
					this.select( event );

					// Only set the mouseHandled flag if the event will bubble, see #9469.
					if ( !event.isPropagationStopped() ) {
						this.mouseHandled = true;
					}

					// Open submenu on click
					if ( target.has( ".ui-menu" ).length ) {
						this.expand( event );
					} else if ( !this.element.is( ":focus" ) && $( this.document[ 0 ].activeElement ).closest( ".ui-menu" ).length ) {

						// Redirect focus to the menu
						this.element.trigger( "focus", [ true ] );

						// If the active item is on the top level, let it stay active.
						// Otherwise, blur the active item since it is no longer visible.
						if ( this.active && this.active.parents( ".ui-menu" ).length === 1 ) {
							clearTimeout( this.timer );
						}
					}
				}
			},
			"mouseenter .ui-menu-item": function( event ) {
				var target = $( event.currentTarget );
				// Remove ui-state-active class from siblings of the newly focused menu item
				// to avoid a jump caused by adjacent elements both having a class with a border
				target.siblings().children( ".ui-state-active" ).removeClass( "ui-state-active" );
				this.focus( event, target );
			},
			mouseleave: "collapseAll",
			"mouseleave .ui-menu": "collapseAll",
			focus: function( event, keepActiveItem ) {
				// If there's already an active item, keep it active
				// If not, activate the first item
				var item = this.active || this.element.children( ".ui-menu-item" ).eq( 0 );

				if ( !keepActiveItem ) {
					this.focus( event, item );
				}
			},
			blur: function( event ) {
				this._delay(function() {
					if ( !$.contains( this.element[0], this.document[0].activeElement ) ) {
						this.collapseAll( event );
					}
				});
			},
			keydown: "_keydown"
		});

		this.refresh();

		// Clicks outside of a menu collapse any open menus
		this._on( this.document, {
			click: function( event ) {
				if ( !$( event.target ).closest( ".ui-menu" ).length ) {
					this.collapseAll( event );
				}

				// Reset the mouseHandled flag
				this.mouseHandled = false;
			}
		});
	},

	_destroy: function() {
		// Destroy (sub)menus
		this.element
			.removeAttr( "aria-activedescendant" )
			.find( ".ui-menu" ).addBack()
				.removeClass( "ui-menu ui-widget ui-widget-content ui-corner-all ui-menu-icons" )
				.removeAttr( "role" )
				.removeAttr( "tabIndex" )
				.removeAttr( "aria-labelledby" )
				.removeAttr( "aria-expanded" )
				.removeAttr( "aria-hidden" )
				.removeAttr( "aria-disabled" )
				.removeUniqueId()
				.show();

		// Destroy menu items
		this.element.find( ".ui-menu-item" )
			.removeClass( "ui-menu-item" )
			.removeAttr( "role" )
			.removeAttr( "aria-disabled" )
			.children( "a" )
				.removeUniqueId()
				.removeClass( "ui-corner-all ui-state-hover" )
				.removeAttr( "tabIndex" )
				.removeAttr( "role" )
				.removeAttr( "aria-haspopup" )
				.children().each( function() {
					var elem = $( this );
					if ( elem.data( "ui-menu-submenu-carat" ) ) {
						elem.remove();
					}
				});

		// Destroy menu dividers
		this.element.find( ".ui-menu-divider" ).removeClass( "ui-menu-divider ui-widget-content" );
	},

	_keydown: function( event ) {
		var match, prev, character, skip, regex,
			preventDefault = true;

		function escape( value ) {
			return value.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" );
		}

		switch ( event.keyCode ) {
		case $.ui.keyCode.PAGE_UP:
			this.previousPage( event );
			break;
		case $.ui.keyCode.PAGE_DOWN:
			this.nextPage( event );
			break;
		case $.ui.keyCode.HOME:
			this._move( "first", "first", event );
			break;
		case $.ui.keyCode.END:
			this._move( "last", "last", event );
			break;
		case $.ui.keyCode.UP:
			this.previous( event );
			break;
		case $.ui.keyCode.DOWN:
			this.next( event );
			break;
		case $.ui.keyCode.LEFT:
			this.collapse( event );
			break;
		case $.ui.keyCode.RIGHT:
			if ( this.active && !this.active.is( ".ui-state-disabled" ) ) {
				this.expand( event );
			}
			break;
		case $.ui.keyCode.ENTER:
		case $.ui.keyCode.SPACE:
			this._activate( event );
			break;
		case $.ui.keyCode.ESCAPE:
			this.collapse( event );
			break;
		default:
			preventDefault = false;
			prev = this.previousFilter || "";
			character = String.fromCharCode( event.keyCode );
			skip = false;

			clearTimeout( this.filterTimer );

			if ( character === prev ) {
				skip = true;
			} else {
				character = prev + character;
			}

			regex = new RegExp( "^" + escape( character ), "i" );
			match = this.activeMenu.children( ".ui-menu-item" ).filter(function() {
				return regex.test( $( this ).children( "a" ).text() );
			});
			match = skip && match.index( this.active.next() ) !== -1 ?
				this.active.nextAll( ".ui-menu-item" ) :
				match;

			// If no matches on the current filter, reset to the last character pressed
			// to move down the menu to the first item that starts with that character
			if ( !match.length ) {
				character = String.fromCharCode( event.keyCode );
				regex = new RegExp( "^" + escape( character ), "i" );
				match = this.activeMenu.children( ".ui-menu-item" ).filter(function() {
					return regex.test( $( this ).children( "a" ).text() );
				});
			}

			if ( match.length ) {
				this.focus( event, match );
				if ( match.length > 1 ) {
					this.previousFilter = character;
					this.filterTimer = this._delay(function() {
						delete this.previousFilter;
					}, 1000 );
				} else {
					delete this.previousFilter;
				}
			} else {
				delete this.previousFilter;
			}
		}

		if ( preventDefault ) {
			event.preventDefault();
		}
	},

	_activate: function( event ) {
		if ( !this.active.is( ".ui-state-disabled" ) ) {
			if ( this.active.children( "a[aria-haspopup='true']" ).length ) {
				this.expand( event );
			} else {
				this.select( event );
			}
		}
	},

	refresh: function() {
		var menus,
			icon = this.options.icons.submenu,
			submenus = this.element.find( this.options.menus );

		this.element.toggleClass( "ui-menu-icons", !!this.element.find( ".ui-icon" ).length );

		// Initialize nested menus
		submenus.filter( ":not(.ui-menu)" )
			.addClass( "ui-menu ui-widget ui-widget-content ui-corner-all" )
			.hide()
			.attr({
				role: this.options.role,
				"aria-hidden": "true",
				"aria-expanded": "false"
			})
			.each(function() {
				var menu = $( this ),
					item = menu.prev( "a" ),
					submenuCarat = $( "<span>" )
						.addClass( "ui-menu-icon ui-icon " + icon )
						.data( "ui-menu-submenu-carat", true );

				item
					.attr( "aria-haspopup", "true" )
					.prepend( submenuCarat );
				menu.attr( "aria-labelledby", item.attr( "id" ) );
			});

		menus = submenus.add( this.element );

		// Don't refresh list items that are already adapted
		menus.children( ":not(.ui-menu-item):has(a)" )
			.addClass( "ui-menu-item" )
			.attr( "role", "presentation" )
			.children( "a" )
				.uniqueId()
				.addClass( "ui-corner-all" )
				.attr({
					tabIndex: -1,
					role: this._itemRole()
				});

		// Initialize unlinked menu-items containing spaces and/or dashes only as dividers
		menus.children( ":not(.ui-menu-item)" ).each(function() {
			var item = $( this );
			// hyphen, em dash, en dash
			if ( !/[^\-\u2014\u2013\s]/.test( item.text() ) ) {
				item.addClass( "ui-widget-content ui-menu-divider" );
			}
		});

		// Add aria-disabled attribute to any disabled menu item
		menus.children( ".ui-state-disabled" ).attr( "aria-disabled", "true" );

		// If the active item has been removed, blur the menu
		if ( this.active && !$.contains( this.element[ 0 ], this.active[ 0 ] ) ) {
			this.blur();
		}
	},

	_itemRole: function() {
		return {
			menu: "menuitem",
			listbox: "option"
		}[ this.options.role ];
	},

	_setOption: function( key, value ) {
		if ( key === "icons" ) {
			this.element.find( ".ui-menu-icon" )
				.removeClass( this.options.icons.submenu )
				.addClass( value.submenu );
		}
		this._super( key, value );
	},

	focus: function( event, item ) {
		var nested, focused;
		this.blur( event, event && event.type === "focus" );

		this._scrollIntoView( item );

		this.active = item.first();
		focused = this.active.children( "a" ).addClass( "ui-state-focus" );
		// Only update aria-activedescendant if there's a role
		// otherwise we assume focus is managed elsewhere
		if ( this.options.role ) {
			this.element.attr( "aria-activedescendant", focused.attr( "id" ) );
		}

		// Highlight active parent menu item, if any
		this.active
			.parent()
			.closest( ".ui-menu-item" )
			.children( "a:first" )
			.addClass( "ui-state-active" );

		if ( event && event.type === "keydown" ) {
			this._close();
		} else {
			this.timer = this._delay(function() {
				this._close();
			}, this.delay );
		}

		nested = item.children( ".ui-menu" );
		if ( nested.length && event && ( /^mouse/.test( event.type ) ) ) {
			this._startOpening(nested);
		}
		this.activeMenu = item.parent();

		this._trigger( "focus", event, { item: item } );
	},

	_scrollIntoView: function( item ) {
		var borderTop, paddingTop, offset, scroll, elementHeight, itemHeight;
		if ( this._hasScroll() ) {
			borderTop = parseFloat( $.css( this.activeMenu[0], "borderTopWidth" ) ) || 0;
			paddingTop = parseFloat( $.css( this.activeMenu[0], "paddingTop" ) ) || 0;
			offset = item.offset().top - this.activeMenu.offset().top - borderTop - paddingTop;
			scroll = this.activeMenu.scrollTop();
			elementHeight = this.activeMenu.height();
			itemHeight = item.height();

			if ( offset < 0 ) {
				this.activeMenu.scrollTop( scroll + offset );
			} else if ( offset + itemHeight > elementHeight ) {
				this.activeMenu.scrollTop( scroll + offset - elementHeight + itemHeight );
			}
		}
	},

	blur: function( event, fromFocus ) {
		if ( !fromFocus ) {
			clearTimeout( this.timer );
		}

		if ( !this.active ) {
			return;
		}

		this.active.children( "a" ).removeClass( "ui-state-focus" );
		this.active = null;

		this._trigger( "blur", event, { item: this.active } );
	},

	_startOpening: function( submenu ) {
		clearTimeout( this.timer );

		// Don't open if already open fixes a Firefox bug that caused a .5 pixel
		// shift in the submenu position when mousing over the carat icon
		if ( submenu.attr( "aria-hidden" ) !== "true" ) {
			return;
		}

		this.timer = this._delay(function() {
			this._close();
			this._open( submenu );
		}, this.delay );
	},

	_open: function( submenu ) {
		var position = $.extend({
			of: this.active
		}, this.options.position );

		clearTimeout( this.timer );
		this.element.find( ".ui-menu" ).not( submenu.parents( ".ui-menu" ) )
			.hide()
			.attr( "aria-hidden", "true" );

		submenu
			.show()
			.removeAttr( "aria-hidden" )
			.attr( "aria-expanded", "true" )
			.position( position );
	},

	collapseAll: function( event, all ) {
		clearTimeout( this.timer );
		this.timer = this._delay(function() {
			// If we were passed an event, look for the submenu that contains the event
			var currentMenu = all ? this.element :
				$( event && event.target ).closest( this.element.find( ".ui-menu" ) );

			// If we found no valid submenu ancestor, use the main menu to close all sub menus anyway
			if ( !currentMenu.length ) {
				currentMenu = this.element;
			}

			this._close( currentMenu );

			this.blur( event );
			this.activeMenu = currentMenu;
		}, this.delay );
	},

	// With no arguments, closes the currently active menu - if nothing is active
	// it closes all menus.  If passed an argument, it will search for menus BELOW
	_close: function( startMenu ) {
		if ( !startMenu ) {
			startMenu = this.active ? this.active.parent() : this.element;
		}

		startMenu
			.find( ".ui-menu" )
				.hide()
				.attr( "aria-hidden", "true" )
				.attr( "aria-expanded", "false" )
			.end()
			.find( "a.ui-state-active" )
				.removeClass( "ui-state-active" );
	},

	collapse: function( event ) {
		var newItem = this.active &&
			this.active.parent().closest( ".ui-menu-item", this.element );
		if ( newItem && newItem.length ) {
			this._close();
			this.focus( event, newItem );
		}
	},

	expand: function( event ) {
		var newItem = this.active &&
			this.active
				.children( ".ui-menu " )
				.children( ".ui-menu-item" )
				.first();

		if ( newItem && newItem.length ) {
			this._open( newItem.parent() );

			// Delay so Firefox will not hide activedescendant change in expanding submenu from AT
			this._delay(function() {
				this.focus( event, newItem );
			});
		}
	},

	next: function( event ) {
		this._move( "next", "first", event );
	},

	previous: function( event ) {
		this._move( "prev", "last", event );
	},

	isFirstItem: function() {
		return this.active && !this.active.prevAll( ".ui-menu-item" ).length;
	},

	isLastItem: function() {
		return this.active && !this.active.nextAll( ".ui-menu-item" ).length;
	},

	_move: function( direction, filter, event ) {
		var next;
		if ( this.active ) {
			if ( direction === "first" || direction === "last" ) {
				next = this.active
					[ direction === "first" ? "prevAll" : "nextAll" ]( ".ui-menu-item" )
					.eq( -1 );
			} else {
				next = this.active
					[ direction + "All" ]( ".ui-menu-item" )
					.eq( 0 );
			}
		}
		if ( !next || !next.length || !this.active ) {
			next = this.activeMenu.children( ".ui-menu-item" )[ filter ]();
		}

		this.focus( event, next );
	},

	nextPage: function( event ) {
		var item, base, height;

		if ( !this.active ) {
			this.next( event );
			return;
		}
		if ( this.isLastItem() ) {
			return;
		}
		if ( this._hasScroll() ) {
			base = this.active.offset().top;
			height = this.element.height();
			this.active.nextAll( ".ui-menu-item" ).each(function() {
				item = $( this );
				return item.offset().top - base - height < 0;
			});

			this.focus( event, item );
		} else {
			this.focus( event, this.activeMenu.children( ".ui-menu-item" )
				[ !this.active ? "first" : "last" ]() );
		}
	},

	previousPage: function( event ) {
		var item, base, height;
		if ( !this.active ) {
			this.next( event );
			return;
		}
		if ( this.isFirstItem() ) {
			return;
		}
		if ( this._hasScroll() ) {
			base = this.active.offset().top;
			height = this.element.height();
			this.active.prevAll( ".ui-menu-item" ).each(function() {
				item = $( this );
				return item.offset().top - base + height > 0;
			});

			this.focus( event, item );
		} else {
			this.focus( event, this.activeMenu.children( ".ui-menu-item" ).first() );
		}
	},

	_hasScroll: function() {
		return this.element.outerHeight() < this.element.prop( "scrollHeight" );
	},

	select: function( event ) {
		// TODO: It should never be possible to not have an active item at this
		// point, but the tests don't trigger mouseenter before click.
		this.active = this.active || $( event.target ).closest( ".ui-menu-item" );
		var ui = { item: this.active };
		if ( !this.active.has( ".ui-menu" ).length ) {
			this.collapseAll( event, true );
		}
		this._trigger( "select", event, ui );
	}
});

}( jQuery ));
/*
    jquery-srcset-retina-polyfill

    jQuery plugin to provide support for srcset attribute of the img tag to enable alternate images on retina displays.
    https://github.com/jcampbell1/jquery-srcset-retina-polyfill
 */

(function($,window) {
	// returns an array of objects of the form {url: 'image_url', ratio: float }
	//   array is sorted in asending order by the pixel ratio
	$.parseSrcset = function(text) {
		var result = [],
		 	 items = $.trim(text).split(',');
		for(var i = 0; i< items.length; i++) {
			var img = $.trim(items[i]).split(/\s+/);
			if (img.length < 2) 
				continue;
			var r = { url: img[0] };
			if(img[1].substr(-1,1) == 'x')
				r.ratio = parseFloat( img[1].substr(0,img[1].length -1) );
			r.ratio && result.push(r);
		}
		result.sort(function(a,b) {
			return a.ratio > b.ratio ? 1 : -1;
		});
		return result;
	};
	
	$.fn.srcset = function(dpr) {
		dpr = dpr || window.devicePixelRatio;
		if(!dpr || dpr == 1 || 'srcset' in document.createElement('img'))  {
			return this;
		} 
		return this.each(function() {
			var target_src, 
				 current_ratio = 1,
				 images = $.parseSrcset($(this).attr('srcset'));
			for(var i = 0; i< images.length;i++) {
				if(images[i].ratio > current_ratio) {
					target_src = images[i].url;
					current_ratio = images[i].ratio;
				}
				if(current_ratio >= dpr)
					break;
			}
			target_src && $(this).attr('src',target_src);
		});
	};
	
})(jQuery,window);

$(document).ready(function() {
    // Run script for all images with srcset attribute
    $('img[srcset]').srcset();
});
/**
* Input Mask plugin for jquery
* http://github.com/RobinHerbots/jquery.inputmask
* Copyright (c) 2010 - 2014 Robin Herbots
* Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
* Version: 0.0.0
*/

(function ($) {
    if ($.fn.inputmask === undefined) {
        //helper functions    
        function isInputEventSupported(eventName) {
            var el = document.createElement('input'),
            eventName = 'on' + eventName,
            isSupported = (eventName in el);
            if (!isSupported) {
                el.setAttribute(eventName, 'return;');
                isSupported = typeof el[eventName] == 'function';
            }
            el = null;
            return isSupported;
        }
        function resolveAlias(aliasStr, options, opts) {
            var aliasDefinition = opts.aliases[aliasStr];
            if (aliasDefinition) {
                if (aliasDefinition.alias) resolveAlias(aliasDefinition.alias, undefined, opts); //alias is another alias
                $.extend(true, opts, aliasDefinition);  //merge alias definition in the options
                $.extend(true, opts, options);  //reapply extra given options
                return true;
            }
            return false;
        }
        function generateMaskSets(opts) {
            var ms = [];
            var genmasks = []; //used to keep track of the masks that where processed, to avoid duplicates
            function getMaskTemplate(mask) {
                if (opts.numericInput) {
                    mask = mask.split('').reverse().join('');
                }
                var escaped = false, outCount = 0, greedy = opts.greedy, repeat = opts.repeat;
                if (repeat == "*") greedy = false;
                //if (greedy == true && opts.placeholder == "") opts.placeholder = " ";
                if (mask.length == 1 && greedy == false && repeat != 0) { opts.placeholder = ""; } //hide placeholder with single non-greedy mask
                var singleMask = $.map(mask.split(""), function (element, index) {
                    var outElem = [];
                    if (element == opts.escapeChar) {
                        escaped = true;
                    }
                    else if ((element != opts.optionalmarker.start && element != opts.optionalmarker.end) || escaped) {
                        var maskdef = opts.definitions[element];
                        if (maskdef && !escaped) {
                            for (var i = 0; i < maskdef.cardinality; i++) {
                                outElem.push(opts.placeholder.charAt((outCount + i) % opts.placeholder.length));
                            }
                        } else {
                            outElem.push(element);
                            escaped = false;
                        }
                        outCount += outElem.length;
                        return outElem;
                    }
                });

                //allocate repetitions
                var repeatedMask = singleMask.slice();
                for (var i = 1; i < repeat && greedy; i++) {
                    repeatedMask = repeatedMask.concat(singleMask.slice());
                }

                return { "mask": repeatedMask, "repeat": repeat, "greedy": greedy };
            }
            //test definition => {fn: RegExp/function, cardinality: int, optionality: bool, newBlockMarker: bool, offset: int, casing: null/upper/lower, def: definitionSymbol}
            function getTestingChain(mask) {
                if (opts.numericInput) {
                    mask = mask.split('').reverse().join('');
                }
                var isOptional = false, escaped = false;
                var newBlockMarker = false; //indicates wheter the begin/ending of a block should be indicated

                return $.map(mask.split(""), function (element, index) {
                    var outElem = [];

                    if (element == opts.escapeChar) {
                        escaped = true;
                    } else if (element == opts.optionalmarker.start && !escaped) {
                        isOptional = true;
                        newBlockMarker = true;
                    }
                    else if (element == opts.optionalmarker.end && !escaped) {
                        isOptional = false;
                        newBlockMarker = true;
                    }
                    else {
                        var maskdef = opts.definitions[element];
                        if (maskdef && !escaped) {
                            var prevalidators = maskdef["prevalidator"], prevalidatorsL = prevalidators ? prevalidators.length : 0;
                            for (var i = 1; i < maskdef.cardinality; i++) {
                                var prevalidator = prevalidatorsL >= i ? prevalidators[i - 1] : [], validator = prevalidator["validator"], cardinality = prevalidator["cardinality"];
                                outElem.push({ fn: validator ? typeof validator == 'string' ? new RegExp(validator) : new function () { this.test = validator; } : new RegExp("."), cardinality: cardinality ? cardinality : 1, optionality: isOptional, newBlockMarker: isOptional == true ? newBlockMarker : false, offset: 0, casing: maskdef["casing"], def: maskdef["definitionSymbol"] || element });
                                if (isOptional == true) //reset newBlockMarker
                                    newBlockMarker = false;
                            }
                            outElem.push({ fn: maskdef.validator ? typeof maskdef.validator == 'string' ? new RegExp(maskdef.validator) : new function () { this.test = maskdef.validator; } : new RegExp("."), cardinality: maskdef.cardinality, optionality: isOptional, newBlockMarker: newBlockMarker, offset: 0, casing: maskdef["casing"], def: maskdef["definitionSymbol"] || element });
                        } else {
                            outElem.push({ fn: null, cardinality: 0, optionality: isOptional, newBlockMarker: newBlockMarker, offset: 0, casing: null, def: element });
                            escaped = false;
                        }
                        //reset newBlockMarker
                        newBlockMarker = false;
                        return outElem;
                    }
                });
            }
            function markOptional(maskPart) { //needed for the clearOptionalTail functionality
                return opts.optionalmarker.start + maskPart + opts.optionalmarker.end;
            }
            function splitFirstOptionalEndPart(maskPart) {
                var optionalStartMarkers = 0, optionalEndMarkers = 0, mpl = maskPart.length;
                for (var i = 0; i < mpl; i++) {
                    if (maskPart.charAt(i) == opts.optionalmarker.start) {
                        optionalStartMarkers++;
                    }
                    if (maskPart.charAt(i) == opts.optionalmarker.end) {
                        optionalEndMarkers++;
                    }
                    if (optionalStartMarkers > 0 && optionalStartMarkers == optionalEndMarkers)
                        break;
                }
                var maskParts = [maskPart.substring(0, i)];
                if (i < mpl) {
                    maskParts.push(maskPart.substring(i + 1, mpl));
                }
                return maskParts;
            }
            function splitFirstOptionalStartPart(maskPart) {
                var mpl = maskPart.length;
                for (var i = 0; i < mpl; i++) {
                    if (maskPart.charAt(i) == opts.optionalmarker.start) {
                        break;
                    }
                }
                var maskParts = [maskPart.substring(0, i)];
                if (i < mpl) {
                    maskParts.push(maskPart.substring(i + 1, mpl));
                }
                return maskParts;
            }
            function generateMask(maskPrefix, maskPart, metadata) {
                var maskParts = splitFirstOptionalEndPart(maskPart);
                var newMask, maskTemplate;

                var masks = splitFirstOptionalStartPart(maskParts[0]);
                if (masks.length > 1) {
                    newMask = maskPrefix + masks[0] + markOptional(masks[1]) + (maskParts.length > 1 ? maskParts[1] : "");
                    if ($.inArray(newMask, genmasks) == -1 && newMask != "") {
                        genmasks.push(newMask);
                        maskTemplate = getMaskTemplate(newMask);
                        ms.push({
                            "mask": newMask,
                            "_buffer": maskTemplate["mask"],
                            "buffer": maskTemplate["mask"].slice(),
                            "tests": getTestingChain(newMask),
                            "lastValidPosition": -1,
                            "greedy": maskTemplate["greedy"],
                            "repeat": maskTemplate["repeat"],
                            "metadata": metadata
                        });
                    }
                    newMask = maskPrefix + masks[0] + (maskParts.length > 1 ? maskParts[1] : "");
                    if ($.inArray(newMask, genmasks) == -1 && newMask != "") {
                        genmasks.push(newMask);
                        maskTemplate = getMaskTemplate(newMask);
                        ms.push({
                            "mask": newMask,
                            "_buffer": maskTemplate["mask"],
                            "buffer": maskTemplate["mask"].slice(),
                            "tests": getTestingChain(newMask),
                            "lastValidPosition": -1,
                            "greedy": maskTemplate["greedy"],
                            "repeat": maskTemplate["repeat"],
                            "metadata": metadata
                        });
                    }
                    if (splitFirstOptionalStartPart(masks[1]).length > 1) { //optional contains another optional
                        generateMask(maskPrefix + masks[0], masks[1] + maskParts[1], metadata);
                    }
                    if (maskParts.length > 1 && splitFirstOptionalStartPart(maskParts[1]).length > 1) {
                        generateMask(maskPrefix + masks[0] + markOptional(masks[1]), maskParts[1], metadata);
                        generateMask(maskPrefix + masks[0], maskParts[1], metadata);
                    }
                }
                else {
                    newMask = maskPrefix + maskParts;
                    if ($.inArray(newMask, genmasks) == -1 && newMask != "") {
                        genmasks.push(newMask);
                        maskTemplate = getMaskTemplate(newMask);
                        ms.push({
                            "mask": newMask,
                            "_buffer": maskTemplate["mask"],
                            "buffer": maskTemplate["mask"].slice(),
                            "tests": getTestingChain(newMask),
                            "lastValidPosition": -1,
                            "greedy": maskTemplate["greedy"],
                            "repeat": maskTemplate["repeat"],
                            "metadata": metadata
                        });
                    }
                }

            }

            if ($.isFunction(opts.mask)) { //allow mask to be a preprocessing fn - should return a valid mask
                opts.mask = opts.mask.call(this, opts);
            }
            if ($.isArray(opts.mask)) {
                $.each(opts.mask, function (ndx, msk) {
                    if (msk["mask"] != undefined) {
                        generateMask("", msk["mask"].toString(), msk);
                    } else
                        generateMask("", msk.toString());
                });
            } else generateMask("", opts.mask.toString());

            return opts.greedy ? ms : ms.sort(function (a, b) { return a["mask"].length - b["mask"].length; });
        }

        var msie1x = typeof ScriptEngineMajorVersion === "function"
                        ? ScriptEngineMajorVersion() //IE11 detection
                        : new Function("/*@cc_on return @_jscript_version; @*/")() >= 10, //conditional compilation from mickeysoft trick
            iphone = navigator.userAgent.match(new RegExp("iphone", "i")) !== null,
            android = navigator.userAgent.match(new RegExp("android.*safari.*", "i")) !== null,
            androidchrome = navigator.userAgent.match(new RegExp("android.*chrome.*", "i")) !== null,
            pasteEvent = isInputEventSupported('paste') ? 'paste' : isInputEventSupported('input') ? 'input' : "propertychange",
            androidchrome32 = false, androidchrome18 = false, androidchrome29 = false;

        if (androidchrome) {
            var browser = navigator.userAgent.match(new RegExp("chrome.*", "i")),
                version = parseInt(new RegExp(/[0-9]+/).exec(browser));
            androidchrome32 = (version == 32);
            androidchrome18 = (version == 18);
            androidchrome29 = (version == 29);
        }

        //masking scope
        //actionObj definition see below
        function maskScope(masksets, activeMasksetIndex, opts, actionObj) {
            var isRTL = false,
                valueOnFocus = getActiveBuffer().join(''),
                $el,
                skipKeyPressEvent = false, //Safari 5.1.x - modal dialog fires keypress twice workaround
                skipInputEvent = false, //skip when triggered from within inputmask
                ignorable = false;


            //maskset helperfunctions

            function getActiveMaskSet() {
                return masksets[activeMasksetIndex];
            }

            function getActiveTests() {
                return getActiveMaskSet()['tests'];
            }

            function getActiveBufferTemplate() {
                return getActiveMaskSet()['_buffer'];
            }

            function getActiveBuffer() {
                return getActiveMaskSet()['buffer'];
            }

            function isValid(pos, c, strict) { //strict true ~ no correction or autofill
                strict = strict === true; //always set a value to strict to prevent possible strange behavior in the extensions 

                function _isValid(position, activeMaskset, c, strict) {
                    var testPos = determineTestPosition(position), loopend = c ? 1 : 0, chrs = '', buffer = activeMaskset["buffer"];
                    for (var i = activeMaskset['tests'][testPos].cardinality; i > loopend; i--) {
                        chrs += getBufferElement(buffer, testPos - (i - 1));
                    }

                    if (c) {
                        chrs += c;
                    }

                    //return is false or a json object => { pos: ??, c: ??} or true
                    return activeMaskset['tests'][testPos].fn != null ?
                        activeMaskset['tests'][testPos].fn.test(chrs, buffer, position, strict, opts)
                        : (c == getBufferElement(activeMaskset['_buffer'].slice(), position, true) || c == opts.skipOptionalPartCharacter) ?
                            { "refresh": true, c: getBufferElement(activeMaskset['_buffer'].slice(), position, true), pos: position }
                            : false;
                }

                function PostProcessResults(maskForwards, results) {
                    var hasValidActual = false;
                    $.each(results, function (ndx, rslt) {
                        hasValidActual = $.inArray(rslt["activeMasksetIndex"], maskForwards) == -1 && rslt["result"] !== false;
                        if (hasValidActual) return false;
                    });
                    if (hasValidActual) { //strip maskforwards
                        results = $.map(results, function (rslt, ndx) {
                            if ($.inArray(rslt["activeMasksetIndex"], maskForwards) == -1) {
                                return rslt;
                            } else {
                                masksets[rslt["activeMasksetIndex"]]["lastValidPosition"] = actualLVP;
                            }
                        });
                    } else { //keep maskforwards with the least forward
                        var lowestPos = -1, lowestIndex = -1, rsltValid;
                        $.each(results, function (ndx, rslt) {
                            if ($.inArray(rslt["activeMasksetIndex"], maskForwards) != -1 && rslt["result"] !== false & (lowestPos == -1 || lowestPos > rslt["result"]["pos"])) {
                                lowestPos = rslt["result"]["pos"];
                                lowestIndex = rslt["activeMasksetIndex"];
                            }
                        });
                        results = $.map(results, function (rslt, ndx) {
                            if ($.inArray(rslt["activeMasksetIndex"], maskForwards) != -1) {
                                if (rslt["result"]["pos"] == lowestPos) {
                                    return rslt;
                                } else if (rslt["result"] !== false) {
                                    for (var i = pos; i < lowestPos; i++) {
                                        rsltValid = _isValid(i, masksets[rslt["activeMasksetIndex"]], masksets[lowestIndex]["buffer"][i], true);
                                        if (rsltValid === false) {
                                            masksets[rslt["activeMasksetIndex"]]["lastValidPosition"] = lowestPos - 1;
                                            break;
                                        } else {
                                            setBufferElement(masksets[rslt["activeMasksetIndex"]]["buffer"], i, masksets[lowestIndex]["buffer"][i], true);
                                            masksets[rslt["activeMasksetIndex"]]["lastValidPosition"] = i;
                                        }
                                    }
                                    //also check check for the lowestpos with the new input
                                    rsltValid = _isValid(lowestPos, masksets[rslt["activeMasksetIndex"]], c, true);
                                    if (rsltValid !== false) {
                                        setBufferElement(masksets[rslt["activeMasksetIndex"]]["buffer"], lowestPos, c, true);
                                        masksets[rslt["activeMasksetIndex"]]["lastValidPosition"] = lowestPos;
                                    }
                                    //console.log("ndx " + rslt["activeMasksetIndex"] + " validate " + masksets[rslt["activeMasksetIndex"]]["buffer"].join('') + " lv " + masksets[rslt["activeMasksetIndex"]]['lastValidPosition']);
                                    return rslt;
                                }
                            }
                        });
                    }
                    return results;
                }

                if (strict) {
                    var result = _isValid(pos, getActiveMaskSet(), c, strict); //only check validity in current mask when validating strict
                    if (result === true) {
                        result = { "pos": pos }; //always take a possible corrected maskposition into account
                    }
                    return result;
                }

                var results = [], result = false, currentActiveMasksetIndex = activeMasksetIndex,
                    actualBuffer = getActiveBuffer().slice(), actualLVP = getActiveMaskSet()["lastValidPosition"],
                    actualPrevious = seekPrevious(pos),
                    maskForwards = [];
                $.each(masksets, function (index, value) {
                    if (typeof (value) == "object") {
                        activeMasksetIndex = index;

                        var maskPos = pos;
                        var lvp = getActiveMaskSet()['lastValidPosition'],
                            rsltValid;
                        if (lvp == actualLVP) {
                            if ((maskPos - actualLVP) > 1) {
                                for (var i = lvp == -1 ? 0 : lvp; i < maskPos; i++) {
                                    rsltValid = _isValid(i, getActiveMaskSet(), actualBuffer[i], true);
                                    if (rsltValid === false) {
                                        break;
                                    } else {
                                        setBufferElement(getActiveBuffer(), i, actualBuffer[i], true);
                                        if (rsltValid === true) {
                                            rsltValid = { "pos": i }; //always take a possible corrected maskposition into account
                                        }
                                        var newValidPosition = rsltValid.pos || i;
                                        if (getActiveMaskSet()['lastValidPosition'] < newValidPosition)
                                            getActiveMaskSet()['lastValidPosition'] = newValidPosition; //set new position from isValid
                                    }
                                }
                            }
                            //does the input match on a further position?
                            if (!isMask(maskPos) && !_isValid(maskPos, getActiveMaskSet(), c, strict)) {
                                var maxForward = seekNext(maskPos) - maskPos;
                                for (var fw = 0; fw < maxForward; fw++) {
                                    if (_isValid(++maskPos, getActiveMaskSet(), c, strict) !== false)
                                        break;
                                }
                                maskForwards.push(activeMasksetIndex);
                                //console.log('maskforward ' + activeMasksetIndex + " pos " + pos + " maskPos " + maskPos);
                            }
                        }

                        if (getActiveMaskSet()['lastValidPosition'] >= actualLVP || activeMasksetIndex == currentActiveMasksetIndex) {
                            if (maskPos >= 0 && maskPos < getMaskLength()) {
                                result = _isValid(maskPos, getActiveMaskSet(), c, strict);
                                if (result !== false) {
                                    if (result === true) {
                                        result = { "pos": maskPos }; //always take a possible corrected maskposition into account
                                    }
                                    var newValidPosition = result.pos || maskPos;
                                    if (getActiveMaskSet()['lastValidPosition'] < newValidPosition)
                                        getActiveMaskSet()['lastValidPosition'] = newValidPosition; //set new position from isValid
                                }
                                //console.log("pos " + pos + " ndx " + activeMasksetIndex + " validate " + getActiveBuffer().join('') + " lv " + getActiveMaskSet()['lastValidPosition']);
                                results.push({ "activeMasksetIndex": index, "result": result });
                            }
                        }
                    }
                });
                activeMasksetIndex = currentActiveMasksetIndex; //reset activeMasksetIndex

                return PostProcessResults(maskForwards, results); //return results of the multiple mask validations
            }

            function determineActiveMasksetIndex() {
                var currentMasksetIndex = activeMasksetIndex,
                    highestValid = { "activeMasksetIndex": 0, "lastValidPosition": -1, "next": -1 };
                $.each(masksets, function (index, value) {
                    if (typeof (value) == "object") {
                        activeMasksetIndex = index;
                        if (getActiveMaskSet()['lastValidPosition'] > highestValid['lastValidPosition']) {
                            highestValid["activeMasksetIndex"] = index;
                            highestValid["lastValidPosition"] = getActiveMaskSet()['lastValidPosition'];
                            highestValid["next"] = seekNext(getActiveMaskSet()['lastValidPosition']);
                        } else if (getActiveMaskSet()['lastValidPosition'] == highestValid['lastValidPosition'] &&
                            (highestValid['next'] == -1 || highestValid['next'] > seekNext(getActiveMaskSet()['lastValidPosition']))) {
                            highestValid["activeMasksetIndex"] = index;
                            highestValid["lastValidPosition"] = getActiveMaskSet()['lastValidPosition'];
                            highestValid["next"] = seekNext(getActiveMaskSet()['lastValidPosition']);
                        }
                    }
                });

                activeMasksetIndex = highestValid["lastValidPosition"] != -1 && masksets[currentMasksetIndex]["lastValidPosition"] == highestValid["lastValidPosition"] ? currentMasksetIndex : highestValid["activeMasksetIndex"];
                if (currentMasksetIndex != activeMasksetIndex) {
                    clearBuffer(getActiveBuffer(), seekNext(highestValid["lastValidPosition"]), getMaskLength());
                    getActiveMaskSet()["writeOutBuffer"] = true;
                }
                $el.data('_inputmask')['activeMasksetIndex'] = activeMasksetIndex; //store the activeMasksetIndex
            }

            function isMask(pos) {
                var testPos = determineTestPosition(pos);
                var test = getActiveTests()[testPos];

                return test != undefined ? test.fn : false;
            }

            function determineTestPosition(pos) {
                return pos % getActiveTests().length;
            }

            function getMaskLength() {
                return opts.getMaskLength(getActiveBufferTemplate(), getActiveMaskSet()['greedy'], getActiveMaskSet()['repeat'], getActiveBuffer(), opts);
            }

            //pos: from position

            function seekNext(pos) {
                var maskL = getMaskLength();
                if (pos >= maskL) return maskL;
                var position = pos;
                while (++position < maskL && !isMask(position)) {
                }
                return position;
            }

            //pos: from position

            function seekPrevious(pos) {
                var position = pos;
                if (position <= 0) return 0;

                while (--position > 0 && !isMask(position)) {
                }
                ;
                return position;
            }

            function setBufferElement(buffer, position, element, autoPrepare) {
                if (autoPrepare) position = prepareBuffer(buffer, position);

                var test = getActiveTests()[determineTestPosition(position)];
                var elem = element;
                if (elem != undefined && test != undefined) {
                    switch (test.casing) {
                        case "upper":
                            elem = element.toUpperCase();
                            break;
                        case "lower":
                            elem = element.toLowerCase();
                            break;
                    }
                }

                buffer[position] = elem;
            }

            function getBufferElement(buffer, position, autoPrepare) {
                if (autoPrepare) position = prepareBuffer(buffer, position);
                return buffer[position];
            }

            //needed to handle the non-greedy mask repetitions

            function prepareBuffer(buffer, position) {
                var j;
                while (buffer[position] == undefined && buffer.length < getMaskLength()) {
                    j = 0;
                    while (getActiveBufferTemplate()[j] !== undefined) { //add a new buffer
                        buffer.push(getActiveBufferTemplate()[j++]);
                    }
                }

                return position;
            }

            function writeBuffer(input, buffer, caretPos) {
                input._valueSet(buffer.join(''));
                if (caretPos != undefined) {
                    caret(input, caretPos);
                }
            }

            function clearBuffer(buffer, start, end, stripNomasks) {
                for (var i = start, maskL = getMaskLength() ; i < end && i < maskL; i++) {
                    if (stripNomasks === true) {
                        if (!isMask(i))
                            setBufferElement(buffer, i, "");
                    } else
                        setBufferElement(buffer, i, getBufferElement(getActiveBufferTemplate().slice(), i, true));
                }
            }

            function setReTargetPlaceHolder(buffer, pos) {
                var testPos = determineTestPosition(pos);
                setBufferElement(buffer, pos, getBufferElement(getActiveBufferTemplate(), testPos));
            }

            function getPlaceHolder(pos) {
                return opts.placeholder.charAt(pos % opts.placeholder.length);
            }

            function checkVal(input, writeOut, strict, nptvl, intelliCheck) {
                var inputValue = nptvl != undefined ? nptvl.slice() : truncateInput(input._valueGet()).split('');

                $.each(masksets, function (ndx, ms) {
                    if (typeof (ms) == "object") {
                        ms["buffer"] = ms["_buffer"].slice();
                        ms["lastValidPosition"] = -1;
                        ms["p"] = -1;
                    }
                });
                if (strict !== true) activeMasksetIndex = 0;
                if (writeOut) input._valueSet(""); //initial clear
                var ml = getMaskLength();
                $.each(inputValue, function (ndx, charCode) {
                    if (intelliCheck === true) {
                        var p = getActiveMaskSet()["p"], lvp = p == -1 ? p : seekPrevious(p),
                            pos = lvp == -1 ? ndx : seekNext(lvp);
                        if ($.inArray(charCode, getActiveBufferTemplate().slice(lvp + 1, pos)) == -1) {
                            keypressEvent.call(input, undefined, true, charCode.charCodeAt(0), writeOut, strict, ndx);
                        }
                    } else {
                        keypressEvent.call(input, undefined, true, charCode.charCodeAt(0), writeOut, strict, ndx);
                    }
                });

                if (strict === true && getActiveMaskSet()["p"] != -1) {
                    getActiveMaskSet()["lastValidPosition"] = seekPrevious(getActiveMaskSet()["p"]);
                }
            }

            function escapeRegex(str) {
                return $.inputmask.escapeRegex.call(this, str);
            }

            function truncateInput(inputValue) {
                return inputValue.replace(new RegExp("(" + escapeRegex(getActiveBufferTemplate().join('')) + ")*$"), "");
            }

            function clearOptionalTail(input) {
                var buffer = getActiveBuffer(), tmpBuffer = buffer.slice(), testPos, pos;
                for (var pos = tmpBuffer.length - 1; pos >= 0; pos--) {
                    var testPos = determineTestPosition(pos);
                    if (getActiveTests()[testPos].optionality) {
                        if (!isMask(pos) || !isValid(pos, buffer[pos], true))
                            tmpBuffer.pop();
                        else break;
                    } else break;
                }
                writeBuffer(input, tmpBuffer);
            }

            function unmaskedvalue($input, skipDatepickerCheck) {
                if (getActiveTests() && (skipDatepickerCheck === true || !$input.hasClass('hasDatepicker'))) {
                    //checkVal(input, false, true);
                    var umValue = $.map(getActiveBuffer(), function (element, index) {
                        return isMask(index) && isValid(index, element, true) ? element : null;
                    });
                    var unmaskedValue = (isRTL ? umValue.reverse() : umValue).join('');
                    return opts.onUnMask != undefined ? opts.onUnMask.call(this, getActiveBuffer().join(''), unmaskedValue) : unmaskedValue;
                } else {
                    return $input[0]._valueGet();
                }
            }

            function TranslatePosition(pos) {
                if (isRTL && typeof pos == 'number' && (!opts.greedy || opts.placeholder != "")) {
                    var bffrLght = getActiveBuffer().length;
                    pos = bffrLght - pos;
                }
                return pos;
            }

            function caret(input, begin, end) {
                var npt = input.jquery && input.length > 0 ? input[0] : input, range;
                if (typeof begin == 'number') {
                    begin = TranslatePosition(begin);
                    end = TranslatePosition(end);
                    if (!$(input).is(':visible')) {
                        return;
                    }
                    end = (typeof end == 'number') ? end : begin;
                    npt.scrollLeft = npt.scrollWidth;
                    if (opts.insertMode == false && begin == end) end++; //set visualization for insert/overwrite mode
                    if (npt.setSelectionRange) {
                        npt.selectionStart = begin;
                        npt.selectionEnd = android ? begin : end;

                    } else if (npt.createTextRange) {
                        range = npt.createTextRange();
                        range.collapse(true);
                        range.moveEnd('character', end);
                        range.moveStart('character', begin);
                        range.select();
                    }
                } else {
                    if (!$(input).is(':visible')) {
                        return { "begin": 0, "end": 0 };
                    }
                    if (npt.setSelectionRange) {
                        begin = npt.selectionStart;
                        end = npt.selectionEnd;
                    } else if (document.selection && document.selection.createRange) {
                        range = document.selection.createRange();
                        begin = 0 - range.duplicate().moveStart('character', -100000);
                        end = begin + range.text.length;
                    }
                    begin = TranslatePosition(begin);
                    end = TranslatePosition(end);
                    return { "begin": begin, "end": end };
                }
            }

            function isComplete(buffer) { //return true / false / undefined (repeat *)
                if (opts.repeat == "*") return undefined;
                var complete = false, highestValidPosition = 0, currentActiveMasksetIndex = activeMasksetIndex;
                $.each(masksets, function (ndx, ms) {
                    if (typeof (ms) == "object") {
                        activeMasksetIndex = ndx;
                        var aml = seekPrevious(getMaskLength());
                        if (ms["lastValidPosition"] >= highestValidPosition && ms["lastValidPosition"] == aml) {
                            var msComplete = true;
                            for (var i = 0; i <= aml; i++) {
                                var mask = isMask(i), testPos = determineTestPosition(i);
                                if ((mask && (buffer[i] == undefined || buffer[i] == getPlaceHolder(i))) || (!mask && buffer[i] != getActiveBufferTemplate()[testPos])) {
                                    msComplete = false;
                                    break;
                                }
                            }
                            complete = complete || msComplete;
                            if (complete) //break loop
                                return false;
                        }
                        highestValidPosition = ms["lastValidPosition"];
                    }
                });
                activeMasksetIndex = currentActiveMasksetIndex; //reset activeMaskset
                return complete;
            }

            function isSelection(begin, end) {
                return isRTL ? (begin - end) > 1 || ((begin - end) == 1 && opts.insertMode) :
                    (end - begin) > 1 || ((end - begin) == 1 && opts.insertMode);
            }


            //private functions
            function installEventRuler(npt) {
                var events = $._data(npt).events;

                $.each(events, function (eventType, eventHandlers) {
                    $.each(eventHandlers, function (ndx, eventHandler) {
                        if (eventHandler.namespace == "inputmask") {
                            if (eventHandler.type != "setvalue") {
                                var handler = eventHandler.handler;
                                eventHandler.handler = function (e) {
                                    if (this.readOnly || this.disabled)
                                        e.preventDefault;
                                    else
                                        return handler.apply(this, arguments);
                                };
                            }
                        }
                    });
                });
            }

            function patchValueProperty(npt) {
                function PatchValhook(type) {
                    if ($.valHooks[type] == undefined || $.valHooks[type].inputmaskpatch != true) {
                        var valueGet = $.valHooks[type] && $.valHooks[type].get ? $.valHooks[type].get : function (elem) { return elem.value; };
                        var valueSet = $.valHooks[type] && $.valHooks[type].set ? $.valHooks[type].set : function (elem, value) {
                            elem.value = value;
                            return elem;
                        };

                        $.valHooks[type] = {
                            get: function (elem) {
                                var $elem = $(elem);
                                if ($elem.data('_inputmask')) {
                                    if ($elem.data('_inputmask')['opts'].autoUnmask)
                                        return $elem.inputmask('unmaskedvalue');
                                    else {
                                        var result = valueGet(elem),
                                            inputData = $elem.data('_inputmask'), masksets = inputData['masksets'],
                                            activeMasksetIndex = inputData['activeMasksetIndex'];
                                        return result != masksets[activeMasksetIndex]['_buffer'].join('') ? result : '';
                                    }
                                } else return valueGet(elem);
                            },
                            set: function (elem, value) {
                                var $elem = $(elem);
                                var result = valueSet(elem, value);
                                if ($elem.data('_inputmask')) $elem.triggerHandler('setvalue.inputmask');
                                return result;
                            },
                            inputmaskpatch: true
                        };
                    }
                }
                var valueProperty;
                if (Object.getOwnPropertyDescriptor)
                    valueProperty = Object.getOwnPropertyDescriptor(npt, "value");
                if (valueProperty && valueProperty.get) {
                    if (!npt._valueGet) {
                        var valueGet = valueProperty.get;
                        var valueSet = valueProperty.set;
                        npt._valueGet = function () {
                            return isRTL ? valueGet.call(this).split('').reverse().join('') : valueGet.call(this);
                        };
                        npt._valueSet = function (value) {
                            valueSet.call(this, isRTL ? value.split('').reverse().join('') : value);
                        };

                        Object.defineProperty(npt, "value", {
                            get: function () {
                                var $self = $(this), inputData = $(this).data('_inputmask'), masksets = inputData['masksets'],
                                    activeMasksetIndex = inputData['activeMasksetIndex'];
                                return inputData && inputData['opts'].autoUnmask ? $self.inputmask('unmaskedvalue') : valueGet.call(this) != masksets[activeMasksetIndex]['_buffer'].join('') ? valueGet.call(this) : '';
                            },
                            set: function (value) {
                                valueSet.call(this, value);
                                $(this).triggerHandler('setvalue.inputmask');
                            }
                        });
                    }
                } else if (document.__lookupGetter__ && npt.__lookupGetter__("value")) {
                    if (!npt._valueGet) {
                        var valueGet = npt.__lookupGetter__("value");
                        var valueSet = npt.__lookupSetter__("value");
                        npt._valueGet = function () {
                            return isRTL ? valueGet.call(this).split('').reverse().join('') : valueGet.call(this);
                        };
                        npt._valueSet = function (value) {
                            valueSet.call(this, isRTL ? value.split('').reverse().join('') : value);
                        };

                        npt.__defineGetter__("value", function () {
                            var $self = $(this), inputData = $(this).data('_inputmask'), masksets = inputData['masksets'],
                                activeMasksetIndex = inputData['activeMasksetIndex'];
                            return inputData && inputData['opts'].autoUnmask ? $self.inputmask('unmaskedvalue') : valueGet.call(this) != masksets[activeMasksetIndex]['_buffer'].join('') ? valueGet.call(this) : '';
                        });
                        npt.__defineSetter__("value", function (value) {
                            valueSet.call(this, value);
                            $(this).triggerHandler('setvalue.inputmask');
                        });
                    }
                } else {
                    if (!npt._valueGet) {
                        npt._valueGet = function () { return isRTL ? this.value.split('').reverse().join('') : this.value; };
                        npt._valueSet = function (value) { this.value = isRTL ? value.split('').reverse().join('') : value; };
                    }
                    PatchValhook(npt.type);
                }
            }

            //shift chars to left from start to end and put c at end position if defined
            function shiftL(start, end, c, maskJumps) {
                var buffer = getActiveBuffer();
                if (maskJumps !== false) //jumping over nonmask position
                    while (!isMask(start) && start - 1 >= 0) start--;
                for (var i = start; i < end && i < getMaskLength() ; i++) {
                    if (isMask(i)) {
                        setReTargetPlaceHolder(buffer, i);
                        var j = seekNext(i);
                        var p = getBufferElement(buffer, j);
                        if (p != getPlaceHolder(j)) {
                            if (j < getMaskLength() && isValid(i, p, true) !== false && getActiveTests()[determineTestPosition(i)].def == getActiveTests()[determineTestPosition(j)].def) {
                                setBufferElement(buffer, i, p, true);
                            } else {
                                if (isMask(i))
                                    break;
                            }
                        }
                    } else {
                        setReTargetPlaceHolder(buffer, i);
                    }
                }
                if (c != undefined)
                    setBufferElement(buffer, seekPrevious(end), c);

                if (getActiveMaskSet()["greedy"] == false) {
                    var trbuffer = truncateInput(buffer.join('')).split('');
                    buffer.length = trbuffer.length;
                    for (var i = 0, bl = buffer.length; i < bl; i++) {
                        buffer[i] = trbuffer[i];
                    }
                    if (buffer.length == 0) getActiveMaskSet()["buffer"] = getActiveBufferTemplate().slice();
                }
                return start; //return the used start position
            }

            function shiftR(start, end, c) {
                var buffer = getActiveBuffer();
                if (getBufferElement(buffer, start, true) != getPlaceHolder(start)) {
                    for (var i = seekPrevious(end) ; i > start && i >= 0; i--) {
                        if (isMask(i)) {
                            var j = seekPrevious(i);
                            var t = getBufferElement(buffer, j);
                            if (t != getPlaceHolder(j)) {
                                if (isValid(j, t, true) !== false && getActiveTests()[determineTestPosition(i)].def == getActiveTests()[determineTestPosition(j)].def) {
                                    setBufferElement(buffer, i, t, true);
                                    setReTargetPlaceHolder(buffer, j);
                                } //else break;
                            }
                        } else
                            setReTargetPlaceHolder(buffer, i);
                    }
                }
                if (c != undefined && getBufferElement(buffer, start) == getPlaceHolder(start))
                    setBufferElement(buffer, start, c);
                var lengthBefore = buffer.length;
                if (getActiveMaskSet()["greedy"] == false) {
                    var trbuffer = truncateInput(buffer.join('')).split('');
                    buffer.length = trbuffer.length;
                    for (var i = 0, bl = buffer.length; i < bl; i++) {
                        buffer[i] = trbuffer[i];
                    }
                    if (buffer.length == 0) getActiveMaskSet()["buffer"] = getActiveBufferTemplate().slice();
                }
                return end - (lengthBefore - buffer.length); //return new start position
            }

            ;


            function HandleRemove(input, k, pos) {
                if (opts.numericInput || isRTL) {
                    switch (k) {
                        case opts.keyCode.BACKSPACE:
                            k = opts.keyCode.DELETE;
                            break;
                        case opts.keyCode.DELETE:
                            k = opts.keyCode.BACKSPACE;
                            break;
                    }
                    if (isRTL) {
                        var pend = pos.end;
                        pos.end = pos.begin;
                        pos.begin = pend;
                    }
                }

                var isSelection = true;
                if (pos.begin == pos.end) {
                    var posBegin = k == opts.keyCode.BACKSPACE ? pos.begin - 1 : pos.begin;
                    if (opts.isNumeric && opts.radixPoint != "" && getActiveBuffer()[posBegin] == opts.radixPoint) {
                        pos.begin = (getActiveBuffer().length - 1 == posBegin) /* radixPoint is latest? delete it */ ? pos.begin : k == opts.keyCode.BACKSPACE ? posBegin : seekNext(posBegin);
                        pos.end = pos.begin;
                    }
                    isSelection = false;
                    if (k == opts.keyCode.BACKSPACE)
                        pos.begin--;
                    else if (k == opts.keyCode.DELETE)
                        pos.end++;
                } else if (pos.end - pos.begin == 1 && !opts.insertMode) {
                    isSelection = false;
                    if (k == opts.keyCode.BACKSPACE)
                        pos.begin--;
                }

                clearBuffer(getActiveBuffer(), pos.begin, pos.end);

                var ml = getMaskLength();
                if (opts.greedy == false) {
                    shiftL(pos.begin, ml, undefined, !isRTL && (k == opts.keyCode.BACKSPACE && !isSelection));
                } else {
                    var newpos = pos.begin;
                    for (var i = pos.begin; i < pos.end; i++) { //seeknext to skip placeholders at start in selection
                        if (isMask(i) || !isSelection)
                            newpos = shiftL(pos.begin, ml, undefined, !isRTL && (k == opts.keyCode.BACKSPACE && !isSelection));
                    }
                    if (!isSelection) pos.begin = newpos;
                }
                var firstMaskPos = seekNext(-1);
                clearBuffer(getActiveBuffer(), pos.begin, pos.end, true);
                checkVal(input, false, masksets[1] == undefined || firstMaskPos >= pos.end, getActiveBuffer());
                if (getActiveMaskSet()['lastValidPosition'] < firstMaskPos) {
                    getActiveMaskSet()["lastValidPosition"] = -1;
                    getActiveMaskSet()["p"] = firstMaskPos;
                } else {
                    getActiveMaskSet()["p"] = pos.begin;
                }
            }

            function keydownEvent(e) {
                //Safari 5.1.x - modal dialog fires keypress twice workaround
                skipKeyPressEvent = false;
                var input = this, $input = $(input), k = e.keyCode, pos = caret(input);

                //backspace, delete, and escape get special treatment
                if (k == opts.keyCode.BACKSPACE || k == opts.keyCode.DELETE || (iphone && k == 127) || e.ctrlKey && k == 88) { //backspace/delete
                    e.preventDefault(); //stop default action but allow propagation
                    if (k == 88) valueOnFocus = getActiveBuffer().join('');
                    HandleRemove(input, k, pos);
                    determineActiveMasksetIndex();
                    writeBuffer(input, getActiveBuffer(), getActiveMaskSet()["p"]);
                    if (input._valueGet() == getActiveBufferTemplate().join(''))
                        $input.trigger('cleared');

                    if (opts.showTooltip) { //update tooltip
                        $input.prop("title", getActiveMaskSet()["mask"]);
                    }
                } else if (k == opts.keyCode.END || k == opts.keyCode.PAGE_DOWN) { //when END or PAGE_DOWN pressed set position at lastmatch
                    setTimeout(function () {
                        var caretPos = seekNext(getActiveMaskSet()["lastValidPosition"]);
                        if (!opts.insertMode && caretPos == getMaskLength() && !e.shiftKey) caretPos--;
                        caret(input, e.shiftKey ? pos.begin : caretPos, caretPos);
                    }, 0);
                } else if ((k == opts.keyCode.HOME && !e.shiftKey) || k == opts.keyCode.PAGE_UP) { //Home or page_up
                    caret(input, 0, e.shiftKey ? pos.begin : 0);
                } else if (k == opts.keyCode.ESCAPE || (k == 90 && e.ctrlKey)) { //escape && undo
                    checkVal(input, true, false, valueOnFocus.split(''));
                    $input.click();
                } else if (k == opts.keyCode.INSERT && !(e.shiftKey || e.ctrlKey)) { //insert
                    opts.insertMode = !opts.insertMode;
                    caret(input, !opts.insertMode && pos.begin == getMaskLength() ? pos.begin - 1 : pos.begin);
                } else if (opts.insertMode == false && !e.shiftKey) {
                    if (k == opts.keyCode.RIGHT) {
                        setTimeout(function () {
                            var caretPos = caret(input);
                            caret(input, caretPos.begin);
                        }, 0);
                    } else if (k == opts.keyCode.LEFT) {
                        setTimeout(function () {
                            var caretPos = caret(input);
                            caret(input, caretPos.begin - 1);
                        }, 0);
                    }
                }

                var currentCaretPos = caret(input);
                if (opts.onKeyDown.call(this, e, getActiveBuffer(), opts) === true) //extra stuff to execute on keydown
                    caret(input, currentCaretPos.begin, currentCaretPos.end);
                ignorable = $.inArray(k, opts.ignorables) != -1;
            }


            function keypressEvent(e, checkval, k, writeOut, strict, ndx) {
                //Safari 5.1.x - modal dialog fires keypress twice workaround
                if (k == undefined && skipKeyPressEvent) return false;
                skipKeyPressEvent = true;

                var input = this, $input = $(input);

                e = e || window.event;
                var k = checkval ? k : (e.which || e.charCode || e.keyCode);

                if (checkval !== true && (!(e.ctrlKey && e.altKey) && (e.ctrlKey || e.metaKey || ignorable))) {
                    return true;
                } else {
                    if (k) {
                        //special treat the decimal separator
                        if (checkval !== true && k == 46 && e.shiftKey == false && opts.radixPoint == ",") k = 44;

                        var pos, results, result, c = String.fromCharCode(k);
                        if (checkval) {
                            var pcaret = strict ? ndx : getActiveMaskSet()["lastValidPosition"] + 1;
                            pos = { begin: pcaret, end: pcaret };
                        } else {
                            pos = caret(input);
                        }

                        //should we clear a possible selection??
                        var isSlctn = isSelection(pos.begin, pos.end),
                            initialIndex = activeMasksetIndex;
                        if (isSlctn) {
                            activeMasksetIndex = initialIndex;
                            $.each(masksets, function (ndx, lmnt) { //init undobuffer for recovery when not valid
                                if (typeof (lmnt) == "object") {
                                    activeMasksetIndex = ndx;
                                    getActiveMaskSet()["undoBuffer"] = getActiveBuffer().join('');
                                }
                            });
                            HandleRemove(input, opts.keyCode.DELETE, pos);
                            if (!opts.insertMode) { //preserve some space
                                $.each(masksets, function (ndx, lmnt) {
                                    if (typeof (lmnt) == "object") {
                                        activeMasksetIndex = ndx;
                                        shiftR(pos.begin, getMaskLength());
                                        getActiveMaskSet()["lastValidPosition"] = seekNext(getActiveMaskSet()["lastValidPosition"]);
                                    }
                                });
                            }
                            activeMasksetIndex = initialIndex; //restore index
                        }

                        var radixPosition = getActiveBuffer().join('').indexOf(opts.radixPoint);
                        if (opts.isNumeric && checkval !== true && radixPosition != -1) {
                            if (opts.greedy && pos.begin <= radixPosition) {
                                pos.begin = seekPrevious(pos.begin);
                                pos.end = pos.begin;
                            } else if (c == opts.radixPoint) {
                                pos.begin = radixPosition;
                                pos.end = pos.begin;
                            }
                        }


                        var p = pos.begin;
                        results = isValid(p, c, strict);
                        if (strict === true) results = [{ "activeMasksetIndex": activeMasksetIndex, "result": results }];
                        var minimalForwardPosition = -1;
                        $.each(results, function (index, result) {
                            activeMasksetIndex = result["activeMasksetIndex"];
                            getActiveMaskSet()["writeOutBuffer"] = true;
                            var np = result["result"];
                            if (np !== false) {
                                var refresh = false, buffer = getActiveBuffer();
                                if (np !== true) {
                                    refresh = np["refresh"]; //only rewrite buffer from isValid
                                    p = np.pos != undefined ? np.pos : p; //set new position from isValid
                                    c = np.c != undefined ? np.c : c; //set new char from isValid
                                }
                                if (refresh !== true) {
                                    if (opts.insertMode == true) {
                                        var lastUnmaskedPosition = getMaskLength();
                                        var bfrClone = buffer.slice();
                                        while (getBufferElement(bfrClone, lastUnmaskedPosition, true) != getPlaceHolder(lastUnmaskedPosition) && lastUnmaskedPosition >= p) {
                                            lastUnmaskedPosition = lastUnmaskedPosition == 0 ? -1 : seekPrevious(lastUnmaskedPosition);
                                        }
                                        if (lastUnmaskedPosition >= p) {
                                            shiftR(p, getMaskLength(), c);
                                            //shift the lvp if needed
                                            var lvp = getActiveMaskSet()["lastValidPosition"], nlvp = seekNext(lvp);
                                            if (nlvp != getMaskLength() && lvp >= p && (getBufferElement(getActiveBuffer().slice(), nlvp, true) != getPlaceHolder(nlvp))) {
                                                getActiveMaskSet()["lastValidPosition"] = nlvp;
                                            }
                                        } else getActiveMaskSet()["writeOutBuffer"] = false;
                                    } else setBufferElement(buffer, p, c, true);
                                    if (minimalForwardPosition == -1 || minimalForwardPosition > seekNext(p)) {
                                        minimalForwardPosition = seekNext(p);
                                    }
                                } else if (!strict) {
                                    var nextPos = p < getMaskLength() ? p + 1 : p;
                                    if (minimalForwardPosition == -1 || minimalForwardPosition > nextPos) {
                                        minimalForwardPosition = nextPos;
                                    }
                                }
                                if (minimalForwardPosition > getActiveMaskSet()["p"])
                                    getActiveMaskSet()["p"] = minimalForwardPosition; //needed for checkval strict 
                            }
                        });

                        if (strict !== true) {
                            activeMasksetIndex = initialIndex;
                            determineActiveMasksetIndex();
                        }
                        if (writeOut !== false) {
                            $.each(results, function (ndx, rslt) {
                                if (rslt["activeMasksetIndex"] == activeMasksetIndex) {
                                    result = rslt;
                                    return false;
                                }
                            });
                            if (result != undefined) {
                                var self = this;
                                setTimeout(function () { opts.onKeyValidation.call(self, result["result"], opts); }, 0);
                                if (getActiveMaskSet()["writeOutBuffer"] && result["result"] !== false) {
                                    var buffer = getActiveBuffer();

                                    var newCaretPosition;
                                    if (checkval) {
                                        newCaretPosition = undefined;
                                    } else if (opts.numericInput) {
                                        if (p > radixPosition) {
                                            newCaretPosition = seekPrevious(minimalForwardPosition);
                                        } else if (c == opts.radixPoint) {
                                            newCaretPosition = minimalForwardPosition - 1;
                                        } else newCaretPosition = seekPrevious(minimalForwardPosition - 1);
                                    } else {
                                        newCaretPosition = minimalForwardPosition;
                                    }

                                    writeBuffer(input, buffer, newCaretPosition);
                                    if (checkval !== true) {
                                        setTimeout(function () { //timeout needed for IE
                                            if (isComplete(buffer) === true)
                                                $input.trigger("complete");
                                            skipInputEvent = true;
                                            $input.trigger("input");
                                        }, 0);
                                    }
                                } else if (isSlctn) {
                                    getActiveMaskSet()["buffer"] = getActiveMaskSet()["undoBuffer"].split('');
                                }
                            }
                        }

                        if (opts.showTooltip) { //update tooltip
                            $input.prop("title", getActiveMaskSet()["mask"]);
                        }

                        //needed for IE8 and below
                        if (e) e.preventDefault ? e.preventDefault() : e.returnValue = false;
                    }
                }
            }

            function keyupEvent(e) {
                var $input = $(this), input = this, k = e.keyCode, buffer = getActiveBuffer();

                opts.onKeyUp.call(this, e, buffer, opts); //extra stuff to execute on keyup
                if (k == opts.keyCode.TAB && opts.showMaskOnFocus) {
                    if ($input.hasClass('focus.inputmask') && input._valueGet().length == 0) {
                        buffer = getActiveBufferTemplate().slice();
                        writeBuffer(input, buffer);
                        caret(input, 0);
                        valueOnFocus = getActiveBuffer().join('');
                    } else {
                        writeBuffer(input, buffer);
                        if (buffer.join('') == getActiveBufferTemplate().join('') && $.inArray(opts.radixPoint, buffer) != -1) {
                            caret(input, TranslatePosition(0));
                            $input.click();
                        } else
                            caret(input, TranslatePosition(0), TranslatePosition(getMaskLength()));
                    }
                }
            }

            function inputEvent(e) {
                if (skipInputEvent === true) {
                    skipInputEvent = false;
                    return true;
                }
                var input = this, $input = $(input);

                checkVal(input, false, false);
                writeBuffer(input, getActiveBuffer());
                if (isComplete(getActiveBuffer()) === true)
                    $input.trigger("complete");
                $input.click();
            }

            function chrome32InputEvent(e) {
                if (skipInputEvent === true) {
                    skipInputEvent = false;
                    return true;
                }
                var input = this, $input = $(input);

                //backspace in chrome32 only fires input event - detect & treat
                var caretPos = caret(input),
                    currentValue = input._valueGet();
                if (currentValue.charAt(caretPos.begin) != getActiveBuffer()[caretPos.begin]
                    && currentValue.charAt(caretPos.begin + 1) != getActiveBuffer()[caretPos.begin]
                    && !isMask(caretPos.begin)) {
                    e.keyCode = opts.keyCode.BACKSPACE;
                    keydownEvent.call(input, e);
                } else { //nonnumerics don't fire keypress 
                    checkVal(input, false, false);
                    writeBuffer(input, getActiveBuffer());
                    if (isComplete(getActiveBuffer()) === true)
                        $input.trigger("complete");
                    $input.click();
                }
                e.preventDefault()
            }

            function mask(el) {
                $el = $(el);
                if ($el.is(":input")) {
                    //store tests & original buffer in the input element - used to get the unmasked value
                    $el.data('_inputmask', {
                        'masksets': masksets,
                        'activeMasksetIndex': activeMasksetIndex,
                        'opts': opts,
                        'isRTL': false
                    });

                    //show tooltip
                    if (opts.showTooltip) {
                        $el.prop("title", getActiveMaskSet()["mask"]);
                    }

                    //correct greedy setting if needed
                    getActiveMaskSet()['greedy'] = getActiveMaskSet()['greedy'] ? getActiveMaskSet()['greedy'] : getActiveMaskSet()['repeat'] == 0;

                    //handle maxlength attribute
                    if ($el.attr("maxLength") != null) //only when the attribute is set
                    {
                        var maxLength = $el.prop('maxLength');
                        if (maxLength > -1) { //handle *-repeat
                            $.each(masksets, function (ndx, ms) {
                                if (typeof (ms) == "object") {
                                    if (ms["repeat"] == "*") {
                                        ms["repeat"] = maxLength;
                                    }
                                }
                            });
                        }
                        if (getMaskLength() >= maxLength && maxLength > -1) { //FF sets no defined max length to -1 
                            if (maxLength < getActiveBufferTemplate().length) getActiveBufferTemplate().length = maxLength;
                            if (getActiveMaskSet()['greedy'] == false) {
                                getActiveMaskSet()['repeat'] = Math.round(maxLength / getActiveBufferTemplate().length);
                            }
                            $el.prop('maxLength', getMaskLength() * 2);
                        }
                    }

                    patchValueProperty(el);

                    if (opts.numericInput) opts.isNumeric = opts.numericInput;
                    if (el.dir == "rtl" || (opts.numericInput && opts.rightAlignNumerics) || (opts.isNumeric && opts.rightAlignNumerics))
                        $el.css("text-align", "right");

                    if (el.dir == "rtl" || opts.numericInput) {
                        el.dir = "ltr";
                        $el.removeAttr("dir");
                        var inputData = $el.data('_inputmask');
                        inputData['isRTL'] = true;
                        $el.data('_inputmask', inputData);
                        isRTL = true;
                    }

                    //unbind all events - to make sure that no other mask will interfere when re-masking
                    $el.unbind(".inputmask");
                    $el.removeClass('focus.inputmask');
                    //bind events
                    $el.closest('form').bind("submit", function () { //trigger change on submit if any
                        if (valueOnFocus != getActiveBuffer().join('')) {
                            $el.change();
                        }
                    }).bind('reset', function () {
                        setTimeout(function () {
                            $el.trigger("setvalue");
                        }, 0);
                    });
                    $el.bind("mouseenter.inputmask", function () {
                        var $input = $(this), input = this;
                        if (!$input.hasClass('focus.inputmask') && opts.showMaskOnHover) {
                            if (input._valueGet() != getActiveBuffer().join('')) {
                                writeBuffer(input, getActiveBuffer());
                            }
                        }
                    }).bind("blur.inputmask", function () {
                        var $input = $(this), input = this, nptValue = input._valueGet(), buffer = getActiveBuffer();
                        $input.removeClass('focus.inputmask');
                        if (valueOnFocus != getActiveBuffer().join('')) {
                            $input.change();
                        }
                        if (opts.clearMaskOnLostFocus && nptValue != '') {
                            if (nptValue == getActiveBufferTemplate().join(''))
                                input._valueSet('');
                            else { //clearout optional tail of the mask
                                clearOptionalTail(input);
                            }
                        }
                        if (isComplete(buffer) === false) {
                            $input.trigger("incomplete");
                            if (opts.clearIncomplete) {
                                $.each(masksets, function (ndx, ms) {
                                    if (typeof (ms) == "object") {
                                        ms["buffer"] = ms["_buffer"].slice();
                                        ms["lastValidPosition"] = -1;
                                    }
                                });
                                activeMasksetIndex = 0;
                                if (opts.clearMaskOnLostFocus)
                                    input._valueSet('');
                                else {
                                    buffer = getActiveBufferTemplate().slice();
                                    writeBuffer(input, buffer);
                                }
                            }
                        }
                    }).bind("focus.inputmask", function () {
                        var $input = $(this), input = this, nptValue = input._valueGet();
                        if (opts.showMaskOnFocus && !$input.hasClass('focus.inputmask') && (!opts.showMaskOnHover || (opts.showMaskOnHover && nptValue == ''))) {
                            if (input._valueGet() != getActiveBuffer().join('')) {
                                writeBuffer(input, getActiveBuffer(), seekNext(getActiveMaskSet()["lastValidPosition"]));
                            }
                        }
                        $input.addClass('focus.inputmask');
                        valueOnFocus = getActiveBuffer().join('');
                    }).bind("mouseleave.inputmask", function () {
                        var $input = $(this), input = this;
                        if (opts.clearMaskOnLostFocus) {
                            if (!$input.hasClass('focus.inputmask') && input._valueGet() != $input.attr("placeholder")) {
                                if (input._valueGet() == getActiveBufferTemplate().join('') || input._valueGet() == '')
                                    input._valueSet('');
                                else { //clearout optional tail of the mask
                                    clearOptionalTail(input);
                                }
                            }
                        }
                    }).bind("click.inputmask", function () {
                        var input = this;
                        setTimeout(function () {
                            var selectedCaret = caret(input), buffer = getActiveBuffer();
                            if (selectedCaret.begin == selectedCaret.end) {
                                var clickPosition = isRTL ? TranslatePosition(selectedCaret.begin) : selectedCaret.begin,
                                    lvp = getActiveMaskSet()["lastValidPosition"],
                                    lastPosition;
                                if (opts.isNumeric) {
                                    lastPosition = opts.skipRadixDance === false && opts.radixPoint != "" && $.inArray(opts.radixPoint, buffer) != -1 ?
                                        (opts.numericInput ? seekNext($.inArray(opts.radixPoint, buffer)) : $.inArray(opts.radixPoint, buffer)) :
                                        seekNext(lvp);
                                } else {
                                    lastPosition = seekNext(lvp);
                                }
                                if (clickPosition < lastPosition) {
                                    if (isMask(clickPosition))
                                        caret(input, clickPosition);
                                    else caret(input, seekNext(clickPosition));
                                } else
                                    caret(input, lastPosition);
                            }
                        }, 0);
                    }).bind('dblclick.inputmask', function () {
                        var input = this;
                        setTimeout(function () {
                            caret(input, 0, seekNext(getActiveMaskSet()["lastValidPosition"]));
                        }, 0);
                    }).bind(pasteEvent + ".inputmask dragdrop.inputmask drop.inputmask", function (e) {
                        if (skipInputEvent === true) {
                            skipInputEvent = false;
                            return true;
                        }
                        var input = this, $input = $(input);

                        //paste event for IE8 and lower I guess ;-)
                        if (e.type == "propertychange" && input._valueGet().length <= getMaskLength()) {
                            return true;
                        }
                        setTimeout(function () {
                            var pasteValue = opts.onBeforePaste != undefined ? opts.onBeforePaste.call(this, input._valueGet()) : input._valueGet();
                            checkVal(input, true, false, pasteValue.split(''), true);
                            if (isComplete(getActiveBuffer()) === true)
                                $input.trigger("complete");
                            $input.click();
                        }, 0);
                    }).bind('setvalue.inputmask', function () {
                        var input = this;
                        checkVal(input, true);
                        valueOnFocus = getActiveBuffer().join('');
                        if (input._valueGet() == getActiveBufferTemplate().join(''))
                            input._valueSet('');
                    }).bind('complete.inputmask', opts.oncomplete
                    ).bind('incomplete.inputmask', opts.onincomplete
                    ).bind('cleared.inputmask', opts.oncleared
                    ).bind("keyup.inputmask", keyupEvent);

                    $el.bind("keydown.inputmask", keydownEvent
                         ).bind("keypress.inputmask", keypressEvent
                         ).bind("keyup.inputmask", keyupEvent);

                    if (androidchrome32 || androidchrome18 || androidchrome29) {
                        $el.bind("input.inputmask", chrome32InputEvent);
                    }
                    if (msie1x)
                        $el.bind("input.inputmask", inputEvent);

                    //apply mask
                    checkVal(el, true, false);
                    valueOnFocus = getActiveBuffer().join('');
                    // Wrap document.activeElement in a try/catch block since IE9 throw "Unspecified error" if document.activeElement is undefined when we are in an IFrame.
                    var activeElement;
                    try {
                        activeElement = document.activeElement;
                    } catch (e) {
                    }
                    if (activeElement === el) { //position the caret when in focus
                        $el.addClass('focus.inputmask');
                        caret(el, seekNext(getActiveMaskSet()["lastValidPosition"]));
                    } else if (opts.clearMaskOnLostFocus) {
                        if (getActiveBuffer().join('') == getActiveBufferTemplate().join('')) {
                            el._valueSet('');
                        } else {
                            clearOptionalTail(el);
                        }
                    } else {
                        writeBuffer(el, getActiveBuffer());
                    }

                    installEventRuler(el);
                }
            }

            //action object
            if (actionObj != undefined) {
                switch (actionObj["action"]) {
                    case "isComplete":
                        return isComplete(actionObj["buffer"]);
                    case "unmaskedvalue":
                        isRTL = actionObj["$input"].data('_inputmask')['isRTL'];
                        return unmaskedvalue(actionObj["$input"], actionObj["skipDatepickerCheck"]);
                    case "mask":
                        mask(actionObj["el"]);
                        break;
                    case "format":
                        $el = $({});
                        $el.data('_inputmask', {
                            'masksets': masksets,
                            'activeMasksetIndex': activeMasksetIndex,
                            'opts': opts,
                            'isRTL': opts.numericInput
                        });
                        if (opts.numericInput) {
                            opts.isNumeric = opts.numericInput;
                            isRTL = true;
                        }

                        checkVal($el, false, false, actionObj["value"].split(''), true);
                        return getActiveBuffer().join('');
                }
            }
        };

        $.inputmask = {
            //options default
            defaults: {
                placeholder: "_",
                optionalmarker: { start: "[", end: "]" },
                quantifiermarker: { start: "{", end: "}" },
                groupmarker: { start: "(", end: ")" },
                escapeChar: "\\",
                mask: null,
                oncomplete: $.noop, //executes when the mask is complete
                onincomplete: $.noop, //executes when the mask is incomplete and focus is lost
                oncleared: $.noop, //executes when the mask is cleared
                repeat: 0, //repetitions of the mask: * ~ forever, otherwise specify an integer
                greedy: true, //true: allocated buffer for the mask and repetitions - false: allocate only if needed
                autoUnmask: false, //automatically unmask when retrieving the value with $.fn.val or value if the browser supports __lookupGetter__ or getOwnPropertyDescriptor
                clearMaskOnLostFocus: true,
                insertMode: true, //insert the input or overwrite the input
                clearIncomplete: false, //clear the incomplete input on blur
                aliases: {}, //aliases definitions => see jquery.inputmask.extensions.js
                onKeyUp: $.noop, //override to implement autocomplete on certain keys for example
                onKeyDown: $.noop, //override to implement autocomplete on certain keys for example
                onBeforePaste: undefined, //executes before masking the pasted value to allow preprocessing of the pasted value.  args => pastedValue => return processedValue
                onUnMask: undefined, //executes after unmasking to allow postprocessing of the unmaskedvalue.  args => maskedValue, unmaskedValue
                showMaskOnFocus: true, //show the mask-placeholder when the input has focus
                showMaskOnHover: true, //show the mask-placeholder when hovering the empty input
                onKeyValidation: $.noop, //executes on every key-press with the result of isValid. Params: result, opts
                skipOptionalPartCharacter: " ", //a character which can be used to skip an optional part of a mask
                showTooltip: false, //show the activemask as tooltip
                numericInput: false, //numericInput input direction style (input shifts to the left while holding the caret position)
                //numeric basic properties
                isNumeric: false, //enable numeric features
                radixPoint: "", //".", // | ","
                skipRadixDance: false, //disable radixpoint caret positioning
                rightAlignNumerics: true, //align numerics to the right
                //numeric basic properties
                definitions: {
                    '9': {
                        validator: "[0-9]",
                        cardinality: 1,
                        definitionSymbol: "*"
                    },
                    'a': {
                        validator: "[A-Za-z\u0410-\u044F\u0401\u0451]",
                        cardinality: 1,
                        definitionSymbol: "*"
                    },
                    '*': {
                        validator: "[A-Za-z\u0410-\u044F\u0401\u04510-9]",
                        cardinality: 1
                    }
                },
                keyCode: {
                    ALT: 18, BACKSPACE: 8, CAPS_LOCK: 20, COMMA: 188, COMMAND: 91, COMMAND_LEFT: 91, COMMAND_RIGHT: 93, CONTROL: 17, DELETE: 46, DOWN: 40, END: 35, ENTER: 13, ESCAPE: 27, HOME: 36, INSERT: 45, LEFT: 37, MENU: 93, NUMPAD_ADD: 107, NUMPAD_DECIMAL: 110, NUMPAD_DIVIDE: 111, NUMPAD_ENTER: 108,
                    NUMPAD_MULTIPLY: 106, NUMPAD_SUBTRACT: 109, PAGE_DOWN: 34, PAGE_UP: 33, PERIOD: 190, RIGHT: 39, SHIFT: 16, SPACE: 32, TAB: 9, UP: 38, WINDOWS: 91
                },
                //specify keycodes which should not be considered in the keypress event, otherwise the preventDefault will stop their default behavior especially in FF
                ignorables: [8, 9, 13, 19, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 93, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123],
                getMaskLength: function (buffer, greedy, repeat, currentBuffer, opts) {
                    var calculatedLength = buffer.length;
                    if (!greedy) {
                        if (repeat == "*") {
                            calculatedLength = currentBuffer.length + 1;
                        } else if (repeat > 1) {
                            calculatedLength += (buffer.length * (repeat - 1));
                        }
                    }
                    return calculatedLength;
                }
            },
            escapeRegex: function (str) {
                var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];
                return str.replace(new RegExp('(\\' + specials.join('|\\') + ')', 'gim'), '\\$1');
            },
            format: function (value, options) {
                var opts = $.extend(true, {}, $.inputmask.defaults, options);
                resolveAlias(opts.alias, options, opts);
                return maskScope(generateMaskSets(opts), 0, opts, { "action": "format", "value": value });
            }
        };

        $.fn.inputmask = function (fn, options) {
            var opts = $.extend(true, {}, $.inputmask.defaults, options),
                masksets,
                activeMasksetIndex = 0;

            if (typeof fn === "string") {
                switch (fn) {
                    case "mask":
                        //resolve possible aliases given by options
                        resolveAlias(opts.alias, options, opts);
                        masksets = generateMaskSets(opts);
                        if (masksets.length == 0) { return this; }

                        return this.each(function () {
                            maskScope($.extend(true, {}, masksets), 0, opts, { "action": "mask", "el": this });
                        });
                    case "unmaskedvalue":
                        var $input = $(this), input = this;
                        if ($input.data('_inputmask')) {
                            masksets = $input.data('_inputmask')['masksets'];
                            activeMasksetIndex = $input.data('_inputmask')['activeMasksetIndex'];
                            opts = $input.data('_inputmask')['opts'];
                            return maskScope(masksets, activeMasksetIndex, opts, { "action": "unmaskedvalue", "$input": $input });
                        } else return $input.val();
                    case "remove":
                        return this.each(function () {
                            var $input = $(this), input = this;
                            if ($input.data('_inputmask')) {
                                masksets = $input.data('_inputmask')['masksets'];
                                activeMasksetIndex = $input.data('_inputmask')['activeMasksetIndex'];
                                opts = $input.data('_inputmask')['opts'];
                                //writeout the unmaskedvalue
                                input._valueSet(maskScope(masksets, activeMasksetIndex, opts, { "action": "unmaskedvalue", "$input": $input, "skipDatepickerCheck": true }));
                                //clear data
                                $input.removeData('_inputmask');
                                //unbind all events
                                $input.unbind(".inputmask");
                                $input.removeClass('focus.inputmask');
                                //restore the value property
                                var valueProperty;
                                if (Object.getOwnPropertyDescriptor)
                                    valueProperty = Object.getOwnPropertyDescriptor(input, "value");
                                if (valueProperty && valueProperty.get) {
                                    if (input._valueGet) {
                                        Object.defineProperty(input, "value", {
                                            get: input._valueGet,
                                            set: input._valueSet
                                        });
                                    }
                                } else if (document.__lookupGetter__ && input.__lookupGetter__("value")) {
                                    if (input._valueGet) {
                                        input.__defineGetter__("value", input._valueGet);
                                        input.__defineSetter__("value", input._valueSet);
                                    }
                                }
                                try { //try catch needed for IE7 as it does not supports deleting fns
                                    delete input._valueGet;
                                    delete input._valueSet;
                                } catch (e) {
                                    input._valueGet = undefined;
                                    input._valueSet = undefined;

                                }
                            }
                        });
                        break;
                    case "getemptymask": //return the default (empty) mask value, usefull for setting the default value in validation
                        if (this.data('_inputmask')) {
                            masksets = this.data('_inputmask')['masksets'];
                            activeMasksetIndex = this.data('_inputmask')['activeMasksetIndex'];
                            return masksets[activeMasksetIndex]['_buffer'].join('');
                        }
                        else return "";
                    case "hasMaskedValue": //check wheter the returned value is masked or not; currently only works reliable when using jquery.val fn to retrieve the value 
                        return this.data('_inputmask') ? !this.data('_inputmask')['opts'].autoUnmask : false;
                    case "isComplete":
                        masksets = this.data('_inputmask')['masksets'];
                        activeMasksetIndex = this.data('_inputmask')['activeMasksetIndex'];
                        opts = this.data('_inputmask')['opts'];
                        return maskScope(masksets, activeMasksetIndex, opts, { "action": "isComplete", "buffer": this[0]._valueGet().split('') });
                    case "getmetadata": //return mask metadata if exists
                        if (this.data('_inputmask')) {
                            masksets = this.data('_inputmask')['masksets'];
                            activeMasksetIndex = this.data('_inputmask')['activeMasksetIndex'];
                            return masksets[activeMasksetIndex]['metadata'];
                        }
                        else return undefined;
                    default:
                        //check if the fn is an alias
                        if (!resolveAlias(fn, options, opts)) {
                            //maybe fn is a mask so we try
                            //set mask
                            opts.mask = fn;
                        }
                        masksets = generateMaskSets(opts);
                        if (masksets.length == 0) { return this; }
                        return this.each(function () {
                            maskScope($.extend(true, {}, masksets), activeMasksetIndex, opts, { "action": "mask", "el": this });
                        });

                        break;
                }
            } else if (typeof fn == "object") {
                opts = $.extend(true, {}, $.inputmask.defaults, fn);

                resolveAlias(opts.alias, fn, opts); //resolve aliases
                masksets = generateMaskSets(opts);
                if (masksets.length == 0) { return this; }
                return this.each(function () {
                    maskScope($.extend(true, {}, masksets), activeMasksetIndex, opts, { "action": "mask", "el": this });
                });
            } else if (fn == undefined) {
                //look for data-inputmask atribute - the attribute should only contain optipns
                return this.each(function () {
                    var attrOptions = $(this).attr("data-inputmask");
                    if (attrOptions && attrOptions != "") {
                        try {
                            attrOptions = attrOptions.replace(new RegExp("'", "g"), '"');
                            var dataoptions = $.parseJSON("{" + attrOptions + "}");
                            $.extend(true, dataoptions, options);
                            opts = $.extend(true, {}, $.inputmask.defaults, dataoptions);
                            resolveAlias(opts.alias, dataoptions, opts);
                            opts.alias = undefined;
                            $(this).inputmask(opts);
                        } catch (ex) { } //need a more relax parseJSON
                    }
                });
            }
        };
    }
})(jQuery);
/*
Input Mask plugin extensions
http://github.com/RobinHerbots/jquery.inputmask
Copyright (c) 2010 - 2014 Robin Herbots
Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
Version: 0.0.0

Optional extensions on the jquery.inputmask base
*/
(function ($) {
    //date & time aliases
    $.extend($.inputmask.defaults.definitions, {
        'h': { //hours
            validator: "[01][0-9]|2[0-3]",
            cardinality: 2,
            prevalidator: [{ validator: "[0-2]", cardinality: 1 }]
        },
        's': { //seconds || minutes
            validator: "[0-5][0-9]",
            cardinality: 2,
            prevalidator: [{ validator: "[0-5]", cardinality: 1 }]
        },
        'd': { //basic day
            validator: "0[1-9]|[12][0-9]|3[01]",
            cardinality: 2,
            prevalidator: [{ validator: "[0-3]", cardinality: 1 }]
        },
        'm': { //basic month
            validator: "0[1-9]|1[012]",
            cardinality: 2,
            prevalidator: [{ validator: "[01]", cardinality: 1 }]
        },
        'y': { //basic year
            validator: "(19|20)\\d{2}",
            cardinality: 4,
            prevalidator: [
                        { validator: "[12]", cardinality: 1 },
                        { validator: "(19|20)", cardinality: 2 },
                        { validator: "(19|20)\\d", cardinality: 3 }
            ]
        }
    });
    $.extend($.inputmask.defaults.aliases, {
        'dd/mm/yyyy': {
            mask: "1/2/y",
            placeholder: "dd/mm/yyyy",
            regex: {
                val1pre: new RegExp("[0-3]"), //daypre
                val1: new RegExp("0[1-9]|[12][0-9]|3[01]"), //day
                val2pre: function (separator) { var escapedSeparator = $.inputmask.escapeRegex.call(this, separator); return new RegExp("((0[1-9]|[12][0-9]|3[01])" + escapedSeparator + "[01])"); }, //monthpre
                val2: function (separator) { var escapedSeparator = $.inputmask.escapeRegex.call(this, separator); return new RegExp("((0[1-9]|[12][0-9])" + escapedSeparator + "(0[1-9]|1[012]))|(30" + escapedSeparator + "(0[13-9]|1[012]))|(31" + escapedSeparator + "(0[13578]|1[02]))"); }//month
            },
            leapday: "29/02/",
            separator: '/',
            yearrange: { minyear: 1900, maxyear: 2099 },
            isInYearRange: function (chrs, minyear, maxyear) {
                var enteredyear = parseInt(chrs.concat(minyear.toString().slice(chrs.length)));
                var enteredyear2 = parseInt(chrs.concat(maxyear.toString().slice(chrs.length)));
                return (enteredyear != NaN ? minyear <= enteredyear && enteredyear <= maxyear : false) ||
            		   (enteredyear2 != NaN ? minyear <= enteredyear2 && enteredyear2 <= maxyear : false);
            },
            determinebaseyear: function (minyear, maxyear, hint) {
                var currentyear = (new Date()).getFullYear();
                if (minyear > currentyear) return minyear;
                if (maxyear < currentyear) {
                    var maxYearPrefix = maxyear.toString().slice(0, 2);
                    var maxYearPostfix = maxyear.toString().slice(2, 4);
                    while (maxyear < maxYearPrefix + hint) {
                        maxYearPrefix--;
                    }
                    var maxxYear = maxYearPrefix + maxYearPostfix;
                    return minyear > maxxYear ? minyear : maxxYear;
                }

                return currentyear;
            },
            onKeyUp: function (e, buffer, opts) {
                var $input = $(this);
                if (e.ctrlKey && e.keyCode == opts.keyCode.RIGHT) {
                    var today = new Date();
                    $input.val(today.getDate().toString() + (today.getMonth() + 1).toString() + today.getFullYear().toString());
                }
            },
            definitions: {
                '1': { //val1 ~ day or month
                    validator: function (chrs, buffer, pos, strict, opts) {
                        var isValid = opts.regex.val1.test(chrs);
                        if (!strict && !isValid) {
                            if (chrs.charAt(1) == opts.separator || "-./".indexOf(chrs.charAt(1)) != -1) {
                                isValid = opts.regex.val1.test("0" + chrs.charAt(0));
                                if (isValid) {
                                    buffer[pos - 1] = "0";
                                    return { "pos": pos, "c": chrs.charAt(0) };
                                }
                            }
                        }
                        return isValid;
                    },
                    cardinality: 2,
                    prevalidator: [{
                        validator: function (chrs, buffer, pos, strict, opts) {
                            var isValid = opts.regex.val1pre.test(chrs);
                            if (!strict && !isValid) {
                                isValid = opts.regex.val1.test("0" + chrs);
                                if (isValid) {
                                    buffer[pos] = "0";
                                    pos++;
                                    return { "pos": pos };
                                }
                            }
                            return isValid;
                        }, cardinality: 1
                    }]
                },
                '2': { //val2 ~ day or month
                    validator: function (chrs, buffer, pos, strict, opts) {
                        var frontValue = buffer.join('').substr(0, 3);
                        if (frontValue.indexOf(opts.placeholder[0]) != -1) frontValue = "01" + opts.separator;
                        var isValid = opts.regex.val2(opts.separator).test(frontValue + chrs);
                        if (!strict && !isValid) {
                            if (chrs.charAt(1) == opts.separator || "-./".indexOf(chrs.charAt(1)) != -1) {
                                isValid = opts.regex.val2(opts.separator).test(frontValue + "0" + chrs.charAt(0));
                                if (isValid) {
                                    buffer[pos - 1] = "0";
                                    return { "pos": pos, "c": chrs.charAt(0) };
                                }
                            }
                        }
                        return isValid;
                    },
                    cardinality: 2,
                    prevalidator: [{
                        validator: function (chrs, buffer, pos, strict, opts) {
                            var frontValue = buffer.join('').substr(0, 3);
                            if (frontValue.indexOf(opts.placeholder[0]) != -1) frontValue = "01" + opts.separator;
                            var isValid = opts.regex.val2pre(opts.separator).test(frontValue + chrs);
                            if (!strict && !isValid) {
                                isValid = opts.regex.val2(opts.separator).test(frontValue + "0" + chrs);
                                if (isValid) {
                                    buffer[pos] = "0";
                                    pos++;
                                    return { "pos": pos };
                                }
                            }
                            return isValid;
                        }, cardinality: 1
                    }]
                },
                'y': { //year
                    validator: function (chrs, buffer, pos, strict, opts) {
                        if (opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear)) {
                            var dayMonthValue = buffer.join('').substr(0, 6);
                            if (dayMonthValue != opts.leapday)
                                return true;
                            else {
                                var year = parseInt(chrs, 10);//detect leap year
                                if (year % 4 === 0)
                                    if (year % 100 === 0)
                                        if (year % 400 === 0)
                                            return true;
                                        else return false;
                                    else return true;
                                else return false;
                            }
                        } else return false;
                    },
                    cardinality: 4,
                    prevalidator: [
                {
                    validator: function (chrs, buffer, pos, strict, opts) {
                        var isValid = opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                        if (!strict && !isValid) {
                            var yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs + "0").toString().slice(0, 1);

                            isValid = opts.isInYearRange(yearPrefix + chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                            if (isValid) {
                                buffer[pos++] = yearPrefix[0];
                                return { "pos": pos };
                            }
                            yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs + "0").toString().slice(0, 2);

                            isValid = opts.isInYearRange(yearPrefix + chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                            if (isValid) {
                                buffer[pos++] = yearPrefix[0];
                                buffer[pos++] = yearPrefix[1];
                                return { "pos": pos };
                            }
                        }
                        return isValid;
                    },
                    cardinality: 1
                },
                {
                    validator: function (chrs, buffer, pos, strict, opts) {
                        var isValid = opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                        if (!strict && !isValid) {
                            var yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs).toString().slice(0, 2);

                            isValid = opts.isInYearRange(chrs[0] + yearPrefix[1] + chrs[1], opts.yearrange.minyear, opts.yearrange.maxyear);
                            if (isValid) {
                                buffer[pos++] = yearPrefix[1];
                                return { "pos": pos };
                            }

                            yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs).toString().slice(0, 2);
                            if (opts.isInYearRange(yearPrefix + chrs, opts.yearrange.minyear, opts.yearrange.maxyear)) {
                                var dayMonthValue = buffer.join('').substr(0, 6);
                                if (dayMonthValue != opts.leapday)
                                    isValid = true;
                                else {
                                    var year = parseInt(chrs, 10);//detect leap year
                                    if (year % 4 === 0)
                                        if (year % 100 === 0)
                                            if (year % 400 === 0)
                                                isValid = true;
                                            else isValid = false;
                                        else isValid = true;
                                    else isValid = false;
                                }
                            } else isValid = false;
                            if (isValid) {
                                buffer[pos - 1] = yearPrefix[0];
                                buffer[pos++] = yearPrefix[1];
                                buffer[pos++] = chrs[0];
                                return { "pos": pos };
                            }
                        }
                        return isValid;
                    }, cardinality: 2
                },
                {
                    validator: function (chrs, buffer, pos, strict, opts) {
                        return opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                    }, cardinality: 3
                }
                    ]
                }
            },
            insertMode: false,
            autoUnmask: false
        },
        'mm/dd/yyyy': {
            placeholder: "mm/dd/yyyy",
            alias: "dd/mm/yyyy", //reuse functionality of dd/mm/yyyy alias
            regex: {
                val2pre: function (separator) { var escapedSeparator = $.inputmask.escapeRegex.call(this, separator); return new RegExp("((0[13-9]|1[012])" + escapedSeparator + "[0-3])|(02" + escapedSeparator + "[0-2])"); }, //daypre
                val2: function (separator) { var escapedSeparator = $.inputmask.escapeRegex.call(this, separator); return new RegExp("((0[1-9]|1[012])" + escapedSeparator + "(0[1-9]|[12][0-9]))|((0[13-9]|1[012])" + escapedSeparator + "30)|((0[13578]|1[02])" + escapedSeparator + "31)"); }, //day
                val1pre: new RegExp("[01]"), //monthpre
                val1: new RegExp("0[1-9]|1[012]") //month
            },
            leapday: "02/29/",
            onKeyUp: function (e, buffer, opts) {
                var $input = $(this);
                if (e.ctrlKey && e.keyCode == opts.keyCode.RIGHT) {
                    var today = new Date();
                    $input.val((today.getMonth() + 1).toString() + today.getDate().toString() + today.getFullYear().toString());
                }
            }
        },
        'yyyy/mm/dd': {
            mask: "y/1/2",
            placeholder: "yyyy/mm/dd",
            alias: "mm/dd/yyyy",
            leapday: "/02/29",
            onKeyUp: function (e, buffer, opts) {
                var $input = $(this);
                if (e.ctrlKey && e.keyCode == opts.keyCode.RIGHT) {
                    var today = new Date();
                    $input.val(today.getFullYear().toString() + (today.getMonth() + 1).toString() + today.getDate().toString());
                }
            },
            definitions: {
                '2': { //val2 ~ day or month
                    validator: function (chrs, buffer, pos, strict, opts) {
                        var frontValue = buffer.join('').substr(5, 3);
                        if (frontValue.indexOf(opts.placeholder[5]) != -1) frontValue = "01" + opts.separator;
                        var isValid = opts.regex.val2(opts.separator).test(frontValue + chrs);
                        if (!strict && !isValid) {
                            if (chrs.charAt(1) == opts.separator || "-./".indexOf(chrs.charAt(1)) != -1) {
                                isValid = opts.regex.val2(opts.separator).test(frontValue + "0" + chrs.charAt(0));
                                if (isValid) {
                                    buffer[pos - 1] = "0";
                                    return { "pos": pos, "c": chrs.charAt(0) };
                                }
                            }
                        }

                        //check leap yeap
                        if (isValid) {
                            var dayMonthValue = buffer.join('').substr(4, 4) + chrs;
                            if (dayMonthValue != opts.leapday)
                                return true;
                            else {
                                var year = parseInt(buffer.join('').substr(0, 4), 10);  //detect leap year
                                if (year % 4 === 0)
                                    if (year % 100 === 0)
                                        if (year % 400 === 0)
                                            return true;
                                        else return false;
                                    else return true;
                                else return false;
                            }
                        }

                        return isValid;
                    },
                    cardinality: 2,
                    prevalidator: [{
                        validator: function (chrs, buffer, pos, strict, opts) {
                            var frontValue = buffer.join('').substr(5, 3);
                            if (frontValue.indexOf(opts.placeholder[5]) != -1) frontValue = "01" + opts.separator;
                            var isValid = opts.regex.val2pre(opts.separator).test(frontValue + chrs);
                            if (!strict && !isValid) {
                                isValid = opts.regex.val2(opts.separator).test(frontValue + "0" + chrs);
                                if (isValid) {
                                    buffer[pos] = "0";
                                    pos++;
                                    return { "pos": pos };
                                }
                            }
                            return isValid;
                        }, cardinality: 1
                    }]
                }
            }
        },
        'dd.mm.yyyy': {
            mask: "1.2.y",
            placeholder: "dd.mm.yyyy",
            leapday: "29.02.",
            separator: '.',
            alias: "dd/mm/yyyy"
        },
        'dd-mm-yyyy': {
            mask: "1-2-y",
            placeholder: "dd-mm-yyyy",
            leapday: "29-02-",
            separator: '-',
            alias: "dd/mm/yyyy"
        },
        'mm.dd.yyyy': {
            mask: "1.2.y",
            placeholder: "mm.dd.yyyy",
            leapday: "02.29.",
            separator: '.',
            alias: "mm/dd/yyyy"
        },
        'mm-dd-yyyy': {
            mask: "1-2-y",
            placeholder: "mm-dd-yyyy",
            leapday: "02-29-",
            separator: '-',
            alias: "mm/dd/yyyy"
        },
        'yyyy.mm.dd': {
            mask: "y.1.2",
            placeholder: "yyyy.mm.dd",
            leapday: ".02.29",
            separator: '.',
            alias: "yyyy/mm/dd"
        },
        'yyyy-mm-dd': {
            mask: "y-1-2",
            placeholder: "yyyy-mm-dd",
            leapday: "-02-29",
            separator: '-',
            alias: "yyyy/mm/dd"
        },
        'datetime': {
            mask: "1/2/y h:s",
            placeholder: "dd/mm/yyyy hh:mm",
            alias: "dd/mm/yyyy",
            regex: {
                hrspre: new RegExp("[012]"), //hours pre
                hrs24: new RegExp("2[0-9]|1[3-9]"),
                hrs: new RegExp("[01][0-9]|2[0-3]"), //hours
                ampm: new RegExp("^[a|p|A|P][m|M]")
            },
            timeseparator: ':',
            hourFormat: "24", // or 12
            definitions: {
                'h': { //hours
                    validator: function (chrs, buffer, pos, strict, opts) {
                        var isValid = opts.regex.hrs.test(chrs);
                        if (!strict && !isValid) {
                            if (chrs.charAt(1) == opts.timeseparator || "-.:".indexOf(chrs.charAt(1)) != -1) {
                                isValid = opts.regex.hrs.test("0" + chrs.charAt(0));
                                if (isValid) {
                                    buffer[pos - 1] = "0";
                                    buffer[pos] = chrs.charAt(0);
                                    pos++;
                                    return { "pos": pos };
                                }
                            }
                        }

                        if (isValid && opts.hourFormat !== "24" && opts.regex.hrs24.test(chrs)) {

                            var tmp = parseInt(chrs, 10);

                            if (tmp == 24) {
                                buffer[pos + 5] = "a";
                                buffer[pos + 6] = "m";
                            } else {
                                buffer[pos + 5] = "p";
                                buffer[pos + 6] = "m";
                            }

                            tmp = tmp - 12;

                            if (tmp < 10) {
                                buffer[pos] = tmp.toString();
                                buffer[pos - 1] = "0";
                            } else {
                                buffer[pos] = tmp.toString().charAt(1);
                                buffer[pos - 1] = tmp.toString().charAt(0);
                            }

                            return { "pos": pos, "c": buffer[pos] };
                        }

                        return isValid;
                    },
                    cardinality: 2,
                    prevalidator: [{
                        validator: function (chrs, buffer, pos, strict, opts) {
                            var isValid = opts.regex.hrspre.test(chrs);
                            if (!strict && !isValid) {
                                isValid = opts.regex.hrs.test("0" + chrs);
                                if (isValid) {
                                    buffer[pos] = "0";
                                    pos++;
                                    return { "pos": pos };
                                }
                            }
                            return isValid;
                        }, cardinality: 1
                    }]
                },
                't': { //am/pm
                    validator: function (chrs, buffer, pos, strict, opts) {
                        return opts.regex.ampm.test(chrs + "m");
                    },
                    casing: "lower",
                    cardinality: 1
                }
            },
            insertMode: false,
            autoUnmask: false
        },
        'datetime12': {
            mask: "1/2/y h:s t\\m",
            placeholder: "dd/mm/yyyy hh:mm xm",
            alias: "datetime",
            hourFormat: "12"
        },
        'hh:mm t': {
            mask: "h:s t\\m",
            placeholder: "hh:mm xm",
            alias: "datetime",
            hourFormat: "12"
        },
        'h:s t': {
            mask: "h:s t\\m",
            placeholder: "hh:mm xm",
            alias: "datetime",
            hourFormat: "12"
        },
        'hh:mm:ss': {
            mask: "h:s:s",
            autoUnmask: false
        },
        'hh:mm': {
            mask: "h:s",
            autoUnmask: false
        },
        'date': {
            alias: "dd/mm/yyyy" // "mm/dd/yyyy"
        },
        'mm/yyyy': {
            mask: "1/y",
            placeholder: "mm/yyyy",
            leapday: "donotuse",
            separator: '/',
            alias: "mm/dd/yyyy"
        }
    });
})(jQuery);
/*!
 * jQuery Validation Plugin 1.11.1
 *
 * http://bassistance.de/jquery-plugins/jquery-plugin-validation/
 * http://docs.jquery.com/Plugins/Validation
 *
 * Copyright 2013 Jörn Zaefferer
 * Released under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */

(function($) {

$.extend($.fn, {
	// http://docs.jquery.com/Plugins/Validation/validate
	validate: function( options ) {

		// if nothing is selected, return nothing; can't chain anyway
		if ( !this.length ) {
			if ( options && options.debug && window.console ) {
				console.warn( "Nothing selected, can't validate, returning nothing." );
			}
			return;
		}

		// check if a validator for this form was already created
		var validator = $.data( this[0], "validator" );
		if ( validator ) {
			return validator;
		}

		// Add novalidate tag if HTML5.
		this.attr( "novalidate", "novalidate" );

		validator = new $.validator( options, this[0] );
		$.data( this[0], "validator", validator );

		if ( validator.settings.onsubmit ) {

			this.validateDelegate( ":submit", "click", function( event ) {
				if ( validator.settings.submitHandler ) {
					validator.submitButton = event.target;
				}
				// allow suppressing validation by adding a cancel class to the submit button
				if ( $(event.target).hasClass("cancel") ) {
					validator.cancelSubmit = true;
				}

				// allow suppressing validation by adding the html5 formnovalidate attribute to the submit button
				if ( $(event.target).attr("formnovalidate") !== undefined ) {
					validator.cancelSubmit = true;
				}
			});

			// validate the form on submit
			this.submit( function( event ) {
				if ( validator.settings.debug ) {
					// prevent form submit to be able to see console output
					event.preventDefault();
				}
				function handle() {
					var hidden;
					if ( validator.settings.submitHandler ) {
						if ( validator.submitButton ) {
							// insert a hidden input as a replacement for the missing submit button
							hidden = $("<input type='hidden'/>").attr("name", validator.submitButton.name).val( $(validator.submitButton).val() ).appendTo(validator.currentForm);
						}
						validator.settings.submitHandler.call( validator, validator.currentForm, event );
						if ( validator.submitButton ) {
							// and clean up afterwards; thanks to no-block-scope, hidden can be referenced
							hidden.remove();
						}
						return false;
					}
					return true;
				}

				// prevent submit for invalid forms or custom submit handlers
				if ( validator.cancelSubmit ) {
					validator.cancelSubmit = false;
					return handle();
				}
				if ( validator.form() ) {
					if ( validator.pendingRequest ) {
						validator.formSubmitted = true;
						return false;
					}
					return handle();
				} else {
					validator.focusInvalid();
					return false;
				}
			});
		}

		return validator;
	},
	// http://docs.jquery.com/Plugins/Validation/valid
	valid: function() {
		if ( $(this[0]).is("form")) {
			return this.validate().form();
		} else {
			var valid = true;
			var validator = $(this[0].form).validate();
			this.each(function() {
				valid = valid && validator.element(this);
			});
			return valid;
		}
	},
	// attributes: space seperated list of attributes to retrieve and remove
	removeAttrs: function( attributes ) {
		var result = {},
			$element = this;
		$.each(attributes.split(/\s/), function( index, value ) {
			result[value] = $element.attr(value);
			$element.removeAttr(value);
		});
		return result;
	},
	// http://docs.jquery.com/Plugins/Validation/rules
	rules: function( command, argument ) {
		var element = this[0];

		if ( command ) {
			var settings = $.data(element.form, "validator").settings;
			var staticRules = settings.rules;
			var existingRules = $.validator.staticRules(element);
			switch(command) {
			case "add":
				$.extend(existingRules, $.validator.normalizeRule(argument));
				// remove messages from rules, but allow them to be set separetely
				delete existingRules.messages;
				staticRules[element.name] = existingRules;
				if ( argument.messages ) {
					settings.messages[element.name] = $.extend( settings.messages[element.name], argument.messages );
				}
				break;
			case "remove":
				if ( !argument ) {
					delete staticRules[element.name];
					return existingRules;
				}
				var filtered = {};
				$.each(argument.split(/\s/), function( index, method ) {
					filtered[method] = existingRules[method];
					delete existingRules[method];
				});
				return filtered;
			}
		}

		var data = $.validator.normalizeRules(
		$.extend(
			{},
			$.validator.classRules(element),
			$.validator.attributeRules(element),
			$.validator.dataRules(element),
			$.validator.staticRules(element)
		), element);

		// make sure required is at front
		if ( data.required ) {
			var param = data.required;
			delete data.required;
			data = $.extend({required: param}, data);
		}

		return data;
	}
});

// Custom selectors
$.extend($.expr[":"], {
	// http://docs.jquery.com/Plugins/Validation/blank
	blank: function( a ) { return !$.trim("" + $(a).val()); },
	// http://docs.jquery.com/Plugins/Validation/filled
	filled: function( a ) { return !!$.trim("" + $(a).val()); },
	// http://docs.jquery.com/Plugins/Validation/unchecked
	unchecked: function( a ) { return !$(a).prop("checked"); }
});

// constructor for validator
$.validator = function( options, form ) {
	this.settings = $.extend( true, {}, $.validator.defaults, options );
	this.currentForm = form;
	this.init();
};

$.validator.format = function( source, params ) {
	if ( arguments.length === 1 ) {
		return function() {
			var args = $.makeArray(arguments);
			args.unshift(source);
			return $.validator.format.apply( this, args );
		};
	}
	if ( arguments.length > 2 && params.constructor !== Array  ) {
		params = $.makeArray(arguments).slice(1);
	}
	if ( params.constructor !== Array ) {
		params = [ params ];
	}
	$.each(params, function( i, n ) {
		source = source.replace( new RegExp("\\{" + i + "\\}", "g"), function() {
			return n;
		});
	});
	return source;
};

$.extend($.validator, {

	defaults: {
		messages: {},
		groups: {},
		rules: {},
		errorClass: "error",
		validClass: "valid",
		errorElement: "label",
		focusInvalid: true,
		errorContainer: $([]),
		errorLabelContainer: $([]),
		onsubmit: true,
		ignore: ":hidden",
		ignoreTitle: false,
		onfocusin: function( element, event ) {
			this.lastActive = element;

			// hide error label and remove error class on focus if enabled
			if ( this.settings.focusCleanup && !this.blockFocusCleanup ) {
				if ( this.settings.unhighlight ) {
					this.settings.unhighlight.call( this, element, this.settings.errorClass, this.settings.validClass );
				}
				this.addWrapper(this.errorsFor(element)).hide();
			}
		},
		onfocusout: function( element, event ) {
			if ( !this.checkable(element) && (element.name in this.submitted || !this.optional(element)) ) {
				this.element(element);
			}
		},
		onkeyup: function( element, event ) {
			if ( event.which === 9 && this.elementValue(element) === "" ) {
				return;
			} else if ( element.name in this.submitted || element === this.lastElement ) {
				this.element(element);
			}
		},
		onclick: function( element, event ) {
			// click on selects, radiobuttons and checkboxes
			if ( element.name in this.submitted ) {
				this.element(element);
			}
			// or option elements, check parent select in that case
			else if ( element.parentNode.name in this.submitted ) {
				this.element(element.parentNode);
			}
		},
		highlight: function( element, errorClass, validClass ) {
			if ( element.type === "radio" ) {
				this.findByName(element.name).addClass(errorClass).removeClass(validClass);
			} else {
				$(element).addClass(errorClass).removeClass(validClass);
			}
		},
		unhighlight: function( element, errorClass, validClass ) {
			if ( element.type === "radio" ) {
				this.findByName(element.name).removeClass(errorClass).addClass(validClass);
			} else {
				$(element).removeClass(errorClass).addClass(validClass);
			}
		}
	},

	// http://docs.jquery.com/Plugins/Validation/Validator/setDefaults
	setDefaults: function( settings ) {
		$.extend( $.validator.defaults, settings );
	},

	messages: {
		required: "This field is required.",
		remote: "Please fix this field.",
		email: "Please enter a valid email address.",
		url: "Please enter a valid URL.",
		date: "Please enter a valid date.",
		dateISO: "Please enter a valid date (ISO).",
		number: "Please enter a valid number.",
		digits: "Please enter only digits.",
		creditcard: "Please enter a valid credit card number.",
		equalTo: "Please enter the same value again.",
		maxlength: $.validator.format("Please enter no more than {0} characters."),
		minlength: $.validator.format("Please enter at least {0} characters."),
		rangelength: $.validator.format("Please enter a value between {0} and {1} characters long."),
		range: $.validator.format("Please enter a value between {0} and {1}."),
		max: $.validator.format("Please enter a value less than or equal to {0}."),
		min: $.validator.format("Please enter a value greater than or equal to {0}.")
	},

	autoCreateRanges: false,

	prototype: {

		init: function() {
			this.labelContainer = $(this.settings.errorLabelContainer);
			this.errorContext = this.labelContainer.length && this.labelContainer || $(this.currentForm);
			this.containers = $(this.settings.errorContainer).add( this.settings.errorLabelContainer );
			this.submitted = {};
			this.valueCache = {};
			this.pendingRequest = 0;
			this.pending = {};
			this.invalid = {};
			this.reset();

			var groups = (this.groups = {});
			$.each(this.settings.groups, function( key, value ) {
				if ( typeof value === "string" ) {
					value = value.split(/\s/);
				}
				$.each(value, function( index, name ) {
					groups[name] = key;
				});
			});
			var rules = this.settings.rules;
			$.each(rules, function( key, value ) {
				rules[key] = $.validator.normalizeRule(value);
			});

			function delegate(event) {
				var validator = $.data(this[0].form, "validator"),
					eventType = "on" + event.type.replace(/^validate/, "");
				if ( validator.settings[eventType] ) {
					validator.settings[eventType].call(validator, this[0], event);
				}
			}
			$(this.currentForm)
				.validateDelegate(":text, [type='password'], [type='file'], select, textarea, " +
					"[type='number'], [type='search'] ,[type='tel'], [type='url'], " +
					"[type='email'], [type='datetime'], [type='date'], [type='month'], " +
					"[type='week'], [type='time'], [type='datetime-local'], " +
					"[type='range'], [type='color'] ",
					"focusin focusout keyup", delegate)
				.validateDelegate("[type='radio'], [type='checkbox'], select, option", "click", delegate);

			if ( this.settings.invalidHandler ) {
				$(this.currentForm).bind("invalid-form.validate", this.settings.invalidHandler);
			}
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/form
		form: function() {
			this.checkForm();
			$.extend(this.submitted, this.errorMap);
			this.invalid = $.extend({}, this.errorMap);
			if ( !this.valid() ) {
				$(this.currentForm).triggerHandler("invalid-form", [this]);
			}
			this.showErrors();
			return this.valid();
		},

		checkForm: function() {
			this.prepareForm();
			for ( var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++ ) {
				this.check( elements[i] );
			}
			return this.valid();
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/element
		element: function( element ) {
			element = this.validationTargetFor( this.clean( element ) );
			this.lastElement = element;
			this.prepareElement( element );
			this.currentElements = $(element);
			var result = this.check( element ) !== false;
			if ( result ) {
				delete this.invalid[element.name];
			} else {
				this.invalid[element.name] = true;
			}
			if ( !this.numberOfInvalids() ) {
				// Hide error containers on last error
				this.toHide = this.toHide.add( this.containers );
			}
			this.showErrors();
			return result;
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/showErrors
		showErrors: function( errors ) {
			if ( errors ) {
				// add items to error list and map
				$.extend( this.errorMap, errors );
				this.errorList = [];
				for ( var name in errors ) {
					this.errorList.push({
						message: errors[name],
						element: this.findByName(name)[0]
					});
				}
				// remove items from success list
				this.successList = $.grep( this.successList, function( element ) {
					return !(element.name in errors);
				});
			}
			if ( this.settings.showErrors ) {
				this.settings.showErrors.call( this, this.errorMap, this.errorList );
			} else {
				this.defaultShowErrors();
			}
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/resetForm
		resetForm: function() {
			if ( $.fn.resetForm ) {
				$(this.currentForm).resetForm();
			}
			this.submitted = {};
			this.lastElement = null;
			this.prepareForm();
			this.hideErrors();
			this.elements().removeClass( this.settings.errorClass ).removeData( "previousValue" );
		},

		numberOfInvalids: function() {
			return this.objectLength(this.invalid);
		},

		objectLength: function( obj ) {
			var count = 0;
			for ( var i in obj ) {
				count++;
			}
			return count;
		},

		hideErrors: function() {
			this.addWrapper( this.toHide ).hide();
		},

		valid: function() {
			return this.size() === 0;
		},

		size: function() {
			return this.errorList.length;
		},

		focusInvalid: function() {
			if ( this.settings.focusInvalid ) {
				try {
					$(this.findLastActive() || this.errorList.length && this.errorList[0].element || [])
					.filter(":visible")
					.focus()
					// manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
					.trigger("focusin");
				} catch(e) {
					// ignore IE throwing errors when focusing hidden elements
				}
			}
		},

		findLastActive: function() {
			var lastActive = this.lastActive;
			return lastActive && $.grep(this.errorList, function( n ) {
				return n.element.name === lastActive.name;
			}).length === 1 && lastActive;
		},

		elements: function() {
			var validator = this,
				rulesCache = {};

			// select all valid inputs inside the form (no submit or reset buttons)
			return $(this.currentForm)
			.find("input, select, textarea")
			.not(":submit, :reset, :image, [disabled]")
			.not( this.settings.ignore )
			.filter(function() {
				if ( !this.name && validator.settings.debug && window.console ) {
					console.error( "%o has no name assigned", this);
				}

				// select only the first element for each name, and only those with rules specified
				if ( this.name in rulesCache || !validator.objectLength($(this).rules()) ) {
					return false;
				}

				rulesCache[this.name] = true;
				return true;
			});
		},

		clean: function( selector ) {
			return $(selector)[0];
		},

		errors: function() {
			var errorClass = this.settings.errorClass.replace(" ", ".");
			return $(this.settings.errorElement + "." + errorClass, this.errorContext);
		},

		reset: function() {
			this.successList = [];
			this.errorList = [];
			this.errorMap = {};
			this.toShow = $([]);
			this.toHide = $([]);
			this.currentElements = $([]);
		},

		prepareForm: function() {
			this.reset();
			this.toHide = this.errors().add( this.containers );
		},

		prepareElement: function( element ) {
			this.reset();
			this.toHide = this.errorsFor(element);
		},

		elementValue: function( element ) {
			var type = $(element).attr("type"),
				val = $(element).val();

			if ( type === "radio" || type === "checkbox" ) {
				return $("input[name='" + $(element).attr("name") + "']:checked").val();
			}

			if ( typeof val === "string" ) {
				return val.replace(/\r/g, "");
			}
			return val;
		},

		check: function( element ) {
			element = this.validationTargetFor( this.clean( element ) );

			var rules = $(element).rules();
			var dependencyMismatch = false;
			var val = this.elementValue(element);
			var result;

			for (var method in rules ) {
				var rule = { method: method, parameters: rules[method] };
				try {

					result = $.validator.methods[method].call( this, val, element, rule.parameters );

					// if a method indicates that the field is optional and therefore valid,
					// don't mark it as valid when there are no other rules
					if ( result === "dependency-mismatch" ) {
						dependencyMismatch = true;
						continue;
					}
					dependencyMismatch = false;

					if ( result === "pending" ) {
						this.toHide = this.toHide.not( this.errorsFor(element) );
						return;
					}

					if ( !result ) {
						this.formatAndAdd( element, rule );
						return false;
					}
				} catch(e) {
					if ( this.settings.debug && window.console ) {
						console.log( "Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.", e );
					}
					throw e;
				}
			}
			if ( dependencyMismatch ) {
				return;
			}
			if ( this.objectLength(rules) ) {
				this.successList.push(element);
			}
			return true;
		},

		// return the custom message for the given element and validation method
		// specified in the element's HTML5 data attribute
		customDataMessage: function( element, method ) {
			return $(element).data("msg-" + method.toLowerCase()) || (element.attributes && $(element).attr("data-msg-" + method.toLowerCase()));
		},

		// return the custom message for the given element name and validation method
		customMessage: function( name, method ) {
			var m = this.settings.messages[name];
			return m && (m.constructor === String ? m : m[method]);
		},

		// return the first defined argument, allowing empty strings
		findDefined: function() {
			for(var i = 0; i < arguments.length; i++) {
				if ( arguments[i] !== undefined ) {
					return arguments[i];
				}
			}
			return undefined;
		},

		defaultMessage: function( element, method ) {
			return this.findDefined(
				this.customMessage( element.name, method ),
				this.customDataMessage( element, method ),
				// title is never undefined, so handle empty string as undefined
				!this.settings.ignoreTitle && element.title || undefined,
				$.validator.messages[method],
				"<strong>Warning: No message defined for " + element.name + "</strong>"
			);
		},

		formatAndAdd: function( element, rule ) {
			var message = this.defaultMessage( element, rule.method ),
				theregex = /\$?\{(\d+)\}/g;
			if ( typeof message === "function" ) {
				message = message.call(this, rule.parameters, element);
			} else if (theregex.test(message)) {
				message = $.validator.format(message.replace(theregex, "{$1}"), rule.parameters);
			}
			this.errorList.push({
				message: message,
				element: element
			});

			this.errorMap[element.name] = message;
			this.submitted[element.name] = message;
		},

		addWrapper: function( toToggle ) {
			if ( this.settings.wrapper ) {
				toToggle = toToggle.add( toToggle.parent( this.settings.wrapper ) );
			}
			return toToggle;
		},

		defaultShowErrors: function() {
			var i, elements;
			for ( i = 0; this.errorList[i]; i++ ) {
				var error = this.errorList[i];
				if ( this.settings.highlight ) {
					this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
				}
				this.showLabel( error.element, error.message );
			}
			if ( this.errorList.length ) {
				this.toShow = this.toShow.add( this.containers );
			}
			if ( this.settings.success ) {
				for ( i = 0; this.successList[i]; i++ ) {
					this.showLabel( this.successList[i] );
				}
			}
			if ( this.settings.unhighlight ) {
				for ( i = 0, elements = this.validElements(); elements[i]; i++ ) {
					this.settings.unhighlight.call( this, elements[i], this.settings.errorClass, this.settings.validClass );
				}
			}
			this.toHide = this.toHide.not( this.toShow );
			this.hideErrors();
			this.addWrapper( this.toShow ).show();
		},

		validElements: function() {
			return this.currentElements.not(this.invalidElements());
		},

		invalidElements: function() {
			return $(this.errorList).map(function() {
				return this.element;
			});
		},

		showLabel: function( element, message ) {
			var label = this.errorsFor( element );
			if ( label.length ) {
				// refresh error/success class
				label.removeClass( this.settings.validClass ).addClass( this.settings.errorClass );
				// replace message on existing label
				label.html(message);
			} else {
				// create label
				label = $("<" + this.settings.errorElement + ">")
					.attr("for", this.idOrName(element))
					.addClass(this.settings.errorClass)
					.html(message || "");
				if ( this.settings.wrapper ) {
					// make sure the element is visible, even in IE
					// actually showing the wrapped element is handled elsewhere
					label = label.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
				}
				if ( !this.labelContainer.append(label).length ) {
					if ( this.settings.errorPlacement ) {
						this.settings.errorPlacement(label, $(element) );
					} else {
						label.insertAfter(element);
					}
				}
			}
			if ( !message && this.settings.success ) {
				label.text("");
				if ( typeof this.settings.success === "string" ) {
					label.addClass( this.settings.success );
				} else {
					this.settings.success( label, element );
				}
			}
			this.toShow = this.toShow.add(label);
		},

		errorsFor: function( element ) {
			var name = this.idOrName(element);
			return this.errors().filter(function() {
				return $(this).attr("for") === name;
			});
		},

		idOrName: function( element ) {
			return this.groups[element.name] || (this.checkable(element) ? element.name : element.id || element.name);
		},

		validationTargetFor: function( element ) {
			// if radio/checkbox, validate first element in group instead
			if ( this.checkable(element) ) {
				element = this.findByName( element.name ).not(this.settings.ignore)[0];
			}
			return element;
		},

		checkable: function( element ) {
			return (/radio|checkbox/i).test(element.type);
		},

		findByName: function( name ) {
			return $(this.currentForm).find("[name='" + name + "']");
		},

		getLength: function( value, element ) {
			switch( element.nodeName.toLowerCase() ) {
			case "select":
				return $("option:selected", element).length;
			case "input":
				if ( this.checkable( element) ) {
					return this.findByName(element.name).filter(":checked").length;
				}
			}
			return value.length;
		},

		depend: function( param, element ) {
			return this.dependTypes[typeof param] ? this.dependTypes[typeof param](param, element) : true;
		},

		dependTypes: {
			"boolean": function( param, element ) {
				return param;
			},
			"string": function( param, element ) {
				return !!$(param, element.form).length;
			},
			"function": function( param, element ) {
				return param(element);
			}
		},

		optional: function( element ) {
			var val = this.elementValue(element);
			return !$.validator.methods.required.call(this, val, element) && "dependency-mismatch";
		},

		startRequest: function( element ) {
			if ( !this.pending[element.name] ) {
				this.pendingRequest++;
				this.pending[element.name] = true;
			}
		},

		stopRequest: function( element, valid ) {
			this.pendingRequest--;
			// sometimes synchronization fails, make sure pendingRequest is never < 0
			if ( this.pendingRequest < 0 ) {
				this.pendingRequest = 0;
			}
			delete this.pending[element.name];
			if ( valid && this.pendingRequest === 0 && this.formSubmitted && this.form() ) {
				$(this.currentForm).submit();
				this.formSubmitted = false;
			} else if (!valid && this.pendingRequest === 0 && this.formSubmitted) {
				$(this.currentForm).triggerHandler("invalid-form", [this]);
				this.formSubmitted = false;
			}
		},

		previousValue: function( element ) {
			return $.data(element, "previousValue") || $.data(element, "previousValue", {
				old: null,
				valid: true,
				message: this.defaultMessage( element, "remote" )
			});
		}

	},

	classRuleSettings: {
		required: {required: true},
		email: {email: true},
		url: {url: true},
		date: {date: true},
		dateISO: {dateISO: true},
		number: {number: true},
		digits: {digits: true},
		creditcard: {creditcard: true}
	},

	addClassRules: function( className, rules ) {
		if ( className.constructor === String ) {
			this.classRuleSettings[className] = rules;
		} else {
			$.extend(this.classRuleSettings, className);
		}
	},

	classRules: function( element ) {
		var rules = {};
		var classes = $(element).attr("class");
		if ( classes ) {
			$.each(classes.split(" "), function() {
				if ( this in $.validator.classRuleSettings ) {
					$.extend(rules, $.validator.classRuleSettings[this]);
				}
			});
		}
		return rules;
	},

	attributeRules: function( element ) {
		var rules = {};
		var $element = $(element);
		var type = $element[0].getAttribute("type");

		for (var method in $.validator.methods) {
			var value;

			// support for <input required> in both html5 and older browsers
			if ( method === "required" ) {
				value = $element.get(0).getAttribute(method);
				// Some browsers return an empty string for the required attribute
				// and non-HTML5 browsers might have required="" markup
				if ( value === "" ) {
					value = true;
				}
				// force non-HTML5 browsers to return bool
				value = !!value;
			} else {
				value = $element.attr(method);
			}

			// convert the value to a number for number inputs, and for text for backwards compability
			// allows type="date" and others to be compared as strings
			if ( /min|max/.test( method ) && ( type === null || /number|range|text/.test( type ) ) ) {
				value = Number(value);
			}

			if ( value ) {
				rules[method] = value;
			} else if ( type === method && type !== 'range' ) {
				// exception: the jquery validate 'range' method
				// does not test for the html5 'range' type
				rules[method] = true;
			}
		}

		// maxlength may be returned as -1, 2147483647 (IE) and 524288 (safari) for text inputs
		if ( rules.maxlength && /-1|2147483647|524288/.test(rules.maxlength) ) {
			delete rules.maxlength;
		}

		return rules;
	},

	dataRules: function( element ) {
		var method, value,
			rules = {}, $element = $(element);
		for (method in $.validator.methods) {
			value = $element.data("rule-" + method.toLowerCase());
			if ( value !== undefined ) {
				rules[method] = value;
			}
		}
		return rules;
	},

	staticRules: function( element ) {
		var rules = {};
		var validator = $.data(element.form, "validator");
		if ( validator.settings.rules ) {
			rules = $.validator.normalizeRule(validator.settings.rules[element.name]) || {};
		}
		return rules;
	},

	normalizeRules: function( rules, element ) {
		// handle dependency check
		$.each(rules, function( prop, val ) {
			// ignore rule when param is explicitly false, eg. required:false
			if ( val === false ) {
				delete rules[prop];
				return;
			}
			if ( val.param || val.depends ) {
				var keepRule = true;
				switch (typeof val.depends) {
				case "string":
					keepRule = !!$(val.depends, element.form).length;
					break;
				case "function":
					keepRule = val.depends.call(element, element);
					break;
				}
				if ( keepRule ) {
					rules[prop] = val.param !== undefined ? val.param : true;
				} else {
					delete rules[prop];
				}
			}
		});

		// evaluate parameters
		$.each(rules, function( rule, parameter ) {
			rules[rule] = $.isFunction(parameter) ? parameter(element) : parameter;
		});

		// clean number parameters
		$.each(['minlength', 'maxlength'], function() {
			if ( rules[this] ) {
				rules[this] = Number(rules[this]);
			}
		});
		$.each(['rangelength', 'range'], function() {
			var parts;
			if ( rules[this] ) {
				if ( $.isArray(rules[this]) ) {
					rules[this] = [Number(rules[this][0]), Number(rules[this][1])];
				} else if ( typeof rules[this] === "string" ) {
					parts = rules[this].split(/[\s,]+/);
					rules[this] = [Number(parts[0]), Number(parts[1])];
				}
			}
		});

		if ( $.validator.autoCreateRanges ) {
			// auto-create ranges
			if ( rules.min && rules.max ) {
				rules.range = [rules.min, rules.max];
				delete rules.min;
				delete rules.max;
			}
			if ( rules.minlength && rules.maxlength ) {
				rules.rangelength = [rules.minlength, rules.maxlength];
				delete rules.minlength;
				delete rules.maxlength;
			}
		}

		return rules;
	},

	// Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
	normalizeRule: function( data ) {
		if ( typeof data === "string" ) {
			var transformed = {};
			$.each(data.split(/\s/), function() {
				transformed[this] = true;
			});
			data = transformed;
		}
		return data;
	},

	// http://docs.jquery.com/Plugins/Validation/Validator/addMethod
	addMethod: function( name, method, message ) {
		$.validator.methods[name] = method;
		$.validator.messages[name] = message !== undefined ? message : $.validator.messages[name];
		if ( method.length < 3 ) {
			$.validator.addClassRules(name, $.validator.normalizeRule(name));
		}
	},

	methods: {

		// http://docs.jquery.com/Plugins/Validation/Methods/required
		required: function( value, element, param ) {
			// check if dependency is met
			if ( !this.depend(param, element) ) {
				return "dependency-mismatch";
			}
			if ( element.nodeName.toLowerCase() === "select" ) {
				// could be an array for select-multiple or a string, both are fine this way
				var val = $(element).val();
				return val && val.length > 0;
			}
			if ( this.checkable(element) ) {
				return this.getLength(value, element) > 0;
			}
			return $.trim(value).length > 0;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/email
		email: function( value, element ) {
			// contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
			return this.optional(element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/url
		url: function( value, element ) {
			// contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
			return this.optional(element) || /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/date
		date: function( value, element ) {
			return this.optional(element) || !/Invalid|NaN/.test(new Date(value).toString());
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/dateISO
		dateISO: function( value, element ) {
			return this.optional(element) || /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/number
		number: function( value, element ) {
			return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/digits
		digits: function( value, element ) {
			return this.optional(element) || /^\d+$/.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/creditcard
		// based on http://en.wikipedia.org/wiki/Luhn
		creditcard: function( value, element ) {
			if ( this.optional(element) ) {
				return "dependency-mismatch";
			}
			// accept only spaces, digits and dashes
			if ( /[^0-9 \-]+/.test(value) ) {
				return false;
			}
			var nCheck = 0,
				nDigit = 0,
				bEven = false;

			value = value.replace(/\D/g, "");

			for (var n = value.length - 1; n >= 0; n--) {
				var cDigit = value.charAt(n);
				nDigit = parseInt(cDigit, 10);
				if ( bEven ) {
					if ( (nDigit *= 2) > 9 ) {
						nDigit -= 9;
					}
				}
				nCheck += nDigit;
				bEven = !bEven;
			}

			return (nCheck % 10) === 0;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/minlength
		minlength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength($.trim(value), element);
			return this.optional(element) || length >= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/maxlength
		maxlength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength($.trim(value), element);
			return this.optional(element) || length <= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/rangelength
		rangelength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength($.trim(value), element);
			return this.optional(element) || ( length >= param[0] && length <= param[1] );
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/min
		min: function( value, element, param ) {
			return this.optional(element) || value >= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/max
		max: function( value, element, param ) {
			return this.optional(element) || value <= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/range
		range: function( value, element, param ) {
			return this.optional(element) || ( value >= param[0] && value <= param[1] );
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/equalTo
		equalTo: function( value, element, param ) {
			// bind to the blur event of the target in order to revalidate whenever the target field is updated
			// TODO find a way to bind the event just once, avoiding the unbind-rebind overhead
			var target = $(param);
			if ( this.settings.onfocusout ) {
				target.unbind(".validate-equalTo").bind("blur.validate-equalTo", function() {
					$(element).valid();
				});
			}
			return value === target.val();
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/remote
		remote: function( value, element, param ) {
			if ( this.optional(element) ) {
				return "dependency-mismatch";
			}

			var previous = this.previousValue(element);
			if (!this.settings.messages[element.name] ) {
				this.settings.messages[element.name] = {};
			}
			previous.originalMessage = this.settings.messages[element.name].remote;
			this.settings.messages[element.name].remote = previous.message;

			param = typeof param === "string" && {url:param} || param;

			if ( previous.old === value ) {
				return previous.valid;
			}

			previous.old = value;
			var validator = this;
			this.startRequest(element);
			var data = {};
			data[element.name] = value;
			$.ajax($.extend(true, {
				url: param,
				mode: "abort",
				port: "validate" + element.name,
				dataType: "json",
				data: data,
				success: function( response ) {
					validator.settings.messages[element.name].remote = previous.originalMessage;
					var valid = response === true || response === "true";
					if ( valid ) {
						var submitted = validator.formSubmitted;
						validator.prepareElement(element);
						validator.formSubmitted = submitted;
						validator.successList.push(element);
						delete validator.invalid[element.name];
						validator.showErrors();
					} else {
						var errors = {};
						var message = response || validator.defaultMessage( element, "remote" );
						errors[element.name] = previous.message = $.isFunction(message) ? message(value) : message;
						validator.invalid[element.name] = true;
						validator.showErrors(errors);
					}
					previous.valid = valid;
					validator.stopRequest(element, valid);
				}
			}, param));
			return "pending";
		}

	}

});

// deprecated, use $.validator.format instead
$.format = $.validator.format;

}(jQuery));

// ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()
(function($) {
	var pendingRequests = {};
	// Use a prefilter if available (1.5+)
	if ( $.ajaxPrefilter ) {
		$.ajaxPrefilter(function( settings, _, xhr ) {
			var port = settings.port;
			if ( settings.mode === "abort" ) {
				if ( pendingRequests[port] ) {
					pendingRequests[port].abort();
				}
				pendingRequests[port] = xhr;
			}
		});
	} else {
		// Proxy ajax
		var ajax = $.ajax;
		$.ajax = function( settings ) {
			var mode = ( "mode" in settings ? settings : $.ajaxSettings ).mode,
				port = ( "port" in settings ? settings : $.ajaxSettings ).port;
			if ( mode === "abort" ) {
				if ( pendingRequests[port] ) {
					pendingRequests[port].abort();
				}
				pendingRequests[port] = ajax.apply(this, arguments);
				return pendingRequests[port];
			}
			return ajax.apply(this, arguments);
		};
	}
}(jQuery));

// provides delegate(type: String, delegate: Selector, handler: Callback) plugin for easier event delegation
// handler is only called when $(event.target).is(delegate), in the scope of the jquery-object for event.target
(function($) {
	$.extend($.fn, {
		validateDelegate: function( delegate, type, handler ) {
			return this.bind(type, function( event ) {
				var target = $(event.target);
				if ( target.is(delegate) ) {
					return handler.apply(target, arguments);
				}
			});
		}
	});
}(jQuery));
/*!
 * jQuery Validation Plugin 1.11.1
 *
 * http://bassistance.de/jquery-plugins/jquery-plugin-validation/
 * http://docs.jquery.com/Plugins/Validation
 *
 * Copyright 2013 Jörn Zaefferer
 * Released under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */

(function() {

	function stripHtml(value) {
		// remove html tags and space chars
		return value.replace(/<.[^<>]*?>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ')
		// remove punctuation
		.replace(/[.(),;:!?%#$'"_+=\/\-]*/g,'');
	}
	jQuery.validator.addMethod("maxWords", function(value, element, params) {
		return this.optional(element) || stripHtml(value).match(/\b\w+\b/g).length <= params;
	}, jQuery.validator.format("Please enter {0} words or less."));

	jQuery.validator.addMethod("minWords", function(value, element, params) {
		return this.optional(element) || stripHtml(value).match(/\b\w+\b/g).length >= params;
	}, jQuery.validator.format("Please enter at least {0} words."));

	jQuery.validator.addMethod("rangeWords", function(value, element, params) {
		var valueStripped = stripHtml(value);
		var regex = /\b\w+\b/g;
		return this.optional(element) || valueStripped.match(regex).length >= params[0] && valueStripped.match(regex).length <= params[1];
	}, jQuery.validator.format("Please enter between {0} and {1} words."));

}());

jQuery.validator.addMethod("letterswithbasicpunc", function(value, element) {
	return this.optional(element) || /^[a-z\-.,()'"\s]+$/i.test(value);
}, "Letters or punctuation only please");

jQuery.validator.addMethod("alphanumeric", function(value, element) {
	return this.optional(element) || /^\w+$/i.test(value);
}, "Letters, numbers, and underscores only please");

jQuery.validator.addMethod("lettersonly", function(value, element) {
	return this.optional(element) || /^[a-z]+$/i.test(value);
}, "Letters only please");

jQuery.validator.addMethod("nowhitespace", function(value, element) {
	return this.optional(element) || /^\S+$/i.test(value);
}, "No white space please");

jQuery.validator.addMethod("ziprange", function(value, element) {
	return this.optional(element) || /^90[2-5]\d\{2\}-\d{4}$/.test(value);
}, "Your ZIP-code must be in the range 902xx-xxxx to 905-xx-xxxx");

jQuery.validator.addMethod("zipcodeUS", function(value, element) {
	return this.optional(element) || /\d{5}-\d{4}$|^\d{5}$/.test(value);
}, "The specified US ZIP Code is invalid");

jQuery.validator.addMethod("integer", function(value, element) {
	return this.optional(element) || /^-?\d+$/.test(value);
}, "A positive or negative non-decimal number please");

/**
 * Return true, if the value is a valid vehicle identification number (VIN).
 *
 * Works with all kind of text inputs.
 *
 * @example <input type="text" size="20" name="VehicleID" class="{required:true,vinUS:true}" />
 * @desc Declares a required input element whose value must be a valid vehicle identification number.
 *
 * @name jQuery.validator.methods.vinUS
 * @type Boolean
 * @cat Plugins/Validate/Methods
 */
jQuery.validator.addMethod("vinUS", function(v) {
	if (v.length !== 17) {
		return false;
	}
	var i, n, d, f, cd, cdv;
	var LL = ["A","B","C","D","E","F","G","H","J","K","L","M","N","P","R","S","T","U","V","W","X","Y","Z"];
	var VL = [1,2,3,4,5,6,7,8,1,2,3,4,5,7,9,2,3,4,5,6,7,8,9];
	var FL = [8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2];
	var rs = 0;
	for(i = 0; i < 17; i++){
		f = FL[i];
		d = v.slice(i,i+1);
		if (i === 8) {
			cdv = d;
		}
		if (!isNaN(d)) {
			d *= f;
		} else {
			for (n = 0; n < LL.length; n++) {
				if (d.toUpperCase() === LL[n]) {
					d = VL[n];
					d *= f;
					if (isNaN(cdv) && n === 8) {
						cdv = LL[n];
					}
					break;
				}
			}
		}
		rs += d;
	}
	cd = rs % 11;
	if (cd === 10) {
		cd = "X";
	}
	if (cd === cdv) {
		return true;
	}
	return false;
}, "The specified vehicle identification number (VIN) is invalid.");

/**
 * Return true, if the value is a valid date, also making this formal check dd/mm/yyyy.
 *
 * @example jQuery.validator.methods.date("01/01/1900")
 * @result true
 *
 * @example jQuery.validator.methods.date("01/13/1990")
 * @result false
 *
 * @example jQuery.validator.methods.date("01.01.1900")
 * @result false
 *
 * @example <input name="pippo" class="{dateITA:true}" />
 * @desc Declares an optional input element whose value must be a valid date.
 *
 * @name jQuery.validator.methods.dateITA
 * @type Boolean
 * @cat Plugins/Validate/Methods
 */
jQuery.validator.addMethod("dateITA", function(value, element) {
	var check = false;
	var re = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
	if( re.test(value)) {
		var adata = value.split('/');
		var gg = parseInt(adata[0],10);
		var mm = parseInt(adata[1],10);
		var aaaa = parseInt(adata[2],10);
		var xdata = new Date(aaaa,mm-1,gg);
		if ( ( xdata.getFullYear() === aaaa ) && ( xdata.getMonth() === mm - 1 ) && ( xdata.getDate() === gg ) ){
			check = true;
		} else {
			check = false;
		}
	} else {
		check = false;
	}
	return this.optional(element) || check;
}, "Please enter a correct date");

/**
 * IBAN is the international bank account number.
 * It has a country - specific format, that is checked here too
 */
jQuery.validator.addMethod("iban", function(value, element) {
	// some quick simple tests to prevent needless work
	if (this.optional(element)) {
		return true;
	}
	if (!(/^([a-zA-Z0-9]{4} ){2,8}[a-zA-Z0-9]{1,4}|[a-zA-Z0-9]{12,34}$/.test(value))) {
		return false;
	}

	// check the country code and find the country specific format
	var iban = value.replace(/ /g,'').toUpperCase(); // remove spaces and to upper case
	var countrycode = iban.substring(0,2);
	var bbancountrypatterns = {
		'AL': "\\d{8}[\\dA-Z]{16}",
		'AD': "\\d{8}[\\dA-Z]{12}",
		'AT': "\\d{16}",
		'AZ': "[\\dA-Z]{4}\\d{20}",
		'BE': "\\d{12}",
		'BH': "[A-Z]{4}[\\dA-Z]{14}",
		'BA': "\\d{16}",
		'BR': "\\d{23}[A-Z][\\dA-Z]",
		'BG': "[A-Z]{4}\\d{6}[\\dA-Z]{8}",
		'CR': "\\d{17}",
		'HR': "\\d{17}",
		'CY': "\\d{8}[\\dA-Z]{16}",
		'CZ': "\\d{20}",
		'DK': "\\d{14}",
		'DO': "[A-Z]{4}\\d{20}",
		'EE': "\\d{16}",
		'FO': "\\d{14}",
		'FI': "\\d{14}",
		'FR': "\\d{10}[\\dA-Z]{11}\\d{2}",
		'GE': "[\\dA-Z]{2}\\d{16}",
		'DE': "\\d{18}",
		'GI': "[A-Z]{4}[\\dA-Z]{15}",
		'GR': "\\d{7}[\\dA-Z]{16}",
		'GL': "\\d{14}",
		'GT': "[\\dA-Z]{4}[\\dA-Z]{20}",
		'HU': "\\d{24}",
		'IS': "\\d{22}",
		'IE': "[\\dA-Z]{4}\\d{14}",
		'IL': "\\d{19}",
		'IT': "[A-Z]\\d{10}[\\dA-Z]{12}",
		'KZ': "\\d{3}[\\dA-Z]{13}",
		'KW': "[A-Z]{4}[\\dA-Z]{22}",
		'LV': "[A-Z]{4}[\\dA-Z]{13}",
		'LB': "\\d{4}[\\dA-Z]{20}",
		'LI': "\\d{5}[\\dA-Z]{12}",
		'LT': "\\d{16}",
		'LU': "\\d{3}[\\dA-Z]{13}",
		'MK': "\\d{3}[\\dA-Z]{10}\\d{2}",
		'MT': "[A-Z]{4}\\d{5}[\\dA-Z]{18}",
		'MR': "\\d{23}",
		'MU': "[A-Z]{4}\\d{19}[A-Z]{3}",
		'MC': "\\d{10}[\\dA-Z]{11}\\d{2}",
		'MD': "[\\dA-Z]{2}\\d{18}",
		'ME': "\\d{18}",
		'NL': "[A-Z]{4}\\d{10}",
		'NO': "\\d{11}",
		'PK': "[\\dA-Z]{4}\\d{16}",
		'PS': "[\\dA-Z]{4}\\d{21}",
		'PL': "\\d{24}",
		'PT': "\\d{21}",
		'RO': "[A-Z]{4}[\\dA-Z]{16}",
		'SM': "[A-Z]\\d{10}[\\dA-Z]{12}",
		'SA': "\\d{2}[\\dA-Z]{18}",
		'RS': "\\d{18}",
		'SK': "\\d{20}",
		'SI': "\\d{15}",
		'ES': "\\d{20}",
		'SE': "\\d{20}",
		'CH': "\\d{5}[\\dA-Z]{12}",
		'TN': "\\d{20}",
		'TR': "\\d{5}[\\dA-Z]{17}",
		'AE': "\\d{3}\\d{16}",
		'GB': "[A-Z]{4}\\d{14}",
		'VG': "[\\dA-Z]{4}\\d{16}"
	};
	var bbanpattern = bbancountrypatterns[countrycode];
	// As new countries will start using IBAN in the
	// future, we only check if the countrycode is known.
	// This prevents false negatives, while almost all
	// false positives introduced by this, will be caught
	// by the checksum validation below anyway.
	// Strict checking should return FALSE for unknown
	// countries.
	if (typeof bbanpattern !== 'undefined') {
		var ibanregexp = new RegExp("^[A-Z]{2}\\d{2}" + bbanpattern + "$", "");
		if (!(ibanregexp.test(iban))) {
			return false; // invalid country specific format
		}
	}

	// now check the checksum, first convert to digits
	var ibancheck = iban.substring(4,iban.length) + iban.substring(0,4);
	var ibancheckdigits = "";
	var leadingZeroes = true;
	var charAt;
	for (var i =0; i<ibancheck.length; i++) {
		charAt = ibancheck.charAt(i);
		if (charAt !== "0") {
			leadingZeroes = false;
		}
		if (!leadingZeroes) {
			ibancheckdigits += "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(charAt);
		}
	}

	// calculate the result of: ibancheckdigits % 97
    var cRest = '';
    var cOperator = '';
	for (var p=0; p<ibancheckdigits.length; p++) {
		var cChar = ibancheckdigits.charAt(p);
		cOperator = '' + cRest + '' + cChar;
		cRest = cOperator % 97;
    }
	return cRest === 1;
}, "Please specify a valid IBAN");

jQuery.validator.addMethod("dateNL", function(value, element) {
	return this.optional(element) || /^(0?[1-9]|[12]\d|3[01])[\.\/\-](0?[1-9]|1[012])[\.\/\-]([12]\d)?(\d\d)$/.test(value);
}, "Please enter a correct date");

/**
 * Dutch phone numbers have 10 digits (or 11 and start with +31).
 */
jQuery.validator.addMethod("phoneNL", function(value, element) {
	return this.optional(element) || /^((\+|00(\s|\s?\-\s?)?)31(\s|\s?\-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?\-\s?)?[0-9]){8}$/.test(value);
}, "Please specify a valid phone number.");

jQuery.validator.addMethod("mobileNL", function(value, element) {
	return this.optional(element) || /^((\+|00(\s|\s?\-\s?)?)31(\s|\s?\-\s?)?(\(0\)[\-\s]?)?|0)6((\s|\s?\-\s?)?[0-9]){8}$/.test(value);
}, "Please specify a valid mobile number");

jQuery.validator.addMethod("postalcodeNL", function(value, element) {
	return this.optional(element) || /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/.test(value);
}, "Please specify a valid postal code");

/*
 * Dutch bank account numbers (not 'giro' numbers) have 9 digits
 * and pass the '11 check'.
 * We accept the notation with spaces, as that is common.
 * acceptable: 123456789 or 12 34 56 789
 */
jQuery.validator.addMethod("bankaccountNL", function(value, element) {
	if (this.optional(element)) {
		return true;
	}
	if (!(/^[0-9]{9}|([0-9]{2} ){3}[0-9]{3}$/.test(value))) {
		return false;
	}
	// now '11 check'
	var account = value.replace(/ /g,''); // remove spaces
	var sum = 0;
	var len = account.length;
	for (var pos=0; pos<len; pos++) {
		var factor = len - pos;
		var digit = account.substring(pos, pos+1);
		sum = sum + factor * digit;
	}
	return sum % 11 === 0;
}, "Please specify a valid bank account number");

/**
 * Dutch giro account numbers (not bank numbers) have max 7 digits
 */
jQuery.validator.addMethod("giroaccountNL", function(value, element) {
	return this.optional(element) || /^[0-9]{1,7}$/.test(value);
}, "Please specify a valid giro account number");

jQuery.validator.addMethod("bankorgiroaccountNL", function(value, element) {
	return this.optional(element) ||
			($.validator.methods["bankaccountNL"].call(this, value, element)) ||
			($.validator.methods["giroaccountNL"].call(this, value, element));
}, "Please specify a valid bank or giro account number");


jQuery.validator.addMethod("time", function(value, element) {
	return this.optional(element) || /^([01]\d|2[0-3])(:[0-5]\d){1,2}$/.test(value);
}, "Please enter a valid time, between 00:00 and 23:59");
jQuery.validator.addMethod("time12h", function(value, element) {
	return this.optional(element) || /^((0?[1-9]|1[012])(:[0-5]\d){1,2}(\ ?[AP]M))$/i.test(value);
}, "Please enter a valid time in 12-hour am/pm format");

/**
 * matches US phone number format
 *
 * where the area code may not start with 1 and the prefix may not start with 1
 * allows '-' or ' ' as a separator and allows parens around area code
 * some people may want to put a '1' in front of their number
 *
 * 1(212)-999-2345 or
 * 212 999 2344 or
 * 212-999-0983
 *
 * but not
 * 111-123-5434
 * and not
 * 212 123 4567
 */
jQuery.validator.addMethod("phoneUS", function(phone_number, element) {
	phone_number = phone_number.replace(/\s+/g, "");
	return this.optional(element) || phone_number.length > 9 &&
		phone_number.match(/^(\+?1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/);
}, "Please specify a valid phone number");

jQuery.validator.addMethod('phoneUK', function(phone_number, element) {
	phone_number = phone_number.replace(/\(|\)|\s+|-/g,'');
	return this.optional(element) || phone_number.length > 9 &&
		phone_number.match(/^(?:(?:(?:00\s?|\+)44\s?)|(?:\(?0))(?:\d{2}\)?\s?\d{4}\s?\d{4}|\d{3}\)?\s?\d{3}\s?\d{3,4}|\d{4}\)?\s?(?:\d{5}|\d{3}\s?\d{3})|\d{5}\)?\s?\d{4,5})$/);
}, 'Please specify a valid phone number');

jQuery.validator.addMethod('mobileUK', function(phone_number, element) {
	phone_number = phone_number.replace(/\(|\)|\s+|-/g,'');
	return this.optional(element) || phone_number.length > 9 &&
		phone_number.match(/^(?:(?:(?:00\s?|\+)44\s?|0)7(?:[45789]\d{2}|624)\s?\d{3}\s?\d{3})$/);
}, 'Please specify a valid mobile number');

//Matches UK landline + mobile, accepting only 01-3 for landline or 07 for mobile to exclude many premium numbers
jQuery.validator.addMethod('phonesUK', function(phone_number, element) {
	phone_number = phone_number.replace(/\(|\)|\s+|-/g,'');
	return this.optional(element) || phone_number.length > 9 &&
		phone_number.match(/^(?:(?:(?:00\s?|\+)44\s?|0)(?:1\d{8,9}|[23]\d{9}|7(?:[45789]\d{8}|624\d{6})))$/);
}, 'Please specify a valid uk phone number');
// On the above three UK functions, do the following server side processing:
//  Compare original input with this RegEx pattern:
//   ^\(?(?:(?:00\)?[\s\-]?\(?|\+)(44)\)?[\s\-]?\(?(?:0\)?[\s\-]?\(?)?|0)([1-9]\d{1,4}\)?[\s\d\-]+)$
//  Extract $1 and set $prefix to '+44<space>' if $1 is '44', otherwise set $prefix to '0'
//  Extract $2 and remove hyphens, spaces and parentheses. Phone number is combined $prefix and $2.
// A number of very detailed GB telephone number RegEx patterns can also be found at:
// http://www.aa-asterisk.org.uk/index.php/Regular_Expressions_for_Validating_and_Formatting_GB_Telephone_Numbers

// Matches UK postcode. Does not match to UK Channel Islands that have their own postcodes (non standard UK)
jQuery.validator.addMethod('postcodeUK', function(value, element) {
	return this.optional(element) || /^((([A-PR-UWYZ][0-9])|([A-PR-UWYZ][0-9][0-9])|([A-PR-UWYZ][A-HK-Y][0-9])|([A-PR-UWYZ][A-HK-Y][0-9][0-9])|([A-PR-UWYZ][0-9][A-HJKSTUW])|([A-PR-UWYZ][A-HK-Y][0-9][ABEHMNPRVWXY]))\s?([0-9][ABD-HJLNP-UW-Z]{2})|(GIR)\s?(0AA))$/i.test(value);
}, 'Please specify a valid UK postcode');

// TODO check if value starts with <, otherwise don't try stripping anything
jQuery.validator.addMethod("strippedminlength", function(value, element, param) {
	return jQuery(value).text().length >= param;
}, jQuery.validator.format("Please enter at least {0} characters"));

// same as email, but TLD is optional
jQuery.validator.addMethod("email2", function(value, element, param) {
	return this.optional(element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
}, jQuery.validator.messages.email);

// same as url, but TLD is optional
jQuery.validator.addMethod("url2", function(value, element, param) {
	return this.optional(element) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
}, jQuery.validator.messages.url);

// NOTICE: Modified version of Castle.Components.Validator.CreditCardValidator
// Redistributed under the the Apache License 2.0 at http://www.apache.org/licenses/LICENSE-2.0
// Valid Types: mastercard, visa, amex, dinersclub, enroute, discover, jcb, unknown, all (overrides all other settings)
jQuery.validator.addMethod("creditcardtypes", function(value, element, param) {
	if (/[^0-9\-]+/.test(value)) {
		return false;
	}

	value = value.replace(/\D/g, "");

	var validTypes = 0x0000;

	if (param.mastercard) {
		validTypes |= 0x0001;
	}
	if (param.visa) {
		validTypes |= 0x0002;
	}
	if (param.amex) {
		validTypes |= 0x0004;
	}
	if (param.dinersclub) {
		validTypes |= 0x0008;
	}
	if (param.enroute) {
		validTypes |= 0x0010;
	}
	if (param.discover) {
		validTypes |= 0x0020;
	}
	if (param.jcb) {
		validTypes |= 0x0040;
	}
	if (param.unknown) {
		validTypes |= 0x0080;
	}
	if (param.all) {
		validTypes = 0x0001 | 0x0002 | 0x0004 | 0x0008 | 0x0010 | 0x0020 | 0x0040 | 0x0080;
	}
	if (validTypes & 0x0001 && /^(5[12345])/.test(value)) { //mastercard
		return value.length === 16;
	}
	if (validTypes & 0x0002 && /^(4)/.test(value)) { //visa
		return value.length === 16;
	}
	if (validTypes & 0x0004 && /^(3[47])/.test(value)) { //amex
		return value.length === 15;
	}
	if (validTypes & 0x0008 && /^(3(0[012345]|[68]))/.test(value)) { //dinersclub
		return value.length === 14;
	}
	if (validTypes & 0x0010 && /^(2(014|149))/.test(value)) { //enroute
		return value.length === 15;
	}
	if (validTypes & 0x0020 && /^(6011)/.test(value)) { //discover
		return value.length === 16;
	}
	if (validTypes & 0x0040 && /^(3)/.test(value)) { //jcb
		return value.length === 16;
	}
	if (validTypes & 0x0040 && /^(2131|1800)/.test(value)) { //jcb
		return value.length === 15;
	}
	if (validTypes & 0x0080) { //unknown
		return true;
	}
	return false;
}, "Please enter a valid credit card number.");

jQuery.validator.addMethod("ipv4", function(value, element, param) {
	return this.optional(element) || /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/i.test(value);
}, "Please enter a valid IP v4 address.");

jQuery.validator.addMethod("ipv6", function(value, element, param) {
	return this.optional(element) || /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/i.test(value);
}, "Please enter a valid IP v6 address.");

/**
* Return true if the field value matches the given format RegExp
*
* @example jQuery.validator.methods.pattern("AR1004",element,/^AR\d{4}$/)
* @result true
*
* @example jQuery.validator.methods.pattern("BR1004",element,/^AR\d{4}$/)
* @result false
*
* @name jQuery.validator.methods.pattern
* @type Boolean
* @cat Plugins/Validate/Methods
*/
jQuery.validator.addMethod("pattern", function(value, element, param) {
	if (this.optional(element)) {
		return true;
	}
	if (typeof param === 'string') {
		param = new RegExp('^(?:' + param + ')$');
	}
	return param.test(value);
}, "Invalid format.");


/*
 * Lets you say "at least X inputs that match selector Y must be filled."
 *
 * The end result is that neither of these inputs:
 *
 *  <input class="productinfo" name="partnumber">
 *  <input class="productinfo" name="description">
 *
 *  ...will validate unless at least one of them is filled.
 *
 * partnumber:  {require_from_group: [1,".productinfo"]},
 * description: {require_from_group: [1,".productinfo"]}
 *
 */
jQuery.validator.addMethod("require_from_group", function(value, element, options) {
	var validator = this;
	var selector = options[1];
	var validOrNot = $(selector, element.form).filter(function() {
		return validator.elementValue(this);
	}).length >= options[0];

	if(!$(element).data('being_validated')) {
		var fields = $(selector, element.form);
		fields.data('being_validated', true);
		fields.valid();
		fields.data('being_validated', false);
	}
	return validOrNot;
}, jQuery.format("Please fill at least {0} of these fields."));

/*
 * Lets you say "either at least X inputs that match selector Y must be filled,
 * OR they must all be skipped (left blank)."
 *
 * The end result, is that none of these inputs:
 *
 *  <input class="productinfo" name="partnumber">
 *  <input class="productinfo" name="description">
 *  <input class="productinfo" name="color">
 *
 *  ...will validate unless either at least two of them are filled,
 *  OR none of them are.
 *
 * partnumber:  {skip_or_fill_minimum: [2,".productinfo"]},
 *  description: {skip_or_fill_minimum: [2,".productinfo"]},
 * color:       {skip_or_fill_minimum: [2,".productinfo"]}
 *
 */
jQuery.validator.addMethod("skip_or_fill_minimum", function(value, element, options) {
	var validator = this,
		numberRequired = options[0],
		selector = options[1];
	var numberFilled = $(selector, element.form).filter(function() {
		return validator.elementValue(this);
	}).length;
	var valid = numberFilled >= numberRequired || numberFilled === 0;

	if(!$(element).data('being_validated')) {
		var fields = $(selector, element.form);
		fields.data('being_validated', true);
		fields.valid();
		fields.data('being_validated', false);
	}
	return valid;
}, jQuery.format("Please either skip these fields or fill at least {0} of them."));

// Accept a value from a file input based on a required mimetype
jQuery.validator.addMethod("accept", function(value, element, param) {
	// Split mime on commas in case we have multiple types we can accept
	var typeParam = typeof param === "string" ? param.replace(/\s/g, '').replace(/,/g, '|') : "image/*",
	optionalValue = this.optional(element),
	i, file;

	// Element is optional
	if (optionalValue) {
		return optionalValue;
	}

	if ($(element).attr("type") === "file") {
		// If we are using a wildcard, make it regex friendly
		typeParam = typeParam.replace(/\*/g, ".*");

		// Check if the element has a FileList before checking each file
		if (element.files && element.files.length) {
			for (i = 0; i < element.files.length; i++) {
				file = element.files[i];

				// Grab the mimetype from the loaded file, verify it matches
				if (!file.type.match(new RegExp( ".?(" + typeParam + ")$", "i"))) {
					return false;
				}
			}
		}
	}

	// Either return true because we've validated each file, or because the
	// browser does not support element.files and the FileList feature
	return true;
}, jQuery.format("Please enter a value with a valid mimetype."));

// Older "accept" file extension method. Old docs: http://docs.jquery.com/Plugins/Validation/Methods/accept
jQuery.validator.addMethod("extension", function(value, element, param) {
	param = typeof param === "string" ? param.replace(/,/g, '|') : "png|jpe?g|gif";
	return this.optional(element) || value.match(new RegExp(".(" + param + ")$", "i"));
}, jQuery.format("Please enter a value with a valid extension."));
/*
 * Swipe 2.0
 *
 * Brad Birdsall
 * Copyright 2013, MIT License
 *
*/

function Swipe(container, options) {

  "use strict";

  // utilities
  var noop = function() {}; // simple no operation function
  var offloadFn = function(fn) { setTimeout(fn || noop, 0) }; // offload a functions execution

  // check browser capabilities
  var browser = {
    addEventListener: !!window.addEventListener,
    pointer: window.navigator.pointerEnabled || window.navigator.msPointerEnabled,
    touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
    transitions: (function(temp) {
      var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
      for ( var i in props ) if (temp.style[ props[i] ] !== undefined) return true;
      return false;
    })(document.createElement('swipe'))
  };

  var eventNames = {
    START: 'touchstart',
    MOVE: 'touchmove',
    END: 'touchend'
  };

  var pointerType = 'touch';

  if (window.navigator.pointerEnabled) {
    eventNames.START = "pointerdown";
    eventNames.MOVE = "pointermove";
    eventNames.END = "pointerup";
  } else if (window.navigator.msPointerEnabled) {
    eventNames.START = "MSPointerDown";
    eventNames.MOVE = "MSPointerMove";
    eventNames.END = "MSPointerUp";
    pointerType = 2;
  }

  // quit if no root element
  if (!container) return;
  var element = container.children[0];
  var slides, slidePos, width, length;
  options = options || {};
  var index = parseInt(options.startSlide, 10) || 0;
  var speed = options.speed || 300;
  options.continuous = options.continuous !== undefined ? options.continuous : true;

  function setup() {

    // cache slides
    slides = element.children;
    length = slides.length;

    // set continuous to false if only one slide
    if (slides.length < 2) options.continuous = false;

    //special case if two slides
    if (browser.transitions && options.continuous && slides.length < 3) {
      element.appendChild(slides[0].cloneNode(true));
      element.appendChild(element.children[1].cloneNode(true));
      slides = element.children;
    }

    // create an array to store current positions of each slide
    slidePos = new Array(slides.length);

    // determine width of each slide
    width = container.getBoundingClientRect().width || container.offsetWidth;

    element.style.width = (slides.length * width) + 'px';

    // stack elements
    var pos = slides.length;
    while(pos--) {

      var slide = slides[pos];

      slide.style.width = width + 'px';
      slide.setAttribute('data-index', pos);

      if (browser.transitions) {
        slide.style.left = (pos * -width) + 'px';
        move(pos, index > pos ? -width : (index < pos ? width : 0), 0);
      }

    }

    // reposition elements before and after index
    if (options.continuous && browser.transitions) {
      move(circle(index-1), -width, 0);
      move(circle(index+1), width, 0);
    }

    if (!browser.transitions) element.style.left = (index * -width) + 'px';

    container.style.visibility = 'visible';

  }

  function prev() {

    if (options.continuous) slide(index-1);
    else if (index) slide(index-1);

  }

  function next() {

    if (options.continuous) slide(index+1);
    else if (index < slides.length - 1) slide(index+1);

  }

  function circle(index) {

    // a simple positive modulo using slides.length
    return (slides.length + (index % slides.length)) % slides.length;

  }

  function slide(to, slideSpeed) {

    // do nothing if already on requested slide
    if (index == to) return;

    if (browser.transitions) {

      var direction = Math.abs(index-to) / (index-to); // 1: backward, -1: forward

      // get the actual position of the slide
      if (options.continuous) {
        var natural_direction = direction;
        direction = -slidePos[circle(to)] / width;

        // if going forward but to < index, use to = slides.length + to
        // if going backward but to > index, use to = -slides.length + to
        if (direction !== natural_direction) to =  -direction * slides.length + to;

      }

      var diff = Math.abs(index-to) - 1;

      // move all the slides between index and to in the right direction
      while (diff--) move( circle((to > index ? to : index) - diff - 1), width * direction, 0);

      to = circle(to);

      move(index, width * direction, slideSpeed || speed);
      move(to, 0, slideSpeed || speed);

      if (options.continuous) move(circle(to - direction), -(width * direction), 0); // we need to get the next in place

    } else {

      to = circle(to);
      animate(index * -width, to * -width, slideSpeed || speed);
      //no fallback for a circular continuous if the browser does not accept transitions
    }

    index = to;
    offloadFn(options.callback && options.callback(index, slides[index]));
  }

  function move(index, dist, speed) {

    translate(index, dist, speed);
    slidePos[index] = dist;

  }

  function translate(index, dist, speed) {

    var slide = slides[index];
    var style = slide && slide.style;

    if (!style) return;

    style.webkitTransitionDuration =
    style.MozTransitionDuration =
    style.msTransitionDuration =
    style.OTransitionDuration =
    style.transitionDuration = speed + 'ms';

    style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
    style.msTransform =
    style.MozTransform =
    style.OTransform = 'translateX(' + dist + 'px)';

  }

  function animate(from, to, speed) {

    // if not an animation, just reposition
    if (!speed) {

      element.style.left = to + 'px';
      return;

    }

    var start = +new Date;

    var timer = setInterval(function() {

      var timeElap = +new Date - start;

      if (timeElap > speed) {

        element.style.left = to + 'px';

        if (delay) begin();

        options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

        clearInterval(timer);
        return;

      }

      element.style.left = (( (to - from) * (Math.floor((timeElap / speed) * 100) / 100) ) + from) + 'px';

    }, 4);

  }

  // setup auto slideshow
  var delay = options.auto || 0;
  var interval;

  function begin() {

    interval = setTimeout(next, delay);

  }

  function stop() {

    delay = 0;
    clearTimeout(interval);

  }


  // setup initial vars
  var start = {};
  var delta = {};
  var isScrolling;

  // setup event capturing
  var events = {

    handleEvent: function(event) {

      switch (event.type) {
        case eventNames.START: this.start(event); break;
        case eventNames.MOVE: this.move(event); break;
        case eventNames.END: offloadFn(this.end(event)); break;
        case 'webkitTransitionEnd':
        case 'msTransitionEnd':
        case 'oTransitionEnd':
        case 'otransitionend':
        case 'transitionend': offloadFn(this.transitionEnd(event)); break;
        case 'resize': offloadFn(setup); break;
      }

      if (options.stopPropagation) event.stopPropagation();

    },
    start: function(event) {

      if ( browser.pointer && (event.pointerType !== pointerType) ) return;

      var touches = browser.touch ? event.touches[0] : event;

      // measure start values
      start = {

        // get initial touch coords
        x: touches.pageX,
        y: touches.pageY,

        // store time to determine touch duration
        time: +new Date

      };

      // used for testing first move event
      isScrolling = undefined;

      // reset delta and end measurements
      delta = {};

      // attach touchmove and touchend listeners
      element.addEventListener(eventNames.MOVE, this, false);
      element.addEventListener(eventNames.END, this, false);

    },
    move: function(event) {

      if ( browser.pointer && (event.pointerType !== pointerType) ) return;

      // ensure swiping with one touch and not pinching
      if ( browser.touch && event.touches.length > 1 || event.scale && event.scale !== 1) return;

      if (options.disableScroll) event.preventDefault();

      var touches = browser.touch ? event.touches[0] : event;

      // measure change in x and y
      delta = {
        x: touches.pageX - start.x,
        y: touches.pageY - start.y
      }

      // determine if scrolling test has run - one time test
      if ( typeof isScrolling == 'undefined') {
        isScrolling = !!( isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
      }

      // if user is not trying to scroll vertically
      if (!isScrolling) {

        // prevent native scrolling
        event.preventDefault();

        // stop slideshow
        stop();

        // increase resistance if first or last slide
        if (options.continuous) { // we don't add resistance at the end

          translate(circle(index-1), delta.x + slidePos[circle(index-1)], 0);
          translate(index, delta.x + slidePos[index], 0);
          translate(circle(index+1), delta.x + slidePos[circle(index+1)], 0);

        } else {

          delta.x =
            delta.x /
              ( (!index && delta.x > 0               // if first slide and sliding left
                || index == slides.length - 1        // or if last slide and sliding right
                && delta.x < 0                       // and if sliding at all
              ) ?
              ( Math.abs(delta.x) / width + 1 )      // determine resistance level
              : 1 );                                 // no resistance if false

          // translate 1:1
          translate(index-1, delta.x + slidePos[index-1], 0);
          translate(index, delta.x + slidePos[index], 0);
          translate(index+1, delta.x + slidePos[index+1], 0);
        }

      }

    },
    end: function(event) {

      // measure duration
      var duration = +new Date - start.time;

      // determine if slide attempt triggers next/prev slide
      var isValidSlide =
            Number(duration) < 250               // if slide duration is less than 250ms
            && Math.abs(delta.x) > 20            // and if slide amt is greater than 20px
            || Math.abs(delta.x) > width/2;      // or if slide amt is greater than half the width

      // determine if slide attempt is past start and end
      var isPastBounds =
            !index && delta.x > 0                            // if first slide and slide amt is greater than 0
            || index == slides.length - 1 && delta.x < 0;    // or if last slide and slide amt is less than 0

      if (options.continuous) isPastBounds = false;

      // determine direction of swipe (true:right, false:left)
      var direction = delta.x < 0;

      // if not scrolling vertically
      if (!isScrolling) {

        if (isValidSlide && !isPastBounds) {

          if (direction) {

            if (options.continuous) { // we need to get the next in this direction in place

              move(circle(index-1), -width, 0);
              move(circle(index+2), width, 0);

            } else {
              move(index-1, -width, 0);
            }

            move(index, slidePos[index]-width, speed);
            move(circle(index+1), slidePos[circle(index+1)]-width, speed);
            index = circle(index+1);

          } else {
            if (options.continuous) { // we need to get the next in this direction in place

              move(circle(index+1), width, 0);
              move(circle(index-2), -width, 0);

            } else {
              move(index+1, width, 0);
            }

            move(index, slidePos[index]+width, speed);
            move(circle(index-1), slidePos[circle(index-1)]+width, speed);
            index = circle(index-1);

          }

          options.callback && options.callback(index, slides[index]);

        } else {

          if (options.continuous) {

            move(circle(index-1), -width, speed);
            move(index, 0, speed);
            move(circle(index+1), width, speed);

          } else {

            move(index-1, -width, speed);
            move(index, 0, speed);
            move(index+1, width, speed);
          }

        }

      }

      // kill touchmove and touchend event listeners until touchstart called again
      element.removeEventListener(eventNames.MOVE, events, false)
      element.removeEventListener(eventNames.END, events, false)

    },
    transitionEnd: function(event) {

      if (parseInt(event.target.getAttribute('data-index'), 10) == index) {

        if (delay) begin();

        options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

      }

    }

  }

  // trigger setup
  setup();

  // start auto slideshow if applicable
  if (delay) begin();


  // add event listeners
  if (browser.addEventListener) {

    // set touchstart event on element
    if (browser.touch || browser.pointer) element.addEventListener(eventNames.START, events, false);

    if (browser.transitions) {
      element.addEventListener('webkitTransitionEnd', events, false);
      element.addEventListener('msTransitionEnd', events, false);
      element.addEventListener('oTransitionEnd', events, false);
      element.addEventListener('otransitionend', events, false);
      element.addEventListener('transitionend', events, false);
    }

    // set resize event on window
    window.addEventListener('resize', events, false);

  } else {

    window.onresize = function () { setup() }; // to play nice with old IE

  }

  // expose the Swipe API
  return {
    setup: function() {

      setup();

    },
    slide: function(to, speed) {

      // cancel slideshow
      stop();

      slide(to, speed);

    },
    prev: function() {

      // cancel slideshow
      stop();

      prev();

    },
    next: function() {

      // cancel slideshow
      stop();

      next();

    },
    stop: function() {

      // cancel slideshow
      stop();

    },
    getPos: function() {

      // return current index position
      return index;

    },
    getNumSlides: function() {

      // return total number of slides
      return length;
    },
    kill: function() {

      // cancel slideshow
      stop();

      // reset element
      element.style.width = 'auto';
      element.style.left = 0;
      element.swipe = null;

      // reset slides
      var pos = slides.length;
      while(pos--) {

        var slide = slides[pos];
        slide.style.width = '100%';
        slide.style.left = 0;

        if (browser.transitions) translate(pos, 0, 0);

      }

      // removed event listeners
      if (browser.addEventListener) {

        // remove current event listeners
        element.removeEventListener(eventNames.START, events, false);
        element.removeEventListener('webkitTransitionEnd', events, false);
        element.removeEventListener('msTransitionEnd', events, false);
        element.removeEventListener('oTransitionEnd', events, false);
        element.removeEventListener('otransitionend', events, false);
        element.removeEventListener('transitionend', events, false);
        window.removeEventListener('resize', events, false);

      }
      else {

        window.onresize = null;

      }

    }
  }

}

if ( window.jQuery || window.Zepto ) {
  (function($) {
    $.fn.Swipe = function(params) {
      return this.each(function() {
        new Swipe($(this)[0], params);
      });
    }
  })($ ||  window.jQuery || window.Zepto )
}
/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// CommonJS
		factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {

	var pluses = /\+/g;

	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}

	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}

	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}

	var config = $.cookie = function (key, value, options) {

		// Write

		if (value !== undefined && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setTime(+t + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// Read

		var result = key ? undefined : {};

		// To prevent the for loop in the first place assign an empty array
		// in case there are no cookies at all. Also prevents odd result when
		// calling $.cookie().
		var cookies = document.cookie ? document.cookie.split('; ') : [];

		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = parts.join('=');

			if (key && key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) === undefined) {
			return false;
		}

		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};

}));
(function (window, document, $, define, undef) {

    'use strict';

    window.COMMON = window.COMMON === undef ? {} : window.COMMON;

    /**
     * Collection of utility methods
     * @author daniel.grobelny@denkwerk.com
     */
    window.COMMON.Utility = {
        inputTimer: null,
        inputTimeout: 300,

        // Get hash bang value(s) as array from current url
        getHashBang: function() {
            var urlHash = window.location.hash;

            // Check if bang exists
            if (urlHash.search(/!/i) !== -1) {
                var hashBang = urlHash.split('/');

                // Remove  first array element (#!)
                hashBang.shift();

                // Check if hash bang array is empty
                if (hashBang.length === 0) {
                    hashBang = false;
                }

                return hashBang;
            } else {
                return false;
            }
        },

        // Set hash bang value (#!) to current url if not already set
        setHashBang: function(value) {
            var urlHref = window.location.href,
                    urlHash = window.location.hash,
                    urlHashBang = this.getHashBang(),
                    hashBangChar = '#!';

            // Check if hash bang value does not exit
            if (urlHashBang === false || $.inArray(value, urlHashBang) === -1) {

                // Check if hash character already exists
                if (urlHref.search(/#/i) !== -1) {
                    hashBangChar = '!'

                    // Check if bang already exists
                    if (urlHash.search(/!/i) !== -1) {
                        hashBangChar = '';
                    }
                }

                window.location.href += [hashBangChar, value].join('/');;
            }
        },

        // Removes hash bang completely from current url
        // - only if window.pushState is supported by browser (not IE < 10)
        removeHashBang: function() {
            if (history.pushState) {
                var urlHref = window.location.href,
                        urlHash = window.location.hash;

                // Check if bang exists
                if (urlHash.search(/!/i) !== -1) {
                    // Check if hash + bang characters have anchor in between
                    if (urlHash.search(/#!/i) === -1) {
                        // Only remove hash bang values
                        urlHash = ['!/', this.getHashBang().join('/')].join('');
                    }

                    // Remove hash from url
                    urlHref = urlHref.replace(urlHash, '');

                    window.history.pushState(null, null, urlHref);
                }
            }
        }
    };

    /**
     * $().log jQuery plugin
     * Simple logger
     * @param logText
     */
    $.fn.log = function(logText) {
        if (typeof console !== "undefined") {
            console.log(logText);
        }
    };

    /**
     * $().inputTimer jQuery plugin
     * Simple input timer to track user-input and trigger actions after timer expires
     * @param command
     * @param value
     * @returns {*}
     */
    $.fn.inputTimer = function(command, value) {
        if (command === 'setTimer') {
            window.COMMON.Utility.inputTimer = value;
        }

        if (command === 'getTimer') {
            return window.COMMON.Utility.inputTimer;
        }

        if (command === 'setTimeout') {
            window.COMMON.Utility.inputTimer = value;
        }

        if (command === 'getTimeout') {
            return window.COMMON.Utility.inputTimeout;
        }

        if (command === 'clear') {
            if (window.COMMON.Utility.inputTimer) {
                clearTimeout(window.COMMON.Utility.inputTimer);
            }
        }
    };

    /**
     * Expects an array of strings with classname to determine if any of them match the given element
     * @param selectors Array
     * @returns {boolean}
     */
    $.fn.hasClasses = function(selectors) {
        var self = this;
        for (var i in selectors) {
            if ($(self).hasClass(selectors[i])) {
                return true;
            }
        }
        return false;
    };

    /**
     * $(element).refreshSelector jQuery plugin
     * Refresh the given JQuery selector (eg. after replacing content)
     * eg call "this.$destinationAirports = this.$destinationAirports.refreshSelector();"
     * after DOM manipulation
     * @returns {*|jQuery|HTMLElement}
     */
    $.fn.refreshSelector = function() {
        return $(this.selector);
    };

    /**
     * $().allowedInputKey jQuery plugin
     * Matches the key-input from the event against a list of forbidden keys (eg. Shift, Alt, Tab etc.)
     * returns true if there was NO match
     * @param e The event
     * @returns {boolean}
     */
    $.fn.allowedInputKey = function(e) {
        //$().log('Key:' + e.which);
        //forbidden keys
        var forbiddenKeys = [9, 16, 17, 18, 20, 255, 37, 38, 39, 40];

        //match the key from the event against the forbiddenKeys array
        return $.inArray(e.which, forbiddenKeys) === -1;
    };

    /**
     * $('#element').userInput(command) jQuery plugin
     * (De)activates the given element by putting a oberlay into the element.
     * @param command
     * @returns {boolean}
     */
    $.fn.userInput = function(command) {
        if (command == 'deactivate' && !this.hasClass('hasBusyOverlay')) {
            var deactivator = '<div class="busy-overlay"><img src="data:image/gif;base64,R0lGODlhUABQAPf/ALl6lf3ehfn09rFtiv3Xav/99//67f7proYbSY0pVP3ehP3lnv/34vu8CbZ2kf/45vzLPP7qsenW3v3hkP701/Xt8dGousCIoP7oqv7mof/89f7wx/3dgc2htNWxwfvCHejU3P3fiP7wyfu+EJQ2Xv7y0P7mpOXO2PzRVf7rtdSvv6NSdKRVd/3ilP3dgvPo7YARQf/56PzSWMGLov/78P3VYf3gjti2xNm4x/3befzMRKhcfM6ktty9yseWq/7sucOOpfzMQv7z0qthgcqcsKBMcNq5x/u7Av3adv3YcMSQpv3ZcpxFavzNR/3jlv7suryCm/3VZadZev7tvPu8BvzOSvu7BLp+mP3gjIggTf7xzfzQUfzPTP3jmPzDIMWSqIIVRP3km/zEJfzPT6VXePu+DrRzj69ph/3Ybq1mhPvAFoQYR/zFKfzTXP3cfNCnuP7uv9/Dz7+Hn38PP/3cf/zLQJ9Lb/u6AP7uwN/E0P7uweDF0P7uwuDG0f79/f/+/f7vw+HH0v/9+fz5+u3e5f723P/++/37/Pv3+ePK1f/78vjz9eHH0/7vxO3d5P/77/7xy/712/Tr7//56uva4v702Pfw8+bR2v7yzu/i6P/34Pbu8f712uzc4/Ln6/z6+//++v/45fDj6P/34fr29/Hm6//45PDk6e7g5v723v/88+vZ4e/h5/7238KMo+TN1/7xyufS2/723e7f5fTq7sKNpP7yz/712fv4+v/9+Ozb4uTM1v7z1PLn7P38/f/+/PzMQcuesf/66/fx9KFPcunX3+LI0/7st/Hl6v7vxf701fzNSOPL1urY4Mmarte1xN3AzYQXRvzOSaFOcfu9DMqbr9e0w/zHMZ5Ibfr3+PzUX/u/E+bQ2Zg9ZNu7yf3gi6xjgvjy9Pu+Dbd4k9Otvf7np+LJ1JAuWN7Czv7tvqJQc4ETQtKqu8eXq97Bzb6Fnd2/zOfT3Pu6Ab6Gnv3cfsiYrcaUqcaVqr2DnMmZrruAmb2EnJ5Jbsyfssygs////yH/C05FVFNDQVBFMi4wAwEAAAAh+QQFDQD/ACwAAAAAUABQAAAI/wD/CRxIsKDBgwgHIqG2JKHDhxAjSkRo5c6RiRgzanx4p+PGjyAzdrwTsqRJhCNPqjQIBQwUkR4nhtERZuXDLHNgnMCYUmIlYHW42HQ4YM4cbDxjRkRTp06IoQlfIDCqYmJPiOmaVjEANWEto+cQSbzqMBeKpia6JkR0zmitsUodZmgqQ5DahCqMIngRkSxCYcua6rnrEJvRAX3jIgzQNAlhhydg5OQG0a9BCkCDRHrs8IxRfpUVGyTQ9Btnh1KNeuAomuAUrY9OO3QFVmxCywPNNi0n2yFbo0AcVryIcEHTNqB6O8w7Z2/CJA3QIIzRpCkgqNVY+BiW0fAcxBtdNP9tiFFDigApHEqxY4eMCl8TI8/J8lFHnSCpJv5KFoIOnacJPbMCe3acsctELb200QJb8CZRJC34R4cCIjxEixwE2nEFMspBZIAJEtKBAQ0SxTIAgcQQIUCHBxXwgwsSdtGKRjesx54URrBIkBb9+RcCJCAJQAQxBA4QC4utdCGhCz8UYFImV2R4AS2y0YBBiCYIY9MuaRC4gjWcwaKAhC1sBtUhKpDBnjqc9RhCMr8QNswXK9zD2XkpaKDjnnz26eefgAYq6KCEFmrooXx6c4EcjDbq6KMXeMNiIXjAYemlmGaKRyS1POqppzOwyEempJKqBzSLfvrpBT2wKEulpZb/ikchiNZq66245qrrrrz2quMnnezRCWeRAMJJcoSdEkgccfTBWSOWAsKAWpu8wmwce3jCmSl6XAoLVyuRAsK1cUhgG2cFCIGpEE6WdAghe1x7giUsPgLJpXoUYghInjByLSPa8mkKtJYm84BGlpxw7R6EHPKnIZHACgcksUWEiATkgkDKoBqoe6ky7SaETLzMvrLJRJkwgspHhfAhy0QGbICvKQ71wWwgp2AkQB7NftQtHopM9AcDgFjKh0Od9NHJJxnFwmwzH1FgKSYZCVKJHpxAJQmzfeCSECF9OIKQIKPCMQmgfiTCLCsO8ZxHQppYusEff4rCbCLwJXRtQn/IoAyHJn4OsmwcVDq0d0KTGG0Xn5QwewlEhyeEiaUU8LkIz3EsAjmzDylSKdB7XsLsKhFFnpDUcFDN4tbNer15HBCRbenZyqXNbCYSmQ633HT3lsndfuTOOUR9Wwq4bLjYHIckE+meUAyKy7aK4xg5L7mllchmcx6aNz98RJ7Dcd1prDDCdvXfRyQLIC8jar2vA70P/z/yw+/2/Ag5ErZsAQEAIfkECQ0A/wAsAAAAAFAAUAAACP8A/wkcSLCgwYMIB15BACChw4cQI0pEuG7OuokYM2p8OKfjxo8gM3acE7KkSYQjT6o02EFdB5EeJ+agkmPlQzJ2ilDCmFIipCN3Rth0+MWOHQc8Y0aEcOdOjaEJN7EwGmdiT4jlmoqLATWhBaNDBkm86rDAh6YhuiYcBM6ohbFKHbpo6qWA2oRxjLLYFJEsQlPUmh6469CBUSV94yJs07QOYYe6iuTsBNGvwQ3y7hyx9dihEqNIOSo2yPROlM4OpRrNI5pkQhNNy3BF7dUoOLEJLQ/UcPbON9oOBw0xys5hxYsI6TUVkwu4w7x29iYcFy20wVENBEP1VgsHqYyG7Xz/+Sgjs46MNCZUmeBZjhwgxvxMpCSZzEcqmoVMNISBS506VTj0ygzuyeGMIxO19NJGbqiRlkQiaPNfHU0M5tAwKhQohwUVOAcRA0hMWAcds0HESjAFXtADIh4epIoTOkwYBWcZnaBEgUpw0yJBKYwx4RgRgIRIDxcUGAwrLdoSxYQ6OKGKSZJYoKEHw9AWAwciIjGKTY7kU+AMu3QWQRMTaiNCV74YA4R7M3RWxX9cYGAIYaTcMAMOnU2wzAQ07Ojnn4AGKuighBZq6KGIJqron4TkEcejkEYqaR4IevgDB3RkqummnHJwTB+ShhrqHi0GwOmppyowi6OiipoHIS1OWuECqrS68MSiuOaq66689urrr8AGK+ywxBZr7LHIJqvssswiWwgfkSyLBxx4LAvHtdZiq+y1cGTb7bbaJsutt+SC+6244SI7rrnlonuuuukeO221ykYCLW0BAQAh+QQFDQD/ACwAAAAAUABQAAAI/wD/CRxIsKDBgwgHBmNBJKHDhxAjSkQ4zU6RiRgzanxop+PGjyAzdrQTsqRJhCNPqjQIbQY0kR4nQgGDb+VDIHLkeMKYUuIJGHOy2HR4IycPnjEjYpszZ8DQhAJq5Sw2sSdEckwRvHiasE9OH4ckWnWYLQFTIFwTHmqXs4/YpA4vMD2HKG3CYjlrCYg4FmGpNUw92HXII+czvnARpmFKcnBCTznl9ILY1yAzoOtiOXb4zCjlxAaZMHW6GaqrqRxBE7SQlVZph17ltAubsPJAUmbnfHnt8JCPnIEcVryIcB5TEtl4O8QrR29CZ+rqIRQFeI61p4QCdfqUsbCcGx/BMf+dllEYAXEEHDKKEyfQKYyQ5aDdCGbOOgkTBWEZcefOCIel7MFeHK9sMlFLL220TwLzRXQMG/3d0UALDyFSzIBxgJCccg/dskyEd6AwikSWnDDgHoTQxmFBjyxBRYTXwKGRJ+uxx8hkKwr0RxjbRLhNF398dAghArJ3giUrwnFNhFQs8YhJpICAYTF1lTaKDCAuQ4FNm+xyYimbtdBAhGwcw5UfpwTC3h6b8ecfFoIM9gkle+iyGQHUECBMjnz26eefgAYq6KCEFmrooYj2SUgeGDbqaB6OrNiCDnVUaumlmOrQQh+OdoohmxxWgemoozYxC6OePkrIimFQSiqpOnT/keistNZq66245qrrrjl+0skenWx2TAApaOBYmuy55VgIdNARwgZBPrXJKyfu5NgGCjRLRwuR2BQlhhJUudkj5WhLhwkGmDRkkXEcuWIrXWjrwg8FgETjgIxYm+MfsDDb7DeYaFTiiSkCWsAPHGjbhSYSISIBhiCQQugkJmjLwQFPOoQMuwVOpEkjqXxUCB+yTMTJBNoqAAts7LmHkSp4wMHHR3rAgYciE/2SjL8BONRJH9tlZAsccGy5EQVEB4yRBhG4kMJTkxDNRy4JjdztQYLwQfQkgf6xAdGtOBQzHglpQjS0gI5y9i8OES0jQl4TzbCfggBCdAwPue1Q1DLHitlnJUlDpLdDmBBtdI6KxAwHznkT/VDiNjO+YuFFRzS4Q0jDoTSHfE9tueMPZb01h3HDMbfgoD9kNhxo87Z666i//VDpp2+Wi9ZwcC3R5Q/FILXfm2W++eeyQ0R5Ja9pfTNGvD8eMyCvtdJI2MynHpEsgJScaPO8FsR99wN9D/4/Y49/UCR8XL1ZQAAh+QQJDQD/ACwFAAAASwBLAAAI/wD/CRxIsKDBgwZ7uOqBsKHDhxAjNrwg54LEixgzOpTDUaPHjxc5ygFJsqRBkSZTDkS1B1VGlBc7qOug8iCjOHkWYYQZkVIRO2RqGqQUJ86lnR0lOrBjR4nQgoMCFZUUMilEdExZbHpaUFTRRH4k8nSIawhTdlwL+klUVJRYqw7fMAU3KG1BSUX71IU4FmGFFUz32DV4qSiliH0P1mI6brDBRXlw6nyYuGCzn0UcOTa4qmgsvnAPmmH6ZbPBQX2mUg5dEF5WS6YNZvoatmFlgYjM2iEX2+Datg4pWkTIg2maT70N4o0TaO9BbzOMIKQF2E6g5AcLxznscQZTABkrmP9B4EAl5DiMPhKzU8SlxEFfssyZg6DmrJYfeexAK9EbiflzROMMdirpsgKAc+zgFoElWQIAGAB2EweDJfnRgXzzZRFMbRR+FEc3AIIBAGwdfiTKEAiusEqJIFUTDYAkeMMiSQhk+IVzM3pkxhpmVJDjj0AGKeSQRBZp5JFIJqnkjEtYcceTUEYppRVJGCmOlFhi2YCROTiZZZZWILHkmGSWaeaZaKapplCgcKIHJ6a1UMUENHDFACBwwMGHaWPUUQcXB/yikgGw5AmHHqGYdkATftahjQglaSCEoXAIUUBvMbjRaB05mOKRIYXoYSgkjzBoSxSN6uCEKhiF0oihjSSy2uEvEfTp5xYpRPQIJIbqUYghOarSgg6NRiFEQwVMaqgQGgipCRKNAuNCDAYxIGqesBjQ2xMBTHHRBm002kQEBfGRJyAMYOcCHRzIGpEhGHDhZxUFccIHJ6AQeAAddCyQ0SMh6DABkIoEwC8va/6jB78TAKumIRPwu+eavPAbgCIJL8DvAQmHwgG77qa5b78JF3xwwgvT0fCaEEuccMV0BMDqmhrTQe6aHsec8D9TdOtRQAAh+QQFDQD/ACwAAAAAUABQAAAI/wD/CRxIsKDBgwgHEupDKKHDhxAjSkSYJ06eiRgzanwYp+PGjyAzdowTsqRJhCNPqjSIag8qkR4nQpvhbuVDRhYXYUwp0ZMcOUBsOqTU8dLOmBF5/HwmNOGgQB0lTeQJUcLPWgKaJhTVMZEfiVQdfrr3M5DWhH4SdRQFFqnDPD/bHTqbUFLHPoMihkUYztXPYnQdXupISa9bhNZ+8gjscFHFPDo5HjaI7OeFF4wdruoYC+Jegx1+3sjscFCfqJJJJgRxNSvphJm6fk34eeAnez+NvXaYdu1biwnR/aw3d3fdjoHyInS0xxHCYTN+rmpKKFCnTxkHxym80cPPNxmH+f9g0c4hzjiBTmF0HIfRxwtyLtCaeEgFGTt2yDgstWfkq00TzeLSR+58YZZEu5yBnx0rWPMQIsWMFAcI2RgHETJXLGiHHPNFZMkJI+1BSHEWFiQAEcQsOEBnGXlyXnu9lEgQDlIsKMVoHx1CSH8dnWBJibEMsCAxRLgWEikgSFgMIq/RcoGGV7C10ia7hFhKZs+ssOAZu2jlxylQxbFHZvflpwKJWn1CyR66ZObDCj4MI+OcdNZp55145qnnnnz26eefdBaCBxyEFmrooXhEUiIA68zh6KOQRrrOOHwcaqmlepSIQKScchqNLINeeikehZQIBRidpgrGFYC26uqrsMb/KuustNYqIyic6MFJZkmUQYAwjDEACKF8ZLbNHXeMMIEhWhkAS6F6hJJZCw0gewcbx9ikgRCGClHAa61sYe0dXChakiGF6FEoJI+UCMc11lKxRLsfhdJIoY1IO6chLRyLrBoL/JHRI5BAWwizdj6yhBXWXpNpRAVwW6gQGuypzDLWyiPDKA8xoC6hsBgwkSaNpPJRF8uEMVEKYljbQAsOVQoHIAxgpMqgxW7URB3AVDKRIFiMgKw4DnHCByegZGQLoRR8FEIddaCRUQw1UEFAU5MQm0tCPyjwA0IGSAM1HHj+sQGhrTjEAR0cJGQC1DIIcucohG7wi0N05J2QIDJAnm2CnYIMC0cMD+VNh0NwQC2NyHRWQigmEBn+EBpQh0CnIqEqErneDlUCDM8+y4gJ0xFJ/tDTUcuYNRx8bL354Q+FPbaFZhOqiUSmP/R2HXEbp0ndApfO+UN8+71bLjJPMlHuDyVex+KvUfA4RsxPXvlrleKh+fLDQ+R5HVWA20ja1HcPURdVqAxo9bYWxH77A70P/z9rtz2/QV1nS1pAACH5BAkNAP8ALAUABQBLAEsAAAj/AP8JHEiwoMGDCBMiRLUHlcKHECNKfLgoT5xAEzNq3FjwUpw4lDiKHKmQ1sc+g0iqXOkn0UdRK2OOzPQxkR+ZODPi6vNRUs6fEZt9jAW0aMJwH/MIMMq0ILePIZtKffExUEqpTH2Z+3gKa1NWH5nd9FoUEc84FWIWAsQJFNmBQuPE00gKRy0jBRvBgQOIwdt/e+IonejLGBA5coAUNKVnLxxYBsiiMgZToiNniOXM2GWwAC/HcIQU+AuxgoXMclQMS/gIkmM9hQyRPoiox4XMwVhFDKV3b6MHswlyU5JZyYmMhgo13gvp0WxWwTJf6IGIowYhoJWN9jrMA2oLaUka/xDx2hTWVzMyO3Mk8w8DQHv1YD2c2Jivn6Aq6bmFFYcrHKQEJ+CABBZo4IEIJqjgggw26KCD1Uxjx4QUVmjhNM44yIKFHHK4goMdENPhiMQE8+CJKKao4oostujii2SNg4AZ4cEoUBZzzJGFD4fY+E890eQ4Bwne+MjKDkLOQQZ7NsbRjZBgAGCJjYdUg2OOCXQw1ouWALCOkN3s4WMxKwgJAziVycRHCFOIhAQ1OUxkxDlCRlONTDFwQIcCIjVwxxGQTDTIF1ciIFMGdNBxgEja3HEHBBrRMgAYZsREQaIK0JCQE020gNAD1DiKgYCGTJAoHgrpUEcQCSngqBfbkbcGSKI2uJVQHbgmVMAH8twRwGyqBJCoEA/hWodCGDhKDXB/RZBoGBAZ+xAEjmrzVyh6chBKtLkqBMkRfwZK1gKJLsrtsQ81+ihZvCQagCIRSfsQqKJiVWqi8sXb7UOu3gGrVHokOoFs+qL7UC4fOPorUzQISwcvE8kLUbJ3UBMDUwckukBGEkNE7R01MCUsB8xK1PFD395RBlPphJCORic/hEQZcSoY84s3u5hzi6qy6qNALXRKVkAAIfkEBQ0A/wAsAAAAAFAAUAAACP8A/wkcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLFhKj2pIsYZCRHVHlQdEzaCg0cRxJFxHi7KEydQSoSV4MDB9JKkw0sjKd08KAiQzkkPYTqkNbLPoKEHR+nc8MehUoZ+Eo0UBfXgnw06R1n1uTDTyER+uh6cpJOPoIZXFeLqM1KSWoSYdFaCSzZhs5Gx7iJUhIely4VxEYYbmUeAYIQUdNpimPggt6CPEQricxRxX4MvRgZ6mvmgpqlVE1Ym6MvcyFOlEX4Nq5BmnoSsRjJLG3utTkBvETra4wghIrpxKqQsBIgTqIh54eyd+DdOvIifdPXppHAlHEAMIBL/htOI4p44jR/6ORVItEJTenTCgWXgoSyQFFEZ4+pw0yuYe5SyUAG8yAeHEAX0phApIMAURzGIOPQIJPLpUYghChZ0CCHnjXSCJRKF4h15D2QoUC+MwMSIJxUZUkh8OkHySG+WnAAgIYdgpIEQBiqToGCIFOMgCKRwZIAIFZpyVykdxrHLJjf9wYBRcOhxV3s1ncLbUKBUosctd2mnyycmlmnmmWimqeaabLbp5ptwxmmRgXTKh0ckvXlzgRx89unnnxd4U1CdhFoZWy1/JproDIMSaiAehfQGzZ6KKnpBD3JmqummnHbq6aeghnqRBikokMJd+bDgwzBdfRUCHXQE/3CXFHbYQYYHvtwUSQuw0qEAJHd5sEKtdpyxi5Em9EpHOTMK9sI7xNoBhYAXFfCDC7120UpvsQxALDFEOEYRJK/CGgKwGfryDK217mCERK100asLP/xYpgDVTEPsACBIWI6yJtSnZiZXEFvEDLQstIECvbaAp0MmjBEGRVesoc9DzKRB7ArPKMQwHSFQ9VAkQdTRBEXRzAHDCQ8dogIZtbKgUAoBpKBBREvUUYesE50xxxzYRGSJEsS0kxIfOjeBFEJLNLAEQr0g8LMKaIIig84ZKGTFHUckNMPP50Ropgk6o5CLQneknRAi5/zsipkGVKHzFAulfYdCKvyMQC9lhpSgMwEM2b0QNj+fYeItwNQBzHRoq63QCTCozLKCaOgcQkOCL+Qz0ArCobM0AtftuEJRTx2bIFfXYYJDmS/09Rxhl5aBzjIEF/joC7Y9x9uPCSONznA81PpCec+BwAuP+V0HGhANP/jPAzz2OzCcNI/7QpAb/9gCWywQkfML6YMAFHGCL6pA5p+fvqhbd32+QU0n8VhAACH5BAkNAP8ALAAAAABQAFAAAAj/AP8JHEiwoMGDCAcW4lMoocOHECNKRIgHDp6JGDNqfAin48aPIDN2hBOypEmEI0+qVJlypUuQLV/KxBhzpk2OHm/qTFhzp0+BPX/uDCr0JtGiM48ifal06cqmTk9CjVqy4kWqNiPpiYS1q9evYMOKHUu2rNmzaNOqXcu2rdu3cOPKnUu3rt27PzjQ2cu3r18Ox5wSyhOnsOHDiPM4CuC3cWMFTvsgnjx5zxQXjjO7eOJ0FmHKlPMQuku6tOnTqFOrLktjQpMJPr3VwkFK5y8MXOrUkeZTiRw5QJj5mSlCm+46TSL4ZDbjtxxnjlwyQHK8jpsYQi2Rcy6H3SaTqpzo/zgexZZTVsGcX+iBCGSEMcfHKKfq55Xv318uabQV5bgOJ6p8hYg3FzgXTCYSxeBGdUgwMJYkFnDnwTAPYdDEcdqIMFEA2+TwUTAr+DNRJ+04N8MrDl1YBxcY/DKRLUfc0cBH6thRBCUT+WIMEL/V4tAEy0xAQ0bA3HFHGx8BYYcdDmQkwDMXGCHTAUY24CBCAKwBAEIVsLBkHGDl4oWRHDi0zhzrJGTBkkMM8lUIRn6ggUNz1JnQIEMsaYFXMZRhZDkP1TmHQ3EsyUIFXdVgJAQQCfqQA0sCgZUWMcoDSaN2OkRJETbiGBUERmoTkaMPKclkVBgYSU0oo2bqUJdfLl1VwAfy3AFZq4NCtKYdbSLlgpFeFCARqQ/hqWdRplBjJAYTEftQoXaw8N1P2iyKkbOPLqmEUMoeocW1rkK0abRC0aMGPRlh+1A/LHSQlrp2wVuXvHSdmeZpWY4jVEAAIfkEBQ0A/wAsAAAAAFAAUAAACP8A/wkcSLCgwYMIBxbiUyihw4cQI0pEiAcOnokYM2p8CKfjxo8gM3aEE7KkSYQjT6o0mEpPKpEeJ7Z8udJhI4uKMKaUqKgioJoOK3XEpDNmREwdKwFNKAhQx0kTd0KM0ZGPoKUJR3Xc8EeiVId/NnQchTVh2LFejTrUtLVrWYSTql6F+BVhLj5P3zpECkcpXbUIKXS0pddhT5x/STqk0RGPqsIOBcMhzBGwQS1JITsUhBcOVId1C1KFA2iuZoRs4XAFbXngL7FwGJwGC5tswooXEbZqO9thXNKmDUbSEwlhgc7Clv4IkEJDRr5+NUoukfGTrj6dHIagQydEMrcRDzf/+qjHonOJfk4FihMnkENYCrjTaVFcoiyXH1Mlsx1x0yv2cexRykM0YCAfHSYY0BtEpIAAYBzFICJRK13I58IPBSx40CGE7AHgCZZoBMl23IWghYYE9cIIgIx4AlIBP7ggXxetaGjJCQDuQcghJk1iwoEY0HAaIsU8CAIpNUXSgnwKiABZKR6yt8smWP2SDIkuQLZee6f4oZcGESgQAWTX6fIJimimqeaabLbp5ptwxinnnHSm2YIOdeSp55586tCChoTk8eCghObhSBV8JppoExr2QeijD+4RBp6KKqpDFxrOIiikhRJS56eghirqqKSWauqpKApDQAMEQOZIIJ2c//mWITaMcMcd1EC2YnvIlHUMG7fe0YATT0YZxytUrnTLMsHesYUmQ0pgZDYmPbIEFcFeo1hvN+a440d/OLFNsNs4AZ6GpewahzG9aATHNcFSscQjbB7iyKZxgCiRJls0u8wtcArgIIARPjRBA8GyccxErmQBxUc9uALPRBUwk+OACSF8xwg2GDJRLOvMscZHM8ghh4voqcdeHw4RQA0ByWFUxBxzpPGRNSbzkNEglOyRHVAe0LxGrwgRsUI1CC3iisnFtInLOTRf4NA0dhSR0B4m+8DjmkDQnAC1CdkhdkKH+GAyy2q+gADN7Dwkth0OFWOyK4uoOQDNTED09kM8mI5sTZonwDAHDCfoPbZDnph8MprY0HxGRHs/hLMcOmuoAs0IoOz24Q4pzfSCiEA9xwwSRf4Q1nJo3dsMNJ8jIeScO1T22bOVsvYcKkxk+kNyy+GKAKedQTM2GO3Ot8nPnLY2DNwUH/tDictRy2lyZDFPRsY/BE8t0HyaPaoEfQ++QOKPT7XV4x9UzQrOnBYQACH5BAkNAP8ALAAABQBLAEsAAAj/AP8JHEiwIMEpLqYYXMiwocOHEBuGoMMhVMSLGDNGjECHzgKNIENqVBWgIy+RKFMy5NNxgiGVMFUamtCRT8ybInl1DKAKp8+MCzpG+EkUYigOFB8UXcqQo0emUAmS7KgsqlWWdFxahTqzI6CtUHXS4QkWYosqE2hoDEpnaNl/oG7x4VRwS506XDD8wniUToiyfxgAggPnK8EITe7W0SYCI0KFWw3AIgxHjymDMegoroOEwVuIGoRQhsOrQENbURTrcNLzs0FDhfRQhvRo4xjFY1K4JvigEeVGFjGqcqJDcRRbrh9Boqyn0EuQmpBs5hADbAFlo4VoUCmijeImB6ya/5JNWISBm4YwcLmrw+rgwgz+/KSBpYkNq3JvgdrNv7///wAGKOCABBZo4IEDLmHFHQw26OCDViSBoDgPVlhhAwjmsKCFFlqBBIIghijiiCSWaOKJKKY4UAVmRGOGigIdYk8Wc8yBAIzekFDjHNEEk6IuK+w4xw6ZoGgJAGDs2E0cKPoRDI01ZhGMHyjG0c2OYABgCYqZ7CDkCrqk6EM0O5LgDUYWSNGBSIT0MQtOa0RpzyEYOVKEHSuItEcceSxykxlrmFGBRgDYYYcrIq0SRxyX+NeHoStI0lAPM5y50CB9LCrpbp+AY+gbDl0gxwUNZbJoIlS6xo6hQ+DikBywNqjkRyKLFvnZJiwYCs1DsMrhkCSL9jHIZ0oY+iKvsTp0yaKrvKXLnUVQAlGvDy2SB59+guWAoUBERO1DijIKVhyGsjDotMk6hKmmVg0yhKEWXPTtQ6bGgWpUb7A6rLfpOjRrrVBVkKsdTMrbr0O0BLtvUUAY6kBG80K0bBzSLpVrEZ1AfLBD1sYRCFM8SMGDRhFDNEsgbxJYsoorp9gyiqKSCuNA3lTKVEAAIfkECQ0A/wAsAAAAAFAAUAAACP8A/wkcSLCgwYMIBz4J8COhw4cQI0pEyIEOh4kYM2p8SKfjxo8gM3akE7KkSYQjT6o0GEZHGJEeJ6bSk2rlQy51gFXCmFKiIjxwANl0+K1OHTQ8Y0bEBAfOzqEIDVQxCmdiT4gxmvIRBDWhCaMyuEa86vDPhqajuiYUJMOoCYlkE2pquuGP2oRwjFYxMFZpwlx8mk666xCN0RB9ST6k0NQWYYe3gOXkBDGuQRpN8ah67DCEUaQc/R7U0vQp56jSjOIJrRhh1qBiTyP8WiesQ8sDf52Fw0C2Q7ZuHVa8iLAVXbu+8erli/CYixQICwSGIwzqkjIEqmM0XOfbR8ZwSmT/BHWLD+WEau7cGYHF0MRKkrl81AMHj4aJfxgAaio0YYsG6t3BxjETtfTSRqkkk5ZEBsDSFBx6mPLQKCgEeMcy5yXnkAZCPAgHLwVIBMc1AVKxxCMaHmRIIfQ1BQmKGP3RxTYBbhMGcin+80AjDzYSCkiPLEFFgNdUpeEjkDyoRyHulUTBMhbKsCBnBSjjoRD3rXQMGwE20AJnprQIhwjMDSUIFiOoRwVn+wXFAI5dCRNFAwRwVt4toOSo55589unnn4AGKuighBZq6J4ArDPHoow26ug646RYCFAeVlopHpEg4Oimm0aT4nSWhtqUHlCAwempYFyRoiyUinppIYfG/yrrrLTWauutuOaa4zA+rNAOZ44E0sknhPmiAhl22MECZ4zEEUcgyKi1yxnJ2rHCDZyVsoezcbyyiU3IXFGtHe+8IBsiEnAbBwjZmCQAEcRUO0AsKVpyArd7EHIISDdIUa0U2O5ZSrPOGtOLRrEMUC0xRAjg5yGO5MHtCZZI9MI7414RbaACgKBuMYg85MEK1Z6xy0R9KAHNR4T0MctEFTCDbykOkWwHGSr4MtELF8gxw0fb5rHIRH6cEoizfTjUzgo+DJPRG3LI4cFHqzh7SUaDULJHJ1A1E/UM4STUsiMIDdKHs5L8eUg7UefhkMRuI5SJs4n44WcgUd9DbELcJqXkRyLOZtKnALVEDcJDfSckCdKD8PlM1B1AlHhClzi7yp6eRC2HJ5I7+9AicA+dIw9RWxPR5AlVHcfVKRYTtSuiI+75Q2ajreEhPkS9h0SoJzR3HHUnt0fUPux7+uwP/R24b+G4EnUxE/WeEC2My2ZN1DxgJD3lzlIim/NyHBw98hCB/qxs6CiBTkbbJzRLIC8f2r6uAs1Pv/26wk1/Qo70QfZpAQEAIfkEBQ0A/wAsAAAAAFAAUAAACP8A/wkcSLCgwYMIB3aR5iShw4cQI0pEqKNOkIkYM2p8WKfjxo8gM3asE7KkSYQjT6o0mINKDpEeJ05xMWXlw213jkDCmFJiKA50Qth0GOXOHQg8Y0ZcQIdOhKEJY5QximFiT4hCmgZQBTVhAKNeCki86hCUjaaAuiYs4MVogLFKHeJpOsGQ2oQYjIqLEZEsQhoBmiq76xCC0Rp94yI80HQBYYdajuTUAtGvQQZAOfB9nLDGHXlIOSo2GKbpU85RqVEVTTJhVjoBNKB2+PVOWIeWB5ptmmy2Q7ZGhSaseBFhuqYtQPl2mPdOmc0HW+ho8VdBUwpQmQ0Jdiij4TtRPh7/oEcnQ0ZQt/hwcshkzhwS7jBCkrztows6mif+YQAIDpy0Cenjnns7ODJRSy9tNMU3AEZkACz+waGHKQ9Zc86AYOgjwHIQaSBEhHDwIhZEg9SCwIAJdOAHhwcZUogeEULySEalDADDgN0kwiJBDzQSYSOhgLRLe+7BAI4oLD4CSYR6FGJXSeQkMOAaM2QzWwHKgCiEbCoJgE80KKrAmSkw+ieCAV2JMsSAc/TwWH//MfAHYXF0454Rj6V3i3Kc+WENDjsGKuighBZq6KGIJqrooow2WlA109gh6aSUVjqNMywWggeInHaKRyQsVCqqqCuwyEenqIKoRwfEjOoqMcGw/yjLpql6WoijuOaq66689urrr8DuSAoOM+D5WCSAcMKnWn6YA4QccrjCmY9xquWIM9DKMcMJY5YJByxorlSBBdnKQY4lV34YoRAjhoRIDxdkGwwrSS7pX5NPbnSCEtkqwa2gplALRzIPaMRKMNle0AMihRoSCa1wyCiRJeSUa0EFiXoIojLtIpTIDNk6Y6BEmTCCykeE9DHLRAZswCSFCYEsBxDmrCiRAHnE0cdHe8SRxyL68ecfHw4Z4QoOpGQUSxxxNPPRKkxfkpEgleix3lCSMN0HLgmlPLJBg/TBtCSG+pEI0/QmlHMeCWXCdCI2DyrK2744xHQcCZnNdCaEDpYSCNO0PHS3Q1nrPMiglEQN0eAOXcL0KoIuknMcQAvO9EOS+1w5i47HAfnilz8EdRxSs1j41hEx7lDYY3Oodxx8px76Q27HAfdytd8uO94QvR47ariIHQfZEqn+EC1aH47a6KUXPztEnVMym9g/Y2Q85jkHMhsrjKQ90fUPzRLIyo6CHyxB5p8vUPrqr60+Qo708fVjAQEAOw=="/></div>';
            this.addClass('hasBusyOverlay');
            this.css('position', 'relative');
            this.append(deactivator);
            return true;
        }

        if (command == 'activate') {
            this.removeClass('hasBusyOverlay');
            this.find('.busy-overlay').remove();
            return true;
        }

        return false;
    };

    /**
     * Provides functionality for IE
     */
    if (!Array.prototype.indexOf)
    {
        Array.prototype.indexOf = function(elt /*, from*/)
        {
            var len = this.length >>> 0;

            var from = Number(arguments[1]) || 0;
            from = (from < 0)
                ? Math.ceil(from)
                : Math.floor(from);
            if (from < 0)
                from += len;

            for (; from < len; from++)
            {
                if (from in this &&
                    this[from] === elt)
                    return from;
            }
            return -1;
        };
    }

    /**
     * Extends inputmask definitions for the passenger-input.
     * Needed more definition symbols to make values stay at the intended position
     */
    $.extend($.inputmask.defaults.definitions, {
        'u': {  //Adults
            validator: "[0-9]",
            cardinality: 1,
            definitionSymbol: "u"
        },
        'c': {  //children
            validator: "[0-9]",
            cardinality: 1,
            definitionSymbol: "c"
        },
        'i': {  //infants
            validator: "[0-9]",
            cardinality: 1,
            definitionSymbol: "i"
        }
    });

    /**
     * Extends inputmask definitions for the passenger-input.
     * Needed more definition symbols to make values stay at the intended position
     */
    $.extend($.inputmask.defaults.definitions, {
        'j': {  //Jahr1
            validator: "[0-9]",
            cardinality: 1,
            definitionSymbol: "j"
        }
    });


    (function ($) {
        $.datepicker._generateHTML = function(inst) {
            var maxDraw, prevText, prev, nextText, next, currentText, gotoDate,
                controls, buttonPanel, firstDay, showWeek, dayNames, dayNamesMin,
                monthNames, monthNamesShort, beforeShowDay, showOtherMonths,
                selectOtherMonths, defaultDate, html, dow, row, group, col, selectedDate,
                cornerClass, calender, thead, day, daysInMonth, leadDays, curRows, numRows,
                printDate, dRow, tbody, daySettings, otherMonth, unselectable,
                tempDate = new Date(),
                today = this._daylightSavingAdjust(
                    new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate())), // clear time
                isRTL = this._get(inst, "isRTL"),
                showButtonPanel = this._get(inst, "showButtonPanel"),
                hideIfNoPrevNext = this._get(inst, "hideIfNoPrevNext"),
                navigationAsDateFormat = this._get(inst, "navigationAsDateFormat"),
                numMonths = this._getNumberOfMonths(inst),
                showCurrentAtPos = this._get(inst, "showCurrentAtPos"),
                stepMonths = this._get(inst, "stepMonths"),
                isMultiMonth = (numMonths[0] !== 1 || numMonths[1] !== 1),
                currentDate = this._daylightSavingAdjust((!inst.currentDay ? new Date(9999, 9, 9) :
                    new Date(inst.currentYear, inst.currentMonth, inst.currentDay))),
                minDate = this._getMinMaxDate(inst, "min"),
                maxDate = this._getMinMaxDate(inst, "max"),
                drawMonth = inst.drawMonth - showCurrentAtPos,
                drawYear = inst.drawYear;

            if (drawMonth < 0) {
                drawMonth += 12;
                drawYear--;
            }
            if (maxDate) {
                maxDraw = this._daylightSavingAdjust(new Date(maxDate.getFullYear(),
                    maxDate.getMonth() - (numMonths[0] * numMonths[1]) + 1, maxDate.getDate()));
                maxDraw = (minDate && maxDraw < minDate ? minDate : maxDraw);
                while (this._daylightSavingAdjust(new Date(drawYear, drawMonth, 1)) > maxDraw) {
                    drawMonth--;
                    if (drawMonth < 0) {
                        drawMonth = 11;
                        drawYear--;
                    }
                }
            }
            inst.drawMonth = drawMonth;
            inst.drawYear = drawYear;

            prevText = this._get(inst, "prevText");
            prevText = (!navigationAsDateFormat ? prevText : this.formatDate(prevText,
                this._daylightSavingAdjust(new Date(drawYear, drawMonth - stepMonths, 1)),
                this._getFormatConfig(inst)));

            prev = (this._canAdjustMonth(inst, -1, drawYear, drawMonth) ?
                "<a class='ui-datepicker-prev ui-corner-all' data-handler='prev' data-event='click'" +
                    " title='" + prevText + "'><span class='ui-icon ui-icon-circle-triangle-" + ( isRTL ? "e" : "w") + "'>" + prevText + "</span></a>" :
                (hideIfNoPrevNext ? "" : "<a class='ui-datepicker-prev ui-corner-all ui-state-disabled' title='"+ prevText +"'><span class='ui-icon ui-icon-circle-triangle-" + ( isRTL ? "e" : "w") + "'>" + prevText + "</span></a>"));

            nextText = this._get(inst, "nextText");
            nextText = (!navigationAsDateFormat ? nextText : this.formatDate(nextText,
                this._daylightSavingAdjust(new Date(drawYear, drawMonth + stepMonths, 1)),
                this._getFormatConfig(inst)));

            next = (this._canAdjustMonth(inst, +1, drawYear, drawMonth) ?
                "<a class='ui-datepicker-next ui-corner-all' data-handler='next' data-event='click'" +
                    " title='" + nextText + "'><span class='ui-icon ui-icon-circle-triangle-" + ( isRTL ? "w" : "e") + "'>" + nextText + "</span></a>" :
                (hideIfNoPrevNext ? "" : "<a class='ui-datepicker-next ui-corner-all ui-state-disabled' title='"+ nextText + "'><span class='ui-icon ui-icon-circle-triangle-" + ( isRTL ? "w" : "e") + "'>" + nextText + "</span></a>"));

            currentText = this._get(inst, "currentText");
            gotoDate = (this._get(inst, "gotoCurrent") && inst.currentDay ? currentDate : today);
            currentText = (!navigationAsDateFormat ? currentText :
                this.formatDate(currentText, gotoDate, this._getFormatConfig(inst)));

            controls = (!inst.inline ? "<button type='button' class='ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all' data-handler='hide' data-event='click'>" +
                this._get(inst, "closeText") + "</button>" : "");

            buttonPanel = (showButtonPanel) ? "<div class='ui-datepicker-buttonpane ui-widget-content'>" + (isRTL ? controls : "") +
                (this._isInRange(inst, gotoDate) ? "<button type='button' class='ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all' data-handler='today' data-event='click'" +
                    ">" + currentText + "</button>" : "") + (isRTL ? "" : controls) + "</div>" : "";

            firstDay = parseInt(this._get(inst, "firstDay"),10);
            firstDay = (isNaN(firstDay) ? 0 : firstDay);

            showWeek = this._get(inst, "showWeek");
            dayNames = this._get(inst, "dayNames");
            dayNamesMin = this._get(inst, "dayNamesMin");
            monthNames = this._get(inst, "monthNames");
            monthNamesShort = this._get(inst, "monthNamesShort");
            beforeShowDay = this._get(inst, "beforeShowDay");
            showOtherMonths = this._get(inst, "showOtherMonths");
            selectOtherMonths = this._get(inst, "selectOtherMonths");
            defaultDate = this._getDefaultDate(inst);
            html = "";
            dow;
            for (row = 0; row < numMonths[0]; row++) {
                group = "";
                this.maxRows = 4;
                for (col = 0; col < numMonths[1]; col++) {
                    selectedDate = this._daylightSavingAdjust(new Date(drawYear, drawMonth, inst.selectedDay));
                    cornerClass = " ui-corner-all";
                    calender = "";
                    if (isMultiMonth) {
                        calender += "<div class='ui-datepicker-group";
                        if (numMonths[1] > 1) {
                            switch (col) {
                                case 0: calender += " ui-datepicker-group-first";
                                    cornerClass = " ui-corner-" + (isRTL ? "right" : "left"); break;
                                case numMonths[1]-1: calender += " ui-datepicker-group-last";
                                    cornerClass = " ui-corner-" + (isRTL ? "left" : "right"); break;
                                default: calender += " ui-datepicker-group-middle"; cornerClass = ""; break;
                            }
                        }
                        calender += "'>";
                    }
                    calender += "<div class='ui-datepicker-header ui-widget-header ui-helper-clearfix" + cornerClass + "'>" +
                        (/all|left/.test(cornerClass) && row === 0 ? (isRTL ? next : prev) : "") +
                        (/all|right/.test(cornerClass) && row === 0 ? (isRTL ? prev : next) : "") +
                        this._generateMonthYearHeader(inst, drawMonth, drawYear, minDate, maxDate,
                            row > 0 || col > 0, monthNames, monthNamesShort) + // draw month headers
                        "</div><table class='ui-datepicker-calendar'><thead>" +
                        "<tr>";
                    thead = (showWeek ? "<th class='ui-datepicker-week-col'>" + this._get(inst, "weekHeader") + "</th>" : "");
                    for (dow = 0; dow < 7; dow++) { // days of the week
                        day = (dow + firstDay) % 7;
                        thead += "<th" + ((dow + firstDay + 6) % 7 >= 5 ? " class='ui-datepicker-week-end'" : "") + ">" +
                            "<span title='" + dayNames[day] + "'>" + dayNamesMin[day] + "</span></th>";
                    }
                    calender += thead + "</tr></thead><tbody>";
                    daysInMonth = this._getDaysInMonth(drawYear, drawMonth);
                    if (drawYear === inst.selectedYear && drawMonth === inst.selectedMonth) {
                        inst.selectedDay = Math.min(inst.selectedDay, daysInMonth);
                    }
                    leadDays = (this._getFirstDayOfMonth(drawYear, drawMonth) - firstDay + 7) % 7;
                    curRows = Math.ceil((leadDays + daysInMonth) / 7); // calculate the number of rows to generate
                    numRows = (isMultiMonth ? this.maxRows > curRows ? this.maxRows : curRows : curRows); //If multiple months, use the higher number of rows (see #7043)
                    this.maxRows = numRows;
                    printDate = this._daylightSavingAdjust(new Date(drawYear, drawMonth, 1 - leadDays));
                    for (dRow = 0; dRow < numRows; dRow++) { // create date picker rows
                        calender += "<tr>";
                        tbody = (!showWeek ? "" : "<td class='ui-datepicker-week-col'>" +
                            this._get(inst, "calculateWeek")(printDate) + "</td>");
                        for (dow = 0; dow < 7; dow++) { // create date picker days
                            daySettings = (beforeShowDay ?
                                beforeShowDay.apply((inst.input ? inst.input[0] : null), [printDate]) : [true, ""]);
                            otherMonth = (printDate.getMonth() !== drawMonth);
                            unselectable = (otherMonth && !selectOtherMonths) || !daySettings[0] ||
                                (minDate && printDate < minDate) || (maxDate && printDate > maxDate);
                            tbody += "<td class='" +
                                ((dow + firstDay + 6) % 7 >= 5 ? " ui-datepicker-week-end" : "") + // highlight weekends
                                (otherMonth ? " ui-datepicker-other-month" : "") + // highlight days from other months
                                ((printDate.getTime() === selectedDate.getTime() && drawMonth === inst.selectedMonth && inst._keyEvent) || // user pressed key
                                    (defaultDate.getTime() === printDate.getTime() && defaultDate.getTime() === selectedDate.getTime()) ?
                                    // or defaultDate is current printedDate and defaultDate is selectedDate
                                    " " + this._dayOverClass : "") + // highlight selected day
                                (unselectable ? " " + this._unselectableClass + " ui-state-disabled": "") +  // highlight unselectable days
                                (otherMonth && !showOtherMonths ? "" : " " + daySettings[1] + // highlight custom dates
                                    (printDate.getTime() === currentDate.getTime() ? " " + this._currentClass : "") + // highlight selected day
                                    (printDate.getTime() === today.getTime() ? " ui-datepicker-today" : "")) + "'" + // highlight today (if different)
                                ((!otherMonth || showOtherMonths) && daySettings[2] ? " title='" + daySettings[2].replace(/'/g, "&#39;") + "'" : "") + // cell title
                                (unselectable ? "data-month='" + printDate.getMonth() + "' data-year='" + printDate.getFullYear() + "'" : " data-handler='selectDay' data-event='click' data-month='" + printDate.getMonth() + "' data-year='" + printDate.getFullYear() + "'") + ">" + // actions
                                (otherMonth && !showOtherMonths ? "&#xa0;" : // display for other months
                                    (unselectable ? "<span class='ui-state-default'>" + printDate.getDate() + "</span>" : "<a class='ui-state-default" +
                                        (printDate.getTime() === today.getTime() ? " ui-state-highlight" : "") +
                                        (printDate.getTime() === currentDate.getTime() ? " ui-state-active" : "") + // highlight selected day
                                        (otherMonth ? " ui-priority-secondary" : "") + // distinguish dates from other months
                                        "' href='#'>" + printDate.getDate() + "</a>")) + "</td>"; // display selectable date
                            printDate.setDate(printDate.getDate() + 1);
                            printDate = this._daylightSavingAdjust(printDate);
                        }
                        calender += tbody + "</tr>";
                    }
                    drawMonth++;
                    if (drawMonth > 11) {
                        drawMonth = 0;
                        drawYear++;
                    }
                    calender += "</tbody></table>" + (isMultiMonth ? "</div>" +
                        ((numMonths[0] > 0 && col === numMonths[1]-1) ? "<div class='ui-datepicker-row-break'></div>" : "") : "");
                    group += calender;
                }
                html += group;
            }
            html += buttonPanel;
            inst._keyEvent = false;
            if (inst.customEvent) {
                html = inst.customEvent(html);
            }
            return html;
        }
    }(jQuery));

    $(document).ready(window.COMMON.Utility.domReady);

}(this, this.document, this.jQuery, this.define));
(function (window, document, $, define, undef) {

    'use strict';

    window.COMMON = window.COMMON === undef ? {} : window.COMMON;

    /**
     * Form-validation
     * @author daniel.grobelny@denkwerk.com
     */
    window.COMMON.Validation = {

        $forms: $('form'),
        valid: [],
        validator: [],

        /**
         * Error-Handling for the specific fields
         * @param $field
         */
        errorField: function($field) {
            $field.parent().addClass('error');
        },

        /**
         * Wrapper method for custom validators
         */
        loadCustomValidations: function() {
            /**
             * Custom germanwings email regexp
             */
            jQuery.validator.addMethod("gwEmail", function(value, element) {
                var re = /^((([a-zA-Z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-zA-Z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/;
                var regExp = new RegExp(re);

                return regExp.test(value);
            }, "Must pass the email regexp from gw.");

            jQuery.validator.addMethod('formattedDate', function (value, element) {
                var re = /^(0[1-9]|[12][0-9]|3[01])[\.](0[1-9]|1[012])[\.](19|20)[0-9]{2}$/;
                var regExp = new RegExp(re);

                return regExp.test(value);
            }, 'Must pass a formatted date regexp.');
            //
        },

        /**
         * Checks for the validity of a given form-element if it was already evaluated as being invalid
         * @param $element
         */
        reevaluateElement: function($element) {
            //needs to be called with setTimeout, else the $element-status may not be accessible
            setTimeout(function() {
                var container = $element.parent();
                if (container.hasClass('error')) {
                    $element.valid();
                }
            }, 0);
        },

        hideWarningBoxes: function($elementContainer) {
            var warningGrpKey = $elementContainer.data('warningGroup');
            var $fields = $('[data-warning-group="' + warningGrpKey + '"]');
            var allFieldsValid = true;

            if (warningGrpKey) {
                $fields.each(function(i) {
                    if(!$(this).hasClass('success')) {
                        allFieldsValid = false;
                    }
                });

                if (allFieldsValid) {
                    window.COMMON.Warning.hideBox(warningGrpKey);
                }
            }
        },

        markAsValid: function(element) {
            var $elementContainer = $(element).parent().parent();
            $elementContainer.addClass('success');
            $elementContainer.find('.input-text').append(
                '<span class="icon-success icon-check iconfont-check"></span>'
            );
        },

        markAsInvalid: function(element) {
            var $elementContainer = $(element).parent().parent();
            var warningGrpKey = $elementContainer.data('warningGroup');

            if (warningGrpKey) {
                window.COMMON.Warning.showBox(warningGrpKey);
                $elementContainer.addClass('warning');
            } else {
                $elementContainer.addClass('error');
            }

            $elementContainer.removeClass('success');
            $elementContainer.find('.icon-success').remove();
        },

        /**
         * Sets the custom validation-rules for the given form
         * @param $form
         */
        validateForm: function($form) {
            $form.validate({
                onfocusout: function(element, event) {
                    $(element).valid();
                },
                ignore: '',
                invalidHandler: function(event, validator) {
                    //@todo add error notification ?!
                    //$().log('Invalid!');
                },
                errorPlacement: function(error, element) {
                    //$().log('Error placement!');
                },
                success: function(label, element) {
                    window.COMMON.Validation.markAsValid(element);
                },
                highlight: function(element, errorClass) {
                    window.COMMON.Validation.markAsInvalid(element);
                },
                unhighlight: function(element, errorClass) {
                    var $elementContainer = $(element).parent().parent();

                    window.COMMON.Validation.hideWarningBoxes($elementContainer);
                    $elementContainer.removeClass('error');
                    $elementContainer.removeClass('warning');
                }
            });
        },

        // Triggers when DOM is loaded
        domReady: function() {
            var _this = window.COMMON.Validation;
            _this.$forms.each( function() {
                _this.validator.push(
                    _this.validateForm($(this))
                );
            });

            _this.loadCustomValidations();
        }
    };

    $(document).ready(window.COMMON.Validation.domReady);

}(this, this.document, this.jQuery, this.define));
(function (window, document, $, define, undef) {

    'use strict';

    window.COMMON = window.COMMON === undef ? {} : window.COMMON;

    /**
     * Class for handling all (ajax) requests
     * @author daniel.grobelny@denkwerk.com
     */
    window.COMMON.Request = {

        /**
         * Wrapper method for json calls
         * @param url The called URL
         * @param successCallback The callback method for handling the returned data
         * @param errorCallback The callback method for handling errors
         * @param $occupiedContainer The container to display the loading state
         */
        getJson: function (url, successCallback, errorCallback, $occupiedContainer) {
            this.request(url, 'json', successCallback, errorCallback, $occupiedContainer, '', 'get');
        },

        /**
         * Wrapper method for HTML get-calls
         * @param url
         * @param successCallback The callback method for handling the returned data
         * @param errorCallback The callback method for handling errors
         * @param $occupiedContainer The container to display the loading state
         */
        getHtml: function(url, successCallback, errorCallback, $occupiedContainer) {
            this.request(url, 'html', successCallback, errorCallback, $occupiedContainer, '', 'get');
        },

        /**
         * Wrapper method for posts
         * @param url
         * @param successCallback The callback method for handling the returned data
         * @param errorCallback The callback method for handling errors
         * @param $occupiedContainer The container to display the loading state
         * @param data the data to post
         * @param dataType (html or json)
         */
        post: function(url, successCallback, errorCallback, $occupiedContainer, data, dataType) {
            if (typeof dataType === 'undefined') {
                dataType = 'html';
            }

            this.request(url, dataType, successCallback, errorCallback, $occupiedContainer, data, 'post');
        },
        get: function(url, successCallback, errorCallback, $occupiedContainer, data, dataType) {
            if (typeof dataType === 'undefined') {
                dataType = 'html';
            }

            this.request(url, dataType, successCallback, errorCallback, $occupiedContainer, data, 'get');
        },

        /**
         * General request method for ajax calls
         * @param url The called URL
         * @param dataType Determined through wrapper methods
         * @param successCallback The callback method for handling the returned data
         * @param errorCallback The callback method for handling errors
         * @param $occupiedContainer The container to display the loading state
         * @param data The data to post
         * @param type Transfer type (eg 'post')
         */
        request: function(url, dataType, successCallback, errorCallback, $occupiedContainer, data, type) {
            var _this = this;
            $.ajax({
                url: url,
                type: type,
                dataType: dataType,
                beforeSend: function (xhr, settings) {
                    _this.beforeSend(xhr, settings, $occupiedContainer);
                },
                error: function (xhr, textStatus, errorThrown) {
                    _this.error(xhr, textStatus, errorThrown, $occupiedContainer);
                    errorCallback(textStatus);
                },
                success: function (data, textStatus, xhr) {
                    _this.success(data, textStatus, xhr, $occupiedContainer);
                    successCallback(data);
                },
                xhrFields: {
                    withCredentials: true
                },
                data: data
            });
        },

        /**
         * General prepare-method for ajax calls
         * @param xhr
         * @param settings
         * @param $occupiedContainer The container to display the loading state
         * @TODO No final implementation
         */
        beforeSend: function(xhr, settings, $occupiedContainer) {
            if ($occupiedContainer.length != 0) {
                $occupiedContainer.userInput('deactivate');
            }
        },

        /**
         * General error-method for ajax-calls
         * @param xhr
         * @param textStatus
         * @param errorThrown
         * @param $occupiedContainer
         * @TODO No final implementation
         */
        error: function(xhr, textStatus, errorThrown, $occupiedContainer) {
            $().log('XHR Error');
            $().log('xhr: ');
            $().log(xhr);
            $().log('textStatus: ');
            $().log(textStatus);
            $().log('errorThrown: ');
            $().log(errorThrown);
            if ($occupiedContainer.length != 0) {
                $occupiedContainer.userInput('activate');
            }
        },

        /**
         * General success-method for ajax-calls
         * @param data
         * @param textStatus
         * @param xhr
         * @param $occupiedContainer
         * @TODO No final implementation
         */
        success: function(data, textStatus, xhr, $occupiedContainer) {
            $().log('Call successful!');
            if ($occupiedContainer.length != 0) {
                $occupiedContainer.userInput('activate');
            }
        }
    };

}(this, this.document, this.jQuery, this.define));
(function (window, document, $, define, undef) {

    'use strict';

    window.COMMON = window.COMMON === undef ? {} : window.COMMON;

    /**
     * General class for form behaviour
     * @author daniel.grobelny@denkwerk.com, simon.koch@denkwerk.com
     */
    window.COMMON.Forms = {

        textInputs: {
            // Global objects
            $inputBlocks: $('.input-text'),

            /**
             * Focus the parent field of the given text-input
             * @param $input A text input
             */
            focusField: function($input) {
                var $field = $input.parent();
                $field.addClass('focus');
            },

            /**
             * Blur the given field
             * @param $field A text input container
             */
            blurField: function($field) {
                $field.removeClass('focus');
            },

            /**
             * Activate the field for the given text-input
             * @param $input A text input
             */
            activateField: function($input) {
                var $field = $input.parent();

                // Set timeout to get input value after key down
                // http://stackoverflow.com/questions/18114752/jquery-getting-new-value-in-keydown-handler
                setTimeout(function () {
                    if ($input.val().length === 0) {
                        // If value empty
                        if ($field.hasClass('active')) {
                            $field.removeClass('active');
                        }
                    } else {
                        // If value not empty
                        if (!$field.hasClass('active')) {
                            $field.addClass('active');
                        }
                    }
                }, 0);
            },

            /**
             * Clear the text-input and reset the input container for the given clear-button
             * @param $clearButton
             */
            clearField: function($clearButton) {
                var $inputBlock = $clearButton.parent();
                var $input = this.getInputFromField($inputBlock);

                $inputBlock.removeClass('active');
                $inputBlock.addClass('focus');

                $input.val('');
                $input.focus();
            },

            /**
             * Get input from given field container
             * @param $field A text input container
             * @returns {*}
             */
            getInputFromField: function($field) {
                return $field.find('input[type="text"]');
            },

            /**
             * Activate all text-inputs with pre-filled values.
             */
            activateFilledFields: function() {
                $('.input-text input[type=text]').each( function() {
                    if ($(this).val() != '') {
                        $(this).parent().addClass('active');
                    }
                });
            },

            /**
             * Iterates through all text-inputs and checks is they need to be disabled
             */
            disableDisabledFields: function() {
                var _this = this;
                this.$inputBlocks.each(function() {
                    var currentTextInput = $(this).find('input[type=text]');
                    if (currentTextInput.attr('disabled')) {
                        _this.disableTextInput($(this));
                    }
                });
            },

            /**
             * Disables the given text-input
             * @param $element $('.input-block') Container-Element for the text-input
             */
            disableTextInput: function($element) {
                $element.addClass('disabled');
                $element.find('input[type=text]').attr('disabled', true);
            },

            /**
             * Bind function for input block elements and their children
             */
            bindEvents: function() {
                var _this = this;

                // On click
                $(document).on('click', '.input-text', function (e) {
                    var $currentInput = $(this).find('input');
                    if (!$currentInput.is(':focus')) {
                        $currentInput.focus();
                    }
                });

                // On key down
                $(document).on('keydown', '.input-text input', function (e) {
                    _this.activateField($(this));
                });

                // On focus for the text-input
                $(document).on('focus', '.input-text input', function (e) {
                    _this.focusField($(this));
                });

                // On blur of the text-input
                $(document).on('blur', '.input-text input', function (e) {
                    _this.blurField($(this).parent());
                });

                // On click for the clear-button
                $(document).on('mousedown', '.input-text .btn-clear', function(e) {
                    _this.clearField($(this));
                });

                $(document).on('input', '.input-text input', function(e) {
                    _this.activateField($(this));
                });
            }
        },
        textAreas: {
            // Global objects
            $inputBlocks: $('.input-textarea'),

            /**
             * Focus the parent area of the given text-input
             * @param $input A text input
             */
            focusArea: function($input) {
                var $area = $input.parent();
                $area.addClass('focus');
            },

            /**
             * Blur the given area
             * @param $area A text input container
             */
            blurArea: function($area) {
                $area.removeClass('focus');
            },

            /**
             * Activate the area for the given text-input
             * @param $input A text input
             */
            activateArea: function($input) {
                var $area = $input.parent();

                // Set timeout to get input value after key down
                // http://stackoverflow.com/questions/18114752/jquery-getting-new-value-in-keydown-handler
                setTimeout(function () {
                    if ($input.val().length === 0) {
                        // If value empty
                        if ($area.hasClass('active')) {
                            $area.removeClass('active');
                        }
                    } else {
                        // If value not empty
                        if (!$area.hasClass('active')) {
                            $area.addClass('active');
                        }
                    }
                }, 0);
            },

            /**
             * Clear the text-input and reset the input container for the given clear-button
             * @param $clearButton
             */
            clearArea: function($clearButton) {
                var $inputBlock = $clearButton.parent();
                var $input = this.getInputFromArea($inputBlock);

                $inputBlock.removeClass('active');
                $inputBlock.addClass('focus');

                $input.val('');
                $input.focus();
            },

            /**
             * Get input from given area container
             * @param $area A text input container
             * @returns {*}
             */
            getInputFromArea: function($area) {
                return $area.find('textarea');
            },

            /**
             * Activate all text-inputs with pre-filled values.
             */
            activateFilledAreas: function() {
                $('.input-textarea textarea').each( function() {
                    if ($(this).val() != '') {
                        $(this).parent().addClass('active');
                    }
                });
            },

            /**
             * Iterates through all text-inputs and checks is they need to be disabled
             */
            disableDisabledAreas: function() {
                var _this = this;
                this.$inputBlocks.each(function() {
                    var currentTextInput = $(this).find('textarea');
                    if (currentTextInput.attr('disabled')) {
                        _this.disableTextarea($(this));
                    }
                });
            },

            /**
             * Disables the given text-input
             * @param $element $('.input-block') Container-Element for the text-input
             */
            disableTextarea: function($element) {
                $element.addClass('disabled');
                $element.find('textarea').attr('disabled', true);
            },

            /**
             * Bind function for input block elements and their children
             */
            bindEvents: function() {
                var _this = this;

                // On click
                $(document).on('click', '.input-textarea', function (e) {
                    var $currentInput = $(this).find('input');
                    if (!$currentInput.is(':focus')) {
                        $currentInput.focus();
                    }
                });

                // On key down
                $(document).on('keydown', '.input-textarea textarea', function (e) {
                    _this.activateArea($(this));
                });

                // On focus for the text-input
                $(document).on('focus', '.input-textarea textarea', function (e) {
                    _this.focusArea($(this));
                });

                // On blur of the text-input
                $(document).on('blur', '.input-textarea textarea', function (e) {
                    _this.blurArea($(this).parent());
                });

                 // On click for the clear-button
                $(document).on('click', '.input-textarea .btn-clear', function(e) {
                    _this.clearArea($(this));
                });
                
                $(document).on('input', 'input-textarea textarea', function(e) {
                    _this.activateArea($(this));
                });
            }
        },

        /**
         * Handles the select-inputs
         */
        selectFields: {
            //Global objects
            $selectBlocks: $('.input-select'),
            $selectBlockClearButtons: $('.input-select .btn-clear'),
            $selectValues: $('.input-select .selection li'),
            $activeSelect: null,

            /**
             * Get the hidden input-type from a select-input
             * @param $field
             * @returns {*}
             */
            getInputFromField: function($field) {
                return $field.find('input[type="hidden"]');
            },

            /**
             * Handles selection of the select list
             * @param currentSelectValue
             */
            selectValue: function(currentSelectValue) {
                var $currentSelect = $(currentSelectValue).parents('.input-select');
                var $valueField = $currentSelect.find('input[type=hidden]');

                $currentSelect.find('li').removeClass('active');
                $(currentSelectValue).addClass('active');
                $currentSelect.find('.display').html($(currentSelectValue).text());
                $valueField.val($(currentSelectValue).data('value'));
                $currentSelect.addClass('active');
                $currentSelect.trigger('selectValueEvent', [$(currentSelectValue).data('value')]);
                window.COMMON.Validation.reevaluateElement($valueField);
            },

            /**
             * Deactivate the active select field (eg. blurring from the select)
             */
            deactivateActiveSelectField: function() {
                if($(this.$activeSelect).length != 0) {
                    $(this.$activeSelect).removeClass('focus');
                }

                this.$activeSelect = '';
            },

            /**
             * Toggle the select field on click
             * @param currentSelect
             */
            toggleSelectField: function(currentSelect) {
                if ($(currentSelect).hasClass('focus')) {
                    this.deactivateSelectField($(currentSelect));
                } else {
                    this.activateSelectField($(currentSelect));
                }
            },

            /**
             * Activates the given select-field
             * @param $element
             */
            activateSelectField: function($element) {
                $element.addClass('focus');
                $element.find('.selection li').each(function() {
                    $(this).attr('tabindex', '0');
                });
                this.$activeSelect = $element;
            },

            /**
             * Deactives the given select-field
             * @param $element
             */
            deactivateSelectField: function($element) {
                $element.removeClass('focus');
                this.$activeSelect = '';
            },

            /**
             * Clear the complete select field
             * @param currentSelect
             */
            clearSelectField: function(currentSelect) {
                $(currentSelect).removeClass('active');
                $(currentSelect).find('.selection .active').removeClass('active');
                $(currentSelect).find('.display').html('');
                $(currentSelect).find('input[type=hidden]').val('');
                $(currentSelect).trigger('selectValueEvent', '');
                $(currentSelect).focus();
                this.deactivateActiveSelectField();
            },

            /**
             * Activate all Selects with a pre-filled value
             */
            activateFilledSelects: function() {
                this.$selectBlocks.each(function() {
                    var selectData = $(this).find('input[type=hidden]').val();
                    
                    if(typeof selectData !== 'undefined') {
                        if (selectData.length !== 0 ) {
                            var $selectElement = $(this).find('li[data-value="' + selectData + '"]');
                            $selectElement.addClass('active');
                            $(this).addClass('active');
                            $(this).find('.display').html($($selectElement).text());
                        }
                    }
                });
            },

            /**
             * Disables all select fields with their hidden fields disabled
             */
            disableDisabledSelects: function() {
                var _this = this;
                this.$selectBlocks.each(function() {
                    var selectData = $(this).find('input[type=hidden]');
                    if (selectData.attr('disabled')) {
                        _this.disableSelectField($(this));
                    }
                });
            },

            /**
             * Disables the given select-field
             * @param $element
             */
            disableSelectField: function($element) {
                $element.addClass('disabled');
                $element.find('input[type=hidden]').attr('disabled', true);
                $element.unbind();
                $element.find('.btn-clear').unbind();
            },

            /**
             * enables the given select-field
             * @param $element
             */
            enableSelectField: function($element) {
                var _this = this;
                $element.removeClass('disabled');
                $element.find('input[type=hidden]').removeAttr('disabled');
                $element.click(function (e) {
                    _this.toggleSelectField(this);
                });

                $element.find('.btn-clear').click(function(e) {
                    var $currentSelect = $(this).parent();
                    _this.clearSelectField($currentSelect);
                });
            },

            /**
             * Focuses the first select field from a select-input group, or the active on if one exists
             * @param $element
             */
            focusFirstSelectElement: function($element) {
                //reactive the select box
                this.activateSelectField($element);

                var fields = $element.find(':focusable');
                var activeElement = $element.find('.active');
                if ($(activeElement).length != 0) {
                    $(activeElement).focus();
                } else {
                    $(fields[0]).focus();
                }
            },

            /**
             * Focuses the next select element from a select-input group, given the current selected input
             * @param $element
             */
            focusNextSelectElement: function($element) {
                var fields = $element.parent().find(':focusable');
                var index = fields.index($element);
                if (index > -1 && (index + 1) < fields.length) {
                    fields.eq(index + 1).focus();
                    this.selectValue(fields.eq(index + 1));
                }
            },

            /**
             * Focuses the previous select element from a select-input group, given the current selected input
             * @param $element
             */
            focusPrevSelectElement: function($element) {
                var fields = $element.parent().find(':focusable');
                var index = fields.index($element);
                if (index > 0) {
                    fields.eq(index - 1).focus();
                    this.selectValue(fields.eq(index - 1));
                }
            },

            /**
             * Selects the previous hidden-value (used for up/down-key when the select-box is collapsed)
             * @param $element
             */
            selectPrevHiddenValue: function($element) {
                var currentValue = $element.find('input[type=hidden]').val();
                var currentListItem = $element.find('li[data-value="' + currentValue + '"]');

                if (currentListItem.length == 0) {
                    this.selectValue($($element.find('li')[0]));
                    return;
                }

                if (currentListItem.prev().length != 0) {
                    this.selectValue(currentListItem.prev());
                }
            },

            /**
             * Selects the next hidden-value (used for up/down-key when the select-box is collapsed)
             * @param $element
             */
            selectNextHiddenValue: function($element) {
                var currentValue = $element.find('input[type=hidden]').val();
                var currentListItem = $element.find('li[data-value="' + currentValue + '"]');

                if (currentListItem.length == 0) {
                    this.selectValue($($element.find('li')[0]));
                    return;
                }

                if (currentListItem.next().length != 0) {
                    this.selectValue(currentListItem.next());
                }
            },
            
            /*
             * Selectbox as linklist
             */
            followLinkTarget: function($element) {
                window.location.href = $element.data('value');
            },

            /**
             * Binds form events to input-select objects
             */
            bindEvents: function() {
                var _this = this;

                $(document).on('click', '.input-select', function (e) {
                    if(!$(this).hasClass('focus')) {
                        _this.deactivateActiveSelectField();
                        _this.focusFirstSelectElement($(this));
                    } else {
                        _this.deactivateSelectField($(this));
                    }

                    //Stop propagation to avoid closing the clicked select-box
                    e.stopPropagation();
                });

                $(document).on('blur', '.input-select', function (e) {
                    if(!$(this).hasClass('focus')) {
                        _this.deactivateSelectField($(this));
                    }
                });

                $(document).on('keydown', '.input-select', function(e) {
                    var $element = $(this);

                    //Toggle select-field on Space-Button or Return-Button
                    if ((e.which == '32') || (e.which == '13')) {
                        if(!$(this).hasClass('focus')) {
                            _this.focusFirstSelectElement($element);
                        }
                        e.preventDefault();
                    }

                    //Handle up-arrow-key
                    if (e.which == '38') {
                        _this.selectPrevHiddenValue($element);
                        e.preventDefault();
                    }

                    //Handle down-arrow-key
                    if (e.which == '40') {
                        _this.selectNextHiddenValue($element);
                        e.preventDefault();
                    }
                });

                $(document).on('click', '.input-select .btn-clear', function(e) {
                    var $currentSelect = $(this).parent();
                    _this.clearSelectField($currentSelect);
                    //prevent the select box from opening
                    e.stopPropagation();
                });

                $(document).on('click', '.input-select .selection li', function (e) {
                    var $currentSelect = $(this).parents('.input-select');
                    _this.selectValue(this);
                    _this.deactivateSelectField($currentSelect);
                    $currentSelect.focus();
                    //prevent the select box from staying opened
                    e.stopPropagation();
                    
                    // handle select as link-list
                    if($currentSelect.data('link')) {
                            _this.followLinkTarget($(this));
                        }
                });

                $(document).on('keydown', '.input-select .selection li', function(e) {
                    var $element = $(this);
                    var $currentSelect = $element.parents('.input-select');

                    //handle space-button: space button in open select field does nothing
                    if (e.which == '32') {
                        e.preventDefault();
                    }

                    //Handle up-arrow-key
                    if (e.which == '38') {
                        _this.focusPrevSelectElement($element);

                        //prevent the parent up/down actions
                        e.stopPropagation();
                        e.preventDefault();
                    }

                    //Handle down-arrow-key
                    if (e.which == '40') {
                        _this.focusNextSelectElement($element);

                        //prevent the parent up/down actions
                        e.stopPropagation();
                        e.preventDefault();
                    }

                    //Handle tab-button or return-button
                    if ((e.which == '9') || (e.which == '13')) {
                        _this.selectValue(this);
                        _this.deactivateSelectField($currentSelect);
                        $currentSelect.focus();

                        //prevent the parent tab/return actions
                        e.stopPropagation();
                        e.preventDefault();
                        
                        // handle select as link-list
                        if($currentSelect.data('link')) {
                            _this.followLinkTarget($(this));
                        }
                    }
                });

                $(document).click(function(){
                    _this.deactivateActiveSelectField();
                });
            }
        },

        /**
         * Handles the checkbox-functionality
         */
        checkBoxes: {
            $checkboxes : $('.input-checkbox'),
            $checkboxLabels : $('.input-checkbox label'),

            /**
             * Toggles the checkbox...
             * @param $element
             */
            toggleCheckbox: function($element) {
                var $parent = $element.parent();
                var checked = $element.prop('checked');

                $parent.toggleClass('checked');
                $parent.find('.checkbox').focus();
                $element.attr('checked', !checked);
                $element.prop('checked', !checked);
                $element.trigger('change');
                $element.trigger('checkboxEvent', !checked);

                window.COMMON.Validation.reevaluateElement($element);
            },

            /**
             * Activates the given checkbox
             * @param $element
             */
            activateCheckbox: function($element) {
                var $currentCheckbox = $element.find('input[type=checkbox]');
                $element.addClass('checked');
                $currentCheckbox.attr('checked', true);
                $currentCheckbox.prop('checked', true);
            },

            /**
             * Deactivates the given checkbox
             * @param $element
             */
            deactivateCheckbox: function($element) {
                var $currentCheckbox = $element.find('input[type=checkbox]');
                $element.removeClass('checked');
                $element.find('.checkbox').focus();
                $currentCheckbox.attr('checked', false);
                $currentCheckbox.prop('checked', false);
            },

            /**
             * Disables the given checkbox
             * @param $element
             */
            disableCheckbox: function($element) {
                var $currentCheckbox = $element.find('input[type=checkbox]');
                $element.addClass('disabled');
                $element.find('.checkbox').removeAttr('tabindex');
                $currentCheckbox.attr('disabled', true);
            },

            /**
             * Enables the given checkbox
             * @param $element
             */
            enableCheckbox: function($element) {
                var $currentCheckbox = $element.find('input[type=checkbox]');
                $element.removeClass('disabled');
                $element.find('.checkbox').attr('tabindex', '0');
                $currentCheckbox.attr('disabled', false);
            },

            /**
             * Activate all checked checkboxes
             */
            activateFilledCheckboxes: function() {
                var _this = this;
                this.$checkboxes.each(function() {
                    var currentCheckbox = $(this).find('input[type=checkbox]');
                    if (currentCheckbox.attr('checked')) {
                        _this.activateCheckbox($(this));
                    }
                });
            },

            /**
             * Iterates over all checkboxes and checks if they need to be disabled
             */
            disableDisabledCheckboxes: function() {
                var _this = this;
                this.$checkboxes.each(function() {
                    var currentCheckbox = $(this).find('input[type=checkbox]');
                    if (currentCheckbox.attr('disabled')) {
                        _this.disableCheckbox($(this));
                    }
                });
            },

            /**
             * Binds all needed checkbox events
             */
            bindEvents: function() {
                var _this = this;

                $(document).on('click', '.input-checkbox', function(e) {
                    var $checkbox = $(this).find('input');

                    if(!$checkbox.prop('disabled')) {
                        _this.toggleCheckbox($checkbox);
                    }

                    e.stopPropagation();
                });

                $(document).on('click', '.input-checkbox label', function(e) {
                    //prevent double click event
                    e.preventDefault();
                });

                /*$(document).on('click', '.input-checkbox input', function(e) {
                    _this.toggleCheckbox($(this));
                    e.stopPropagation();
                });*/

                $(document).on('keypress', '.input-checkbox', function(e) {
                    //Toggle Checkbox on space-press
                    if (e.which == '32') {
                        //$(this).find('input').click();
                        _this.toggleCheckbox($(this).find('input'));
                        e.preventDefault();
                    }
                });

                $(document).on('click', '.input-checkbox label', function(e) {
                    //prevent "double toggle"
                    e.preventDefault();
                });
            }
        },

        /**
         * Handles radio-button functionality
         */
        radioButtons: {
            $radioButtons : $('.input-radio'),
            $radioButtonLabels : $('.input-radio label'),

            /**
             * Returns all radio-inputs from the current form matching the current group
             * @param $currentRadio
             * @returns {*}
             */
            getAllGroupRadios: function($currentRadio) {
                var $currentForm = $currentRadio.parents('form');
                var currentRadioGroup = $currentRadio.attr('name');
                return $currentForm.find('input[type=radio][name="' + currentRadioGroup + '"]:enabled');
            },

            /**
             * Deactivates all other radios from the group of the given radio-input
             * @param $currentRadio
             */
            deactivateOtherRadios: function($currentRadio) {
                var $allGroupRadioButtons = this.getAllGroupRadios($currentRadio);
                var _this = this;
                $allGroupRadioButtons.each(function () {
                    var radioElement = $(this).parent();
                    _this.deactivateRadio($(radioElement));
                });
            },

            /**
             * Deactivates the given radio-input
             * @param $element
             */
            deactivateRadio: function($element) {
                var $currentRadio = $element.find('input[type=radio]');
                var $allGroupRadioButtonsIcon = $element.find('.radio');

                $element.removeClass('checked');
                $allGroupRadioButtonsIcon.removeAttr('tabindex');
                $currentRadio.attr('checked', false);
            },

            reevaluteRadioButtons: function($currentRadio) {
                var $allGroupRadioButtons = this.getAllGroupRadios($currentRadio);

                $allGroupRadioButtons.each(function () {
                    window.COMMON.Validation.reevaluateElement($(this));
                });
            },

            /**
             * Activates the given radio-input
             * @param $element
             */
            activateRadio: function($element) {
                var $parent = $element.parent();
                var $allGroupRadioButtonsIcon = $parent.find('.radio');

                this.deactivateOtherRadios($element);
                $parent.addClass('checked');
                $allGroupRadioButtonsIcon.attr('tabindex', '0');
                $allGroupRadioButtonsIcon.focus();

                // Trigger click to try to fix backend bug with empty radio button values
                $element.click();
                //$element.attr('checked', true);

                $element.trigger('change');
                this.reevaluteRadioButtons($element);
            },

            /**
             * Activates the gíven radio without deactivating other radio-inputs
             * @param $element
             */
            activatePreCheckedRadio: function($element) {
                var $radioTabindexContainer = $element.find('.radio');

                $element.addClass('checked');
                $radioTabindexContainer.attr('tabindex', '0');
            },

            /**
             * Disables the given radio-input
             * @param $element
             */
            disableRadio: function($element) {
                var $currentRadio = $element.find('input[type=radio]');
                $element.addClass('disabled');
                $element.find('.radio').removeAttr('tabindex');
                $element.unbind();
                $currentRadio.attr('disabled', true);
            },

            /**
             * Enables the given radio-input
             * @param $element
             */
            enableRadio: function($element) {
                var $currentRadio = $element.find('input[type=radio]');

                $element.removeClass('disabled');
                $element.find('.radio').attr('tabindex', '0');
                $currentRadio.attr('disabled', true);
            },

            /**
             * Iterates over radio-inputs and checks if they need to be activated
             */
            activateFilledRadios: function() {
                var _this = this;
                this.$radioButtons.each(function() {
                    var currentRadio = $(this).find('input[type=radio]');
                    if (currentRadio.attr('checked')) {
                        _this.activatePreCheckedRadio($(this));
                    }
                });
            },

            /**
             * Iterates over radio-inputs and checks if they need to be disabled
             */
            disableDisabledRadios: function() {
                var _this = this;
                this.$radioButtons.each(function() {
                    var currentRadio = $(this).find('input[type=radio]');
                    if (currentRadio.attr('disabled')) {
                        _this.disableRadio($(this));
                    }
                });
            },

            /**
             * Activates the next possible radio-input (right / down key)
             * @param $element
             */
            activateNextRadio: function($element) {
                var $radioGroup = this.getAllGroupRadios($element.find('input[type=radio]'));
                var $radioContainerGroup = $radioGroup.parent();
                var positionInGroup = $radioContainerGroup.index($element);
                var $nextRadio = $($radioContainerGroup[positionInGroup + 1]);

                this.activateRadio($nextRadio.find('input'));
            },

            /**
             * Activates the previous possible radio-input (left / up key)
             * @param $element
             */
            activatePrevRadio: function($element) {
                var $radioGroup = this.getAllGroupRadios($element.find('input[type=radio]'));
                var $radioContainerGroup = $radioGroup.parent();
                var positionInGroup = $radioContainerGroup.index($element);
                var $prevRadio = $($radioContainerGroup[positionInGroup - 1]);

                this.activateRadio($prevRadio.find('input'));
            },

            /**
             * Binds all events for radio-input handling
             */
            bindEvents: function() {
                var _this = this;

                $(document).on('click', '.input-radio', function(e) {
                    var $radioInput = $(this).find('input');

                    if (!$radioInput.prop('disabled')) {
                        _this.activateRadio($radioInput);
                        $(this).find('input').click();
                    }

                    e.stopPropagation();
                });

                $(document).on('click', '.input-radio input', function(e) {
                    e.stopPropagation();
                });

                $(document).on('click', '.input-radio label', function(e) {
                    //prevent double click event
                    e.preventDefault();
                });

                $(document).on('keypress', '.input-radio', function(e) {
                    //activate radio on space-press
                    if (e.which == '32') {
                        $(this).find('input').click();
                        e.preventDefault();
                    }
                });

                $(document).on('keydown', '.input-radio', function(e) {
                    //Handle left-arrow-key
                    if (e.which == '37') {
                        _this.activatePrevRadio($(this));
                        e.preventDefault();
                    }

                    //Handle up-arrow-key
                    if (e.which == '38') {
                        _this.activatePrevRadio($(this));
                        e.preventDefault();
                    }

                    //Handle right-arrow-key
                    if (e.which == '39') {
                        _this.activateNextRadio($(this));
                        e.preventDefault();
                    }

                    //Handle down-arrow-key
                    if (e.which == '40') {
                        _this.activateNextRadio($(this));
                        e.preventDefault();
                    }
                });
            }
        },

        /**
         * Initialize form behaviour
         */
        initialize: function() {
            this.textInputs.bindEvents();
            this.textInputs.activateFilledFields();
            this.textInputs.disableDisabledFields();

            this.textAreas.bindEvents();
            this.textAreas.activateFilledAreas();
            this.textAreas.disableDisabledAreas();

            this.selectFields.bindEvents();
            this.selectFields.activateFilledSelects();
            this.selectFields.disableDisabledSelects();

            this.checkBoxes.bindEvents();
            this.checkBoxes.activateFilledCheckboxes();
            this.checkBoxes.disableDisabledCheckboxes();

            this.radioButtons.bindEvents();
            this.radioButtons.activateFilledRadios();
            this.radioButtons.disableDisabledRadios();
        },

        /**
         * Triggers when DOM is loaded
         */
        domReady: function() {
            //initialize all form events
            window.COMMON.Forms.initialize();
        }
    };

    $(document).ready(window.COMMON.Forms.domReady);

}(this, this.document, this.jQuery, this.define));
(function(window, document, $, define, undef) {

    'use strict';

    window.COMMON = window.COMMON === undef ? {} : window.COMMON;

    /**
     * General class for form behaviour
     * @author daniel.grobelny@denkwerk.com, simon.koch@denkwerk.com
     */
    window.COMMON.Ajaxforms = {
        $ajaxForms: $("form.ajaxform"),
        /**
         * Submits the ajax form
         *
         * @param $form
         * @param url
         * @param resultTarget
         * @param updateTrigger
         * @param eventTrigger
         */
        submitForm: function($form, url, resultTarget, updateTrigger, eventTrigger, forceNoValidate) {
            var $renderTarget = $("#" + resultTarget),
                formValid = forceNoValidate ? true : $form.valid();

            if ($renderTarget && formValid) {
                var requestHandler = window.COMMON.Request;
                var formData = $form.serializeArray();

                if ($form.context.className != 'ajaxform') {
                    var buttonName = $form.context.name;
                    var buttonValue = $form.context.value;
                    formData.push({name: buttonName, value: buttonValue});
                }

                $.ajax({
                    type: "POST",
                    url: url,
                    data: formData,
                    beforeSend: function(xhr, settings) {
                        //@TODO Final busy-handling
                        requestHandler.beforeSend(xhr, settings, $renderTarget);
                    },
                    error: function(xhr, textStatus, errorThrown) {
                        //@TODO Final error-handling
                        requestHandler.error(xhr, textStatus, errorThrown, $renderTarget);
                        $renderTarget.html('<p>Es ist ein Fehler aufgetreten ...</p>');
                        $renderTarget.show();
                    },
                    success: function(data, textStatus, xhr) {
                        if ($renderTarget.data('resultTargetReplace') == true) {
                            $renderTarget.replaceWith(data);
                        } else {
                            $renderTarget.html(data);
                        }
                        $renderTarget.show();

                        var $dynamicForms = $renderTarget.find('form');
                        var responseEvents = xhr.getResponseHeader('X-GWR-Event');
                        var responseFunctions = xhr.getResponseHeader('X-GWR-Function');

                        $dynamicForms.each(function() {
                            window.COMMON.Validation.validateForm($(this));
                        });
                        requestHandler.success(data, textStatus, xhr, $renderTarget);

                        if ($form.data('triggerUpdateSubmit')) {
                            window.CMS.Events.triggerUpdateListeners(updateTrigger);
                        }

                        if ($form.data('triggerEventSubmit')) {
                            window.CMS.Events.triggerEventListeners(eventTrigger);
                        }

                        if (responseEvents) {
                            window.CMS.Events.triggerUpdateListeners(responseEvents);
                        }

                        if (responseFunctions) {
                            window.CMS.Events.triggerResponseFunctions(responseFunctions);
                        }
                    }
                });
            } else {
                $().log('Render target:');
                $().log($renderTarget);
                $().log('form.valid():');
                $().log($form.valid());
            }
        },
        /**
         * Returns the url from the given button
         * @param $button
         * @returns {*}
         */
        getButtonUrl: function($button) {
            return $button.attr("data-q");
        },
        /**
         * Returns the result target from the given button
         * @param $button
         * @returns {*}
         */
        getButtonResultTarget: function($button) {
            return $button.attr("data-result-target");
        },
        /**
         * Returns the default URI for the given form
         * @param $form
         * @returns String
         */
        getDefaultUrl: function($form) {
            var defaultUrl = $form.attr("action");
            var $button = $form.find("[type=submit]");

            if (!defaultUrl) {
                defaultUrl = this.getButtonUrl($button);
            }

            return defaultUrl;
        },
        /**
         * Returns the default result-target element ID
         * @param $form
         * @returns String (ID)
         */
        getDefaultResultTarget: function($form) {
            var defaultResultTarget = $form.attr("data-result-target");
            var $button = $form.find("[type=submit]");

            if (!defaultResultTarget) {
                defaultResultTarget = this.getButtonResultTarget($button);
            }

            return defaultResultTarget;
        },
        /**
         *
         * @param $form
         * @returns {*}
         */
        getDefaultUpdateTrigger: function($form) {
            var defaultUpdateTrigger = $form.attr("data-trigger-update-submit");
            var $button = $form.find("[type=submit]");

            if (!defaultUpdateTrigger) {
                defaultUpdateTrigger = this.getButtonUpdateTrigger($button);
            }

            return defaultUpdateTrigger;
        },
        /**
         *
         * @param $button
         * @returns {*}
         */
        getButtonUpdateTrigger: function($button) {
            return $button.attr("data-trigger-update-submit");
        },
        /**
         *
         * @param $form
         * @returns {*}
         */
        getDefaultEventTrigger: function($form) {
            var defaultEventTrigger = $form.attr("data-trigger-event-submit");
            var $button = $form.find("[type=submit]");

            if (!defaultEventTrigger) {
                defaultEventTrigger = this.getButtonEventTrigger($button);
            }

            return defaultEventTrigger;
        },
        /**
         *
         * @param $button
         * @returns {*}
         */
        getButtonEventTrigger: function($button) {
            return $button.attr("data-trigger-event-submit");
        },
        /**
         * force "no validate" via submit button
         * @param $button
         * @returns {*}
         */
        getButtonNoValidate: function($button) {
            var val = $button.attr('data-no-validate'),
                res = val == undefined || val == 'false' ? false : true;

            return res;
        },
        /**
         * Binds the submit event
         */
        bindSubmitEvent: function() {
            var _this = this;
            $(document).on('submit', "form.ajaxform", function(e) {
                var defaultUrl = _this.getDefaultUrl($(this));
                var defaultResultTarget = _this.getDefaultResultTarget($(this));
                var defaultUpdateTrigger = _this.getDefaultUpdateTrigger($(this));
                var defaultEventTrigger = _this.getDefaultEventTrigger($(this));

                _this.submitForm($(this), defaultUrl, defaultResultTarget, defaultUpdateTrigger, defaultEventTrigger);
                e.preventDefault();
                return false;
            });
        },
        /**
         * Binds the submitForm method to submit-button-clicks
         */
        bindSubmitOnButtonClick: function() {
            var _this = this;
            var selector = "form.ajaxform input[type='submit'], form.ajaxform button[type='submit']";

            $(document).on('click', selector, function(e) {
                var $form = $(this).parents('form.ajaxform');
                var buttonUrl = _this.getButtonUrl($(this));
                var buttonResultTarget = _this.getButtonResultTarget($(this));
                var buttonUpdateTrigger = _this.getButtonUpdateTrigger($(this));
                var buttonEventTrigger = _this.getButtonEventTrigger($(this));
                var buttonNoValidate = _this.getButtonNoValidate($(this)); // force "no validate"

                _this.submitForm($form, buttonUrl, buttonResultTarget, buttonUpdateTrigger, buttonEventTrigger, buttonNoValidate);
                e.preventDefault();
                return false;
            });
        },
        /**
         * Submit form with success dialog-layer
         */
        submitWithLayerOnSuccess: function() {
            var $form = $('form.layer-on-success'),
                    url = $form.attr('action'),
                    params = $form.serialize(),
                    dialogKey = $form.data('dialogOnSuccess');
            $(document).on('click', 'form.layer-on-success button[type="submit"]', function(e) {
                e.preventDefault();
                if ($form.valid()) {
                    window.COMMON.Request.post(url, function(data) {
                       $form.empty().html(data);
                        window.CMS.Elements.dialog.open(dialogKey);
                    }, '', '', params);
                }
            })
        },
        /**
         * Initialize the Ajaxforms class
         */
        initialize: function() {
            this.bindSubmitOnButtonClick();
            this.bindSubmitEvent();
            this.submitWithLayerOnSuccess();
        },
        /**
         * Triggers when DOM is loaded
         */
        domReady: function() {
            window.COMMON.Ajaxforms.initialize();
        }
    };

    $(document).ready(window.COMMON.Ajaxforms.domReady);

}(this, this.document, this.jQuery, this.define));
(function (window, document, $, define, undef) {

    'use strict';

    window.COMMON = window.COMMON === undef ? {} : window.COMMON;

    /**
     * On screen alerts
     * @author simon.koch@denkwerk.com
     */
    window.COMMON.Alert = {

        // Alert default options
        options: {
            unique: true,
            hideTimeout: 2000,
            hideOnScroll: true,
            hideOnClick: true
        },

        unique: true,
        $siteContainer: $('.site-container'),

        // Show a alert
        show: function(alertKey) {
            var _this = this;

            var $alert = this.getElement(alertKey);

            // Check if alert element exists
            if ($alert !== false) {
                // Alert uniqueness
                var unique = (typeof $alert.data('alert-unique') != 'undefined') ? $alert.data('alert-unique') : this.options.unique;

                // Check if uniqueness is enabled (hide all other alerts)
                if (unique === true) {
                    this.hideAll();
                }

                // Move alert to site-container bottom
                // - to prevent z-index overlay bugs
                $alert.appendTo(this.$siteContainer);

                // Show alert
                $alert.removeClass('hidden');

                // Alert hide timeout
                var hideTimeout = (typeof $alert.data('alert-hide-timeout') != 'undefined') ? $alert.data('alert-hide-timeout') : this.options.hideTimeout;

                // Check if hide after timeout is enabled
                if (hideTimeout !== false) {
                    this.hideOnTimeout(alertKey, hideTimeout);
                }

                // Alert hide on scroll
                var hideOnScroll = (typeof $alert.data('alert-hide-on-scroll') != 'undefined') ? $alert.data('alert-hide-on-scroll') : this.options.hideOnScroll;

                // Check if hide on scroll option is enabled
                if (hideOnScroll !== false) {
                    this.hideOnScroll(alertKey);
                }

                // Alert hide on click
                var hideOnClick = (typeof $alert.data('alert-hide-on-click') != 'undefined') ? $alert.data('alert-hide-on-scroll') : this.options.hideOnClick;

                // Check if hide on scroll option is enabled
                if (hideOnClick !== false) {
                    // Bind click to close alert
                    $alert.on('click', function (e) {
                        _this.hide(alertKey);

                        // Unbind click after close
                        $(this).off('click');
                    });
                }
            }
        },

        // Hide alert
        hide: function(alertKey) {
            var $alert = this.getElement(alertKey);

            // Check if alert element exists
            if ($alert !== false) {
                // Show alert
                $alert.addClass('hidden');
            }
        },

        // Hide all alerts
        hideAll: function() {
            $('[data-alert]').addClass('hidden');
        },

        // Hide alert on scroll
        hideOnTimeout: function(alertKey, hideTimeout) {
            var _this = this,
                    timeout = setTimeout(
                     function() {
                         _this.hide(alertKey);
                         clearTimeout(timeout);
                         $(window).off('scroll');
                     },
                     hideTimeout
            );
        },

        // Hide alert on scroll
        hideOnScroll: function(alertKey) {
            var _this = this;

            // Bind on page scroll
            $(window).scroll(function() {
                _this.hide(alertKey);
                $(window).off('scroll');
            });
        },

        // Get alert by key
        getElement: function(alertKey) {
            var $alert = $('[data-alert="' + alertKey + '"]');

            // Check if alert element is empty
            if ($alert.length === 0) {
                $alert = false;
            }

            return $alert;
        },

        // Check hash bang on page load
        // - triggers alert if element is available
        checkHashBang: function() {
            var hashBang = window.COMMON.Utility.getHashBang();

            // If hashBang contains values
            if (hashBang !== false) {
                $.each(hashBang, function(arrKey, alertKey) {
                    // Show alert
                    window.COMMON.Alert.show(alertKey);
                });

                window.COMMON.Utility.removeHashBang();
            }
        },

        // Triggers when DOM is loaded
        domReady: function() {
            var _this = window.COMMON.Alert;

            _this.checkHashBang();
        }
    };

    $(document).ready(window.COMMON.Alert.domReady);

}(this, this.document, this.jQuery, this.define));
(function (window, document, $, define, undef) {

    'use strict';

    window.COMMON = window.COMMON === undef ? {} : window.COMMON;

    /**
     * Form field group warnings
     * @author simon.koch@denkwerk.com
     */
    window.COMMON.Warning = {

        /**
         * Show warning group (box, field highlighting)
         * @param key warning key
         */
        show: function(key) {
            var _this = this,
                $fields = $('[data-warning-group="' + key + '"]');

            // Highlight warning fields
            if ($fields.length > 0) {
                $fields.each(function() {
                    _this.highlightField($(this));
                });
            }

            // Show warning box
            this.showBox(key);
        },

        /**
         * Highlight warning field
         * @param $field Field element
         */
        highlightField: function($field) {
            $field.addClass('warning');
        },

        /**
         * Unhighlight warning field
         * @param $field Field element
         */
        unhighlightField: function($field) {
            $field.removeClass('warning');
        },

        /**
         * Show warning box
         * @param key Warning box key
         */
        showBox: function(key) {
            var $box = this.getBoxElement(key);

            $box.removeClass('hidden');
        },

        /**
         * Hide warning box
         * @param key Warning box key
         */
        hideBox: function(key) {
            var $box = this.getBoxElement(key);

            $box.addClass('hidden');
        },

        /**
         * Get warning element
         * @param key Error box key
         */
        getBoxElement: function(key) {
            var $box = $('[data-warning="' + key + '"]');

            // Check if alert element is empty
            if ($box.length === 0) {
                $box = false;
            }

            return $box;
        },

        // Triggers when DOM is loaded
        domReady: function() {
            var _this = window.COMMON.Warning;
        }
    };

    $(document).ready(window.COMMON.Warning.domReady);

}(this, this.document, this.jQuery, this.define));
(function (window, document, $, define, undef) {

    'use strict';

    window.COMMON = window.COMMON === undef ? {} : window.COMMON;

    /**
     * On screen alerts
     * @author simon.koch@denkwerk.com
     */
    window.COMMON.Hints = {

        show: function($element) {
            $element.find('.box-info-hint').removeClass('hidden');
        },

        hide: function($element) {
            $element.find('.box-info-hint').addClass('hidden');
        },

        hideAll: function() {

        },

        addBoxes: function() {
            $('[data-hint]').each(function() {
                var $element = $(this);
                var hint = $element.data('hint');
                $element.append(
                    '<div class="box-info box-info-hint hidden"><span class="icon-hint iconfont-warning"></span> ' + hint + '</div>'
                );
            });
        },

        initialize: function() {
            var _this = this;
            $(document).on('mouseenter', '[data-hint]', function(e) {
                _this.show($(this));
            });

            $(document).on('mouseleave', '[data-hint]', function(e) {
                if (!$(this).find('input').is(':focus')) {
                    _this.hide($(this));
                }
            });

            $(document).on('focus', '[data-hint] input', function(e) {
                _this.show($(this).parent());
            });

            $(document).on('blur', '[data-hint] input', function(e) {
                _this.hide($(this).parent());
            });

            _this.addBoxes();
        },

        // Triggers when DOM is loaded
        domReady: function() {
            var _this = window.COMMON.Hints;

            _this.initialize();
        }
    };

    $(document).ready(window.COMMON.Hints.domReady);

}(this, this.document, this.jQuery, this.define));
(function(window, document, $, define, undef) {

    'use strict';

    window.CMS = window.CMS === undef ? {} : window.CMS;

    /**
     * Class for element specific functionality
     * @author daniel.grobelny@denkwerk.com
     */
    window.CMS.Elements = {
        /**
         * Handles the tab-container functionality
         */
        tabContainer: {
            tabContainers: '.tab-container, .btn-container',
            /**
             * Initializes the tab-container behaviour
             */
            initialize: function() {
                this.bindTabEvents();
            },
            /**
             * Binds the tab-events
             */
            bindTabEvents: function() {
                var _this = this;

                $(_this.tabContainers).find('.nav-tabs li, .btn-tabs li').click(function(e) {
                    _this.activateTab($(this));
                    _this.activateSection($(this));
                });
            },
            /**
             * Activates the given tab
             * @param $currentTab
             */
            activateTab: function($currentTab) {
                $currentTab.parent().find('li').removeClass('active');
                $currentTab.addClass('active');
            },
            /**
             * Activates the section corresponding to the $currentTab
             * @param $currentTab
             */
            activateSection: function($currentTab) {
                var $tabContainer = $currentTab.parents(this.tabContainers);
                var $sections = $tabContainer.find('section');
                var activeSection = $sections.get($currentTab.index());

                $sections.removeClass('active');
                $(activeSection).addClass('active');
            }
        },
        /**
         * Handles widget behaviour
         */
        widgets: {
            /**
             * Initialize widgets
             */
            initialize: function() {
                this.bindToggleEvents();
            },
            /**
             * Binds events for the toggle-widget
             */
            bindToggleEvents: function() {
                $(document).on('click', '.toggle-head', function(e) {
                    window.CMS.Elements.widgets.toggleElement($(this).parent());
                });
            },
            /**
             * Expands / collapses the toggle element depending on its status
             * @param $element
             */
            toggleElement: function($element) {
                if ($element.hasClass('active') === false) {
                    this.activateToggle($element);
                } else {
                    this.removeToggle($element);
                }
            },
            /**
             * Expands the toggle element
             * @param $element
             */
            activateToggle: function($element) {
                $element.addClass('active');
            },
            /**
             * Collapses the toggle element
             * @param $element
             */
            removeToggle: function($element) {
                $element.removeClass('active');
            }
        },
        // Dialoglog layer
        dialog: {
            // Dalog width sizes
            width: {
                s: '360px',
                m: '690px',
                l: '950px'
            },
            // Initialize functions
            initialize: function() {
                var _this = this;
                $('[data-dialog]').each(function() {
                    var $dialog = $(this);
                    if ($dialog.length > 0) {

                        // Dialog size (if undefined: s)
                        var size = (typeof $dialog.data('dialog-size') != 'undefined') ? $dialog.data('dialog-size') : 's';

                        // Modal dialog with semi transparent background (if undefined: true)
                        var modal = (typeof $dialog.data('dialog-modal') != 'undefined') ? $dialog.data('dialog-modal') : true;

                        // Dialog auto open (if undefined: false)
                        var autoOpen = (typeof $dialog.data('dialog-auto-open') != 'undefined') ? $dialog.data('dialog-auto-open') : false;

                        // Dialog CSS class (if undefined: false)
                        var dialogClass = (typeof $dialog.data('dialog-class') != 'undefined') ? $dialog.data('dialog-class') : '';


                        // Load dialog
                        $dialog.dialog({
                            width: window.CMS.Elements.dialog.width[size],
                            autoOpen: autoOpen,
                            modal: modal,
                            dialogClass: dialogClass,
                            resizable: false,
                            draggable: false

                        });
                    }
                });

                this.bindEvents();
            },
           
            // Trigger dialog by dialog key
            open: function(dialogKey) {
                var $dialog = $('[data-dialog="' + dialogKey + '"]');
                // Show dialog
                $dialog.dialog('open');
            },
            /**
             * Binds events to dialog-elements
             */
            bindEvents: function() {
                var _this = this;
                // Opens dialog
                $('[data-dialog-open]').on('click', function() {
                    var dialogKey = $(this).data('dialog-open');
                    _this.open(dialogKey);
                });

                // Closes dialog
                $('[data-dialog-action="close"]').on('click', function(e) {
                    $(this).closest('[data-dialog]').dialog('close');
                });
            }
        },
        flyout: {
            /**
             * Initializes the flyouts
             */
            initialize: function() {
                this.bindEvents();
            },
            /**
             * Toggle the flyOuts and icons
             * @param $element
             */
            toggleFlyout: function($element) {
                $().log('Toggling flyout ...');

                var $parent = $element.parent();
                var $flyout = $parent.find('.flyout');

                $flyout.toggleClass('hidden');
                $parent.find('.arrow').toggleClass('iconfont-arrow-double-bottom');
                $parent.find('.arrow').toggleClass('iconfont-arrow-double-top');
            },
            /**
             * Binds events to the flyOut elements
             */
            bindEvents: function() {
                var _this = this;
                // Dialog open click event
                $(document).on('click', '.flyout-button', function(e) {
                    _this.toggleFlyout($(this));
                });

                $(document).on('click', '.btn-collapse-primary', function(e) {
                    _this.toggleFlyout($(this).parent());
                });
            }
        },
        /**
         * Bind initial events for all element functionality
         */
        initialize: function() {
            this.tabContainer.initialize();
            this.widgets.initialize();
            this.dialog.initialize();
            this.flyout.initialize();
        },
        /**
         * Triggers when DOM is loaded
         */
        domReady: function() {
            window.CMS.Elements.initialize();
        }
    };

    $(document).ready(window.CMS.Elements.domReady);

}(this, this.document, this.jQuery, this.define));
(function (window, document, $, define, undef) {

    'use strict';

    window.CMS = window.CMS === undef ? {} : window.CMS;

    /**
     * Class for the compactSearch specific functionality
     * @author daniel.grobelny@denkwerk.com
     */
    window.CMS.CompactSearch = {

        //The input which has to be focused after the user is finished with the current section
        nextInput: '',

        //Local Selectors
        compactSearch: '.compact-search',

        //The currentCompactSearch gets set at every event
        $currentCompactSearch: $(),

        /**
         * Returns the current compact-search container from the given jQuery-Element
         * @param $element
         * @returns {*}
         */
        getCurrentCompactSearch: function($element) {
            return $element.parents(this.compactSearch);
        },

        /**
         *
         * @param $element
         */
        setCurrentCompactSearch: function($element) {
            this.$currentCompactSearch = this.getCurrentCompactSearch($element);
        },

        /**
         * Set the input field that should be focused next
         * @param currentInput
         */
        setNextInput: function(currentInput) {
            this.nextInput = $(currentInput).parents('.col').next().find('.input-block');
        },

        /**
         * Focus the next input field
         */
        focusNextInput: function() {
            var inputClasses = $(this.nextInput).attr('class').split(/\s+/);

            if ($.inArray('input-text', inputClasses) !== -1) {
                $(this.nextInput).find('input[type=text]').focus();
            } else if ($.inArray('input-select', inputClasses) !== -1) {
                window.COMMON.Forms.selectFields.toggleSelectField(this.nextInput);
            }
        },

        /**
         * Get the call to receive the airport-list from the current input-element
         * @param currentInput
         * @param correspondingTlc
         * @returns {string}
         */
        getAirportCall: function(currentInput, correspondingTlc) {
            var callUrl = $(currentInput).data('query');
            var searchStringParam = $(currentInput).data('param-q');
            var searchString = $(currentInput).val();
            var tlcParam = $(currentInput).data('param-tlc');
            var destinationTlc = this.$currentCompactSearch.find(correspondingTlc).val();

            var call = callUrl + '?' + searchStringParam + '=' + searchString;

            if (destinationTlc !== '') {
                call = callUrl + '?' + searchStringParam + '=' + searchString + '&' + tlcParam + '=' + destinationTlc;
            }

            return call;
        },

        /**
         * Error-Handler for the ajax request
         * @param status
         * @TODO No final implementation
         */
        handleCompactSearchError: function(status) {
            $().log('Error in ajax request!');
        },

        /**
         * deactivate all panels, eg if the select-box is clicked
         */
        deactivateAllPanels: function() {
            this.$currentCompactSearch.find('.result').children().addClass('hidden');
            this.deactivateFlyout();
        },

        /**
         * Hides flyouts for all compactSearch containers
         */
        hideAllCompactSearches: function() {
            $('.compact-search').each( function() {
                window.CMS.CompactSearch.deactivateFlyout();
            });
        },

        /**
         * Activate the panel for the given resultContainer
         * @param resultContainerIdentifier
         */
        activatePanel: function(resultContainerIdentifier) {
            var resultContainer = this.$currentCompactSearch.find(resultContainerIdentifier);

            this.activateFlyout();
            $(resultContainer).siblings().addClass('hidden');
            $(resultContainer).removeClass('hidden');
        },

        /**
         * Activate the flyout
         */
        activateFlyout: function() {
            this.$currentCompactSearch.find('.flyout').removeClass('hidden');
        },

        /**
         * Deactivate the flyout
         */
        deactivateFlyout: function() {
            this.$currentCompactSearch.find('.flyout').addClass('hidden');
        },

        /**
         * General bindings for the compact Search
         */
        bindings: {
            /**
             * Looks for a document click and hides all compact-searches if the appropiate parents / elements do not match
             */
            focusOutEvents: function() {
                $(document).on('click', function(e) {
                    if (($(e.target).parents('.compact-search, .ui-dialog').length == 0)
                        && !$(e.target).hasClasses(['ui-dialog', 'ui-datepicker-next', 'ui-datepicker-prev', 'monthListItem', 'ui-widget-overlay'])) {
                        window.CMS.CompactSearch.hideAllCompactSearches();
                    }
                });

                $('.gw-datepicker, .gw-weekpicker').on('click', function(e) {
                    //e.stopPropagation();
                });
            }
        },

        /**
         * Handles functionality inside the destination panel
         */
        destination: {
            $destinationInputBlock: $('.destinationName').parent(),

            destinationName: '.destinationName',
            destinationTlc: '.destinationTlc',
            destinationResult: '.result-destination',

            /**
             * Call CQ for destination airports that match searchString
             * @param currentInput
             */
            getDestinationAirports: function(currentInput) {
                var compactSearch = window.CMS.CompactSearch;
                var currentDestinationResult = compactSearch.$currentCompactSearch.find(this.destinationResult);
                var call = compactSearch.getAirportCall(currentInput, compactSearch.origin.originTlc);

                window.COMMON.Request.getHtml(
                    call,
                    function(data) {
                        compactSearch.destination.publishDestinationAirports(data);
                    },
                    function(data) {
                        compactSearch.handleCompactSearchError(data);
                    },
                    $(currentDestinationResult)
                );

                //reset tlc input
                this.setDestinationTlc('');
            },

            /**
             * Paste the destination airports from the ajax call into the DOM and rebind events
             * @param data
             */
            publishDestinationAirports: function(data) {
                var compactSearch = window.CMS.CompactSearch;
                var currentDestinationResult = compactSearch.$currentCompactSearch.find(this.destinationResult);

                $(currentDestinationResult).html(data);
            },

            /**
             * Trigger a call to get the destination airports after the user finishes his input
             * @param currentInput
             */
            triggerDestinationAirportSearch: function(currentInput) {
                $().inputTimer('clear');
                $().inputTimer('setTimer', setTimeout(function() {
                    window.CMS.CompactSearch.destination.getDestinationAirports(currentInput);
                }, $().inputTimer('getTimeout'))
                );
            },

            /**
             * Deliver data-fields from currentAirport to destination inputs (three letter code for the hidden field
             * display-name for the text-input)
             * @param currentAirport
             */
            chooseDestinationAirport: function(currentAirport) {
                var compactSearch = window.CMS.CompactSearch;

                //Set the three letter code into the hidden field
                this.setDestinationTlc($(currentAirport).data('tlc'));
                //Set the text value into the text-input
                this.setDestinationText($(currentAirport).data('text'));
                //Activate next panel
                compactSearch.focusNextInput();
            },

            getDestinationTlc: function() {
                var compactSearch = window.CMS.CompactSearch;

                return compactSearch.$currentCompactSearch.find(this.destinationTlc).val();
            },

            setDestinationTlc: function(tlc) {
                var compactSearch = window.CMS.CompactSearch;

                compactSearch.$currentCompactSearch.find(this.destinationTlc).val(tlc);
            },

            getDestinationText: function() {
                var compactSearch = window.CMS.CompactSearch;

                return compactSearch.$currentCompactSearch.find(this.destinationName).val();
            },

            setDestinationText: function(text) {
                var compactSearch = window.CMS.CompactSearch;
                var destinationInput = compactSearch.$currentCompactSearch.find(this.destinationName);

                destinationInput.val(text);
                window.COMMON.Forms.textInputs.activateField($(destinationInput));
            },

            bindings: {
                /**
                 * Bind a click event on the destination airport-list
                 */
                destinationAirportEvents: function() {
                    var compactSearch = window.CMS.CompactSearch;

                    $('.compact-search').on('click', '.result-destination li', function(e) {
                        compactSearch.destination.chooseDestinationAirport(this);
                    });
                },

                /**
                 * Bind events on the destination input field
                 */
                destinationInputEvents: function() {
                    var compactSearch = window.CMS.CompactSearch;
                    var destination = compactSearch.destination;
                    var destinationName = destination.destinationName;

                    //Bind focus event on the text-input
                    $(document).on('focus', destinationName, function(e) {
                        compactSearch.setCurrentCompactSearch($(this));
                        compactSearch.activatePanel(destination.destinationResult);
                        compactSearch.setNextInput(this);
                        //Check for value in origin and call if no value here
                        if (this.value === '' && compactSearch.origin.getOriginTlc() !== '') {
                            destination.getDestinationAirports(this);
                        }
                    });

                    //Bind keyup event on the text-input
                    $(document).on('keyup', destinationName, function(e) {
                        //prevent the search on tabbing into the field
                        if ($().allowedInputKey(e)) {
                            compactSearch.setCurrentCompactSearch($(this));
                            destination.triggerDestinationAirportSearch(this);
                        }
                    });

                    //Bind additional click event on the delete-button
                    destination.$destinationInputBlock.find('.btn-clear').click(function(e) {
                        compactSearch.setCurrentCompactSearch($(this));
                        var currentInput = $(this).parent().find(destinationName);

                        destination.getDestinationAirports(currentInput);
                    });
                }
            },

            initialize: function() {
                this.bindings.destinationInputEvents();
                this.bindings.destinationAirportEvents();
            }
        },

        /**
         * Handles functionality inside the origin panel
         */
        origin: {
            $originInputBlock: $('.originName').parent(),
            $originAirports: $('.compact-search .result-origin li'),

            originName: '.originName',
            originTlc: '.originTlc',
            originResult: '.result-origin',

            /**
             * Call CQ for origin airports that match searchString
             * @param currentInput
             */
            getOriginAirports: function(currentInput) {
                var compactSearch = window.CMS.CompactSearch;
                var currentOriginResult = compactSearch.$currentCompactSearch.find(this.originResult);
                var call = compactSearch.getAirportCall(currentInput, compactSearch.destination.destinationTlc);

                window.COMMON.Request.getHtml(
                    call,
                    function(data) {
                        compactSearch.origin.publishOriginAirports(data);
                    },
                    function(data) {
                        compactSearch.handleCompactSearchError(data);
                    },
                    $(currentOriginResult)
                );

                //reset tlc input
                this.setOriginTlc('');
            },

            /**
             * Paste the origin airports from the ajax call into the DOM
             * @param data
             */
            publishOriginAirports: function(data) {
                var compactSearch = window.CMS.CompactSearch;
                var currentOriginResult = compactSearch.$currentCompactSearch.find(this.originResult);

                $(currentOriginResult).html(data);
            },

            /**
             * Trigger a call to get the origin airports after the user finishes his input
             * @param currentInput
             */
            triggerOriginAirportSearch: function(currentInput) {
                $().inputTimer('clear');
                $().inputTimer('setTimer', setTimeout(function() {
                        window.CMS.CompactSearch.origin.getOriginAirports(currentInput);
                    }, $().inputTimer('getTimeout')
                ));
            },

            /**
             * Deliver data-fields from currentAirport to origin inputs (three letter code for the hidden field)
             * display-name for the text-input)
             * @param currentAirport
             */
            chooseOriginAirport: function(currentAirport) {
                var compactSearch = window.CMS.CompactSearch;

                //Set the three letter code into the hidden field
                this.setOriginTlc($(currentAirport).data('tlc'));
                //Set the text value into the text-input
                this.setOriginText($(currentAirport).data('text'));
                //Focus the destination input
                compactSearch.focusNextInput();
            },

            getOriginTlc: function() {
                var compactSearch = window.CMS.CompactSearch;

                return compactSearch.$currentCompactSearch.find(this.originTlc).val();
            },

            setOriginTlc: function(tlc) {
                var compactSearch = window.CMS.CompactSearch;

                compactSearch.$currentCompactSearch.find(this.originTlc).val(tlc);
            },

            getOriginText: function() {
                var compactSearch = window.CMS.CompactSearch;

                return compactSearch.$currentCompactSearch.find(this.originName).val();
            },

            setOriginText: function(text) {
                var compactSearch = window.CMS.CompactSearch;
                var originInput = compactSearch.$currentCompactSearch.find(this.originName);

                originInput.val(text);
                window.COMMON.Forms.textInputs.activateField($(originInput));
            },

            bindings: {
                /**
                 * Bind a click event on the origin airport-list
                 */
                originAirportEvents: function() {
                    var compactSearch = window.CMS.CompactSearch;

                    $(document).on('click', '.result-origin li', function(e) {
                        compactSearch.setCurrentCompactSearch($(this));
                        compactSearch.origin.chooseOriginAirport(this);
                    });
                },

                /**
                 * Binds events for the origin input field
                 */
                originInputEvents: function() {
                    var compactSearch = window.CMS.CompactSearch;
                    var origin = compactSearch.origin;
                    var originName = origin.originName;

                    if (compactSearch.origin.$originInputBlock.length !== 0) {

                        //Bind focus event on the text-input
                        $(document).on('focus', originName, function(e) {
                            compactSearch.setCurrentCompactSearch($(this));

                            compactSearch.activatePanel(origin.originResult);
                            compactSearch.setNextInput(this);
                            //Check for value in destination and call if no value here
                            if (this.value === '' && compactSearch.destination.getDestinationTlc() !== '') {
                                origin.getOriginAirports(this);
                            }
                        });

                        //Bind keyup event on the text-input
                        $(document).on('keyup', originName, function(e) {
                            //prevent the search on tabbing into the field
                            if ($().allowedInputKey(e)) {
                                compactSearch.setCurrentCompactSearch($(this));
                                origin.triggerOriginAirportSearch(this);
                            }
                        });

                        //Bind additional click event on the delete-button
                        origin.$originInputBlock.find('.btn-clear').click(function(e) {
                            compactSearch.setCurrentCompactSearch($(this));
                            var currentInput = $(this).parents().find(originName);

                            origin.getOriginAirports(currentInput);
                        });
                    }
                }
            },

            initialize: function() {
                this.bindings.originInputEvents();
                this.bindings.originAirportEvents();
            }
        },

        /**
         * Handles functionality for the "days" select-field
         */
        daySelect: {
            $csSelectInputs: $('.compact-search .input-select'),

            bindings: {
                /**
                 * Bind a click event on the date-selector
                 */
                selectDaysEvents: function() {
                    var compactSearch = window.CMS.CompactSearch;

                    if (compactSearch.daySelect.$csSelectInputs.length !== 0) {
                        compactSearch.daySelect.$csSelectInputs.click(function(e) {
                            compactSearch.setCurrentCompactSearch($(this));
                            compactSearch.deactivateAllPanels();
                        });
                    }
                }
            },

            initialize: function() {
                this.bindings.selectDaysEvents();
            }
        },

        /**
         * The datepicker for the compact search
         */
        datePicker: {
            $dateInputBlock: $('.dateText').parent(),
            dateName: '.dateText',
            dateResult: '.result-date',
            fromDpIdentifier: '.gw-datepicker.from',
            toDpIdentifier: '.gw-datepicker.to',
            fromDateHiddenField: '.fromDateValue',
            toDateHiddenField: '.toDateValue',

            availableDepartureDates: [],
            availableReturnDates: [],
            maximumBookingDate: '',

            /**
             * Sets departure- and return-flight dates to "today"
             */
            resetAllDates: function() {
                var compactSearch           = window.CMS.CompactSearch;
                var $from                   = compactSearch.$currentCompactSearch.find(this.fromDpIdentifier);
                var $to                     = compactSearch.$currentCompactSearch.find(this.toDpIdentifier);
                var $noReturnFlightCheckbox = compactSearch.$currentCompactSearch.find('.noReturnFlight').find('input[type=checkbox]');

                //Set dates in the datepickers
                $from.datepicker('setDate', new Date());
                $from.prev().find('.trip-date').text($to.datepicker().val());

                if ($noReturnFlightCheckbox.prop('checked')) {
                    $to.datepicker('option', 'minDate', new Date());
                    $to.datepicker('setDate', new Date());
                    $to.prev().find('.trip-date').text($from.datepicker().val());
                    this.setToHiddenValue($to.datepicker().val());
                }

                //Set values in hidden fields
                this.setFromHiddenValue($from.datepicker().val());
                compactSearch.$currentCompactSearch.find(this.dateName).val('');
                this.calculateDays();
            },

            /**
             * Updates the text-input with the chosen dates
             */
            updateDateTextInput: function() {
                var compactSearch   = window.CMS.CompactSearch;
                var $toDatePicker   = compactSearch.$currentCompactSearch.find(this.toDpIdentifier);
                var $fromDatePicker = compactSearch.$currentCompactSearch.find(this.fromDpIdentifier);
                var fromValue       = $fromDatePicker.datepicker().val();
                var toValue         = $toDatePicker.datepicker().val();

                fromValue = this.getShortenedDate(fromValue);
                toValue = this.getShortenedDate(toValue);
                this.setDateTextValue(fromValue + ' - ' + toValue);
            },

            /**
             * Returns the call for the valid datepicker dates
             * @returns {string}
             */
            getOriginDateCall: function() {
                var datePicker      = '.from.hasDatepicker';
                var originTlc       = '.originTlc';
                var destinationTlc  = '.destinationTlc';

                return this.getDatesCall(datePicker, originTlc, destinationTlc);
            },

            /**
             * Returns the call for the valid datepicker dates
             * @returns {string}
             */
            getDestinationDateCall: function() {
                var datePicker = '.to.hasDatepicker';
                //For the return-flight the destination from the input is the origin!
                var originTlc = '.destinationTlc';
                //For the return-flight the origin from the input is the destination!
                var destinationTlc = '.originTlc';

                return this.getDatesCall(datePicker, originTlc, destinationTlc);
            },

            /**
             * Returns the date call, use wrapper methods for destination and origin
             * @param datePicker
             * @param originTlcSelector
             * @param destinationTlcSelector
             * @returns {string}
             */
            getDatesCall: function(datePicker, originTlcSelector, destinationTlcSelector) {
                var datePickerClass     = window.CMS.Datepicker;
                var compactSearch       = window.CMS.CompactSearch;
                var $dateTextInput      = compactSearch.$currentCompactSearch.find('.dateText');
                var callUrl             = $dateTextInput.data('query');
                var originTlcParam      = $dateTextInput.data('param-tlc-origin');
                var destinationTlcParam = $dateTextInput.data('param-tlc-destination');
                var monthParam          = $dateTextInput.data('param-month');
                var currentDatePicker   = compactSearch.$currentCompactSearch.find(datePicker);
                var id                  = '#' + $(currentDatePicker).attr('id');
                var year                = datePickerClass.getSelectedYear(id);
                var month               = ('0' + (datePickerClass.getSelectedMonth(id) + 1)).slice(-2);
                var originTlcValue      = compactSearch.$currentCompactSearch.find(originTlcSelector).val();
                var destinationTlcValue = compactSearch.$currentCompactSearch.find(destinationTlcSelector).val();

                return callUrl + '?' + originTlcParam + '=' + originTlcValue
                    + '&' + destinationTlcParam + '=' + destinationTlcValue
                    + '&' + monthParam + '=' + year + '-' + month;
            },

            /**
             * Call CQ for flight dates that match the given params
             * @param isInitialCall
             */
            getOriginFlightDates: function(isInitialCall) {
                var compactSearch       = window.CMS.CompactSearch;
                var originDatepicker    = compactSearch.$currentCompactSearch.find('.from.hasDatepicker');
                var call                = compactSearch.datePicker.getOriginDateCall();

                window.COMMON.Request.getJson(
                    call,
                    function(data) {
                        compactSearch.datePicker.setAvailableDepartureDates(data, isInitialCall);
                    },
                    function(data) {
                        compactSearch.handleCompactSearchError(data);
                    },
                    originDatepicker
                );
            },

            /**
             * Call CQ for flight dates that match the given params
             * @param isInitialCall
             */
            getDestinationFlightDates: function(isInitialCall) {
                var compactSearch           = window.CMS.CompactSearch;
                var destinationDatepicker   = compactSearch.$currentCompactSearch.find('.to.hasDatepicker');
                var call                    = compactSearch.datePicker.getDestinationDateCall();

                window.COMMON.Request.getJson(
                    call,
                    function(data) {
                        compactSearch.datePicker.setAvailableReturnDates(data, isInitialCall);
                    },
                    function(data) {
                        compactSearch.handleCompactSearchError(data);
                    },
                    destinationDatepicker
                );
            },

            /**
             * Normalizes days to a timestamp to make them comparable
             * @param days
             */
            getNormalizedDays: function(days) {
                var arr = [];

                $.each(days, function() {
                    var date = new Date(this.date);
                    date.setHours(0,0,0,0);
                    var dateTime = date.getTime();
                    arr.push(dateTime);
                });

                return arr;
            },

            /**
             * Sets the available departure dates from the given callResponse
             * @param callResponse
             * @param isInitialCall
             */
            setAvailableDepartureDates: function(callResponse, isInitialCall) {
                var compactSearch   = window.CMS.CompactSearch;
                var datepicker      = window.CMS.Datepicker;

                compactSearch.datePicker.availableDepartureDates = this.getNormalizedDays(callResponse.days);
                this.maximumBookingDate = new Date(callResponse.maxDate);

                if (isInitialCall) {
                    compactSearch.$currentCompactSearch.find('.from.hasDatepicker').datepicker('option', 'maxDate', this.maximumBookingDate);
                    datepicker.refreshMonthList($(this.fromDpIdentifier).find('.ui-datepicker'));
                }

                compactSearch.$currentCompactSearch.find('.from.hasDatepicker').datepicker('refresh');
            },

            /**
             * Sets the available return dates from the given callResponse
             * @param callResponse
             * @param isInitialCall
             */
            setAvailableReturnDates: function(callResponse, isInitialCall) {
                var compactSearch   = window.CMS.CompactSearch;
                var datepicker      = window.CMS.Datepicker;

                $.each(callResponse.days, function() {
                    var date = new Date(this.date);
                    date.setHours(0,0,0,0);
                    var dateTime = date.getTime();
                    compactSearch.datePicker.availableReturnDates.push(dateTime);
                });

                this.maximumBookingDate = new Date(callResponse.maxDate);

                if (isInitialCall) {
                    compactSearch.$currentCompactSearch.find('.to.hasDatepicker').datepicker('option', 'maxDate', this.maximumBookingDate);
                    datepicker.refreshMonthList($(this.toDpIdentifier).find('.ui-datepicker'));
                }

                compactSearch.$currentCompactSearch.find('.to.hasDatepicker').datepicker('refresh');
            },

            setToHiddenValue: function(date) {
                var compactSearch       = window.CMS.CompactSearch;
                var $toDateValueInput   = compactSearch.$currentCompactSearch.find(compactSearch.datePicker.toDateHiddenField);

                $toDateValueInput.val(date);
            },

            setFromHiddenValue: function(date) {
                var compactSearch       = window.CMS.CompactSearch;
                var $fromDateValueInput = compactSearch.$currentCompactSearch.find(compactSearch.datePicker.fromDateHiddenField);

                $fromDateValueInput.val(date);
            },

            setDateTextValue: function(text) {
                var compactSearch   = window.CMS.CompactSearch;
                var $dateTextInput  = compactSearch.$currentCompactSearch.find(compactSearch.datePicker.dateName);

                $dateTextInput.val(text);
                window.COMMON.Forms.textInputs.activateField($dateTextInput);
            },

            getFromDatepickerValue: function() {
                var compactSearch   = window.CMS.CompactSearch;
                var $fromDatePicker = compactSearch.$currentCompactSearch.find(compactSearch.datePicker.fromDpIdentifier);

                return $fromDatePicker.datepicker().val();
            },

            /**
             * Set date from the origin-datepicker into the hidden field, shortened date into the text input
             * @TODO Fix for input-change!!
             */
            setDatesOnActivate: function() {
                var fromDateValue           = this.getFromDatepickerValue();
                var shortenedFromDateValue  = this.getShortenedDate(fromDateValue);

                this.setFromHiddenValue(fromDateValue);
                this.setDateTextValue(shortenedFromDateValue);
            },

            /**
             * Returns shortened date for text-input
             * @TODO Localize
             * @param date
             * @returns {string}
             */
            getShortenedDate: function(date) {
                var dateArray = date.split('.');
                dateArray['2'] = dateArray['2'].slice(-2);
                return dateArray.join('.');
            },

            /**
             * Set dates from the masked text-input for the content datepicker-containers
             * @param $input
             */
            setDatesFromTextInput: function($input) {
                var compactSearch           = window.CMS.CompactSearch;
                var fromDate                = $input.val().substr(0, 8);
                var toDate                  = $input.val().substr(11, 19);
                var $from                   = compactSearch.$currentCompactSearch.find(this.fromDpIdentifier);
                var $to                     = compactSearch.$currentCompactSearch.find(this.toDpIdentifier);
                var $fromDateValue          = compactSearch.$currentCompactSearch.find(compactSearch.datePicker.fromDateHiddenField);
                var $toDateValue            = compactSearch.$currentCompactSearch.find(compactSearch.datePicker.toDateHiddenField);

                if (this.checkDate(fromDate, true)) {
                    $from.prev().find('.trip-date').text(fromDate);
                    $from.datepicker('setDate', fromDate);
                    $fromDateValue.val($from.datepicker().val());
                    $to.datepicker('option', 'minDate', fromDate );
                } else {
                    //@TODO Error-Message for invalid Date
                    $().log('Invalid departure date!');
                }

                if (this.checkDate(toDate, false)) {
                    $to.prev().find('.trip-date').text(toDate);
                    $to.datepicker('setDate', toDate);
                    $toDateValue.val($to.datepicker().val());
                } else {
                    //@TODO Error-Message for invalid Date
                    $().log('Invalid return date!');
                }

                this.calculateDays();
            },

            /**
             * Checks a given date for valid format, then checks that date against a given array of forbidden dates
             * @TODO Localization
             * @param date
             * @param isDeparture {boolean}
             * @returns {boolean}
             */
            checkDate: function(date, isDeparture) {
                if (date == '') {
                    return false;
                }

                //Date pattern for german format
                //@todo localize
                var rxDatePattern = /^(\d{1,2})(\.)(\d{1,2})(\.)(\d{2})$/;
                var dateArray = date.match(rxDatePattern);

                if (dateArray == null) {
                    $().log('DateArray ist leer!');
                    return false;
                }

                //Checks for mm.dd.yyyy format
                var dateMonth   = dateArray[3];
                var dateDay     = dateArray[1];
                var dateYear    = 20 + dateArray[5];
                var dateObject  = new Date();

                dateObject.setFullYear(dateYear);
                dateObject.setMonth(dateMonth-1);
                dateObject.setDate(dateDay);

                if (dateMonth < 1 || dateMonth > 12) {
                    $().log('Monat ist nicht 1-12');
                    return false;
                }

                if (dateDay < 1 || dateDay> 31) {
                    $().log('Tag ist nicht 1-31');
                    return false;
                }

                if ((dateMonth == (4 || 6 || 9 || 11)) && dateDay == 31) {
                    $().log('31 existiert nicht in 4,6,9,11');
                    return false;
                }

                if (dateMonth == 2) {
                    var isleap = (dateYear % 4 == 0 && (dateYear % 100 != 0 || dateYear % 400 == 0));
                    if (dateDay> 29 || (dateDay ==29 && !isleap)) {
                        $().log('Datum ist im Februar, höher als 28 und nicht 29 im Schaltjahr! :)');
                        return false;
                    }
                }

                if (dateObject < new Date()) {
                    $().log('Date is before today!');
                    return false;
                }

                if (dateObject > this.maximumBookingDate) {
                    $().log('Datum liegt außerhalb des Buchungszeitraumes!');
                    return false;
                }

                return true;
            },

            /**
             * Calculate the duration of the time between departure and populate the duration div
             */
            calculateDays: function() {
                var compactSearch   = window.CMS.CompactSearch;
                var start           = compactSearch.$currentCompactSearch.find(this.fromDpIdentifier).datepicker('getDate');
                var $toDatepicker   = compactSearch.$currentCompactSearch.find(this.toDpIdentifier);
                var end             = $toDatepicker.datepicker('getDate');
                var days            = Math.round((end - start)/1000/60/60/24) + 1;

                $toDatepicker.parent().find('.trip-length .number').text(days);
                if (days == 1) {
                    $toDatepicker.parent().find('.plural').addClass('hidden');
                    $toDatepicker.parent().find('.singular').removeClass('hidden');
                } else {
                    $toDatepicker.parent().find('.singular').addClass('hidden');
                    $toDatepicker.parent().find('.plural').removeClass('hidden');
                }
            },

            /**
             * Disables the return-flight datepicker matching the given elements' compact-search
             */
            disableToDatepicker: function() {
                var _this           = window.CMS.CompactSearch.datePicker;
                var compactSearch   = window.CMS.CompactSearch;
                var $toDatePicker   = compactSearch.$currentCompactSearch.find(_this.toDpIdentifier);
                var $fromDatePicker = compactSearch.$currentCompactSearch.find(_this.fromDpIdentifier);

                $toDatePicker.datepicker('option', 'minDate', $fromDatePicker.datepicker('getDate'));
                $toDatePicker.datepicker('setDate');
                $toDatePicker.fadeTo(400, 0.5);
                $toDatePicker.parent().addClass('disabled');
                _this.setToHiddenValue('')

                //mask the input field
                $(_this.dateName).inputmask(
                    //@TODO localize mask
                    "mask", {
                        "mask": "d.m.99",
                        showMaskOnFocus: false,
                        showMaskOnHover: false,
                        "placeholder": "TT.MM.JJ",
                        "oncleared": function () {
                            var _this = this;
                            setTimeout(function () {
                                $(_this).parents('.input-block').addClass('active');
                            }, 1)
                        }
                    }
                );
            },

            /**
             * Enables the return-flight datepicker matching the given elements' compact search
             * @param isCheckbox
             */
            enableToDatepicker: function(isCheckbox) {
                var compactSearch   = window.CMS.CompactSearch;
                var _this           = compactSearch.datePicker;
                var $toDatePicker   = compactSearch.$currentCompactSearch.find(_this.toDpIdentifier);
                var $fromDatePicker = compactSearch.$currentCompactSearch.find(_this.fromDpIdentifier);

                isCheckbox = (typeof isCheckbox === "undefined") ? false : isCheckbox;
                if (isCheckbox) {
                    $toDatePicker.datepicker('setDate', $fromDatePicker.datepicker('getDate'));
                }

                $toDatePicker.parent().removeClass('disabled');
                $toDatePicker.fadeTo(400, 1);
                $toDatePicker.datepicker('option', 'minDate', $fromDatePicker.datepicker('getDate'));
                $toDatePicker.datepicker('option', 'maxDate', this.maximumBookingDate);
                $toDatePicker.prev().find('.trip-date').text($toDatePicker.datepicker().val());
                _this.setToHiddenValue($toDatePicker.datepicker().val());
                _this.calculateDays();

                //mask the input field
                compactSearch.$currentCompactSearch.find(_this.dateName).inputmask(
                    //@TODO localize mask
                    "mask", {
                        "mask": "d.m.99 - d.m.99",
                        showMaskOnFocus: false,
                        showMaskOnHover: false,
                        "placeholder": "TT.MM.JJ - TT.MM.JJ",
                        "oncleared": function () {
                            var _this = this;
                            setTimeout(function () {
                                $(_this).parents('.input-block').addClass('active');
                            }, 1)
                        }
                    }
                );

                _this.updateDateTextInput();
            },

            /**
             * Disables or enables the return-flight datepicker depending on its current status
             * @param checked
             */
            toggleReturnFlightDatepicker: function(checked) {
                if (checked) {
                    this.enableToDatepicker(true);
                } else {
                    this.disableToDatepicker();
                }
            },

            /**
             * Datepicker options for the departure flight
             */
            fromOptions: {
                onSelect: function(selectedDate, inst) {
                    var compactSearch           = window.CMS.CompactSearch;
                    var _this                   = compactSearch.datePicker;
                    var datepicker              = window.CMS.Datepicker;
                    var fromDatepicker          = compactSearch.$currentCompactSearch.find(_this.fromDpIdentifier);
                    var toDatepicker            = compactSearch.$currentCompactSearch.find(_this.toDpIdentifier);
                    var toInst                  = $.datepicker._getInst(toDatepicker[0]);
                    var noReturnFlightCheckbox  = compactSearch.$currentCompactSearch.find('.noReturnFlight').find('input[type=checkbox]');

                    if ($(noReturnFlightCheckbox).prop('checked')) {
                        if (fromDatepicker.datepicker('getDate') > toDatepicker.datepicker('getDate')) {
                            toDatepicker.prev().find('.trip-date').text(selectedDate);
                            _this.setToHiddenValue(selectedDate)
                        }
                    }

                    $(inst.dpDiv).parent().prev().find('.trip-date').text(selectedDate);
                    toDatepicker.datepicker('option', 'minDate', selectedDate );
                    _this.updateDateTextInput();
                    //refresh the destination month-list
                    datepicker.refreshMonthList($(toInst.dpDiv));
                    _this.calculateDays();
                    _this.setFromHiddenValue(selectedDate)
                },
                beforeShowDay: function (date) {
                    var _this                   = window.CMS.CompactSearch.datePicker;
                    var result                  = [];
                    var availableDepartureDays  = _this.availableDepartureDates;

                    result[0] = $.inArray(date.getTime(), availableDepartureDays) !== -1;
                    return result;
                },
                onChangeMonthYear: function (year, month, inst) {
                    var _this           = window.CMS.CompactSearch.datePicker;
                    var datepicker      = window.CMS.Datepicker;
                    var $datePickerDiv  = $(inst.dpDiv);
                    _this.getOriginFlightDates(false);
                    datepicker.refreshMonthList($datePickerDiv);
                }
            },

            /**
             * Datepicker options for the return flight
             */
            toOptions: {
                onSelect: function(selectedDate, inst) {
                    var compactSearch                   = window.CMS.CompactSearch;
                    var csDatePicker                    = compactSearch.datePicker;
                    var toDateValue                     = compactSearch.$currentCompactSearch.find(csDatePicker.toDateHiddenField);
                    var noReturnFlightCheckboxContainer = compactSearch.$currentCompactSearch.find('.noReturnFlight');
                    var noReturnFlightCheckbox          = noReturnFlightCheckboxContainer.find('input[type=checkbox]');

                    if ($(noReturnFlightCheckbox).prop('checked')) {
                        csDatePicker.enableToDatepicker(false);
                        window.COMMON.Forms.checkBoxes.activateCheckbox(noReturnFlightCheckboxContainer);
                    }

                    $(inst.dpDiv).parent().prev().find('.trip-date').text(selectedDate);

                    toDateValue.val(selectedDate);
                    csDatePicker.updateDateTextInput();
                    csDatePicker.calculateDays();
                },
                beforeShowDay: function (date) {
                    var result = [];
                    var availableDepartureDays = window.CMS.CompactSearch.datePicker.availableDepartureDates;

                    result[0] = $.inArray(date.getTime(), availableDepartureDays) !== -1;
                    return result;
                },
                onChangeMonthYear: function (year, month, inst) {
                    var _this = window.CMS.CompactSearch.datePicker;
                    var datepicker = window.CMS.Datepicker;
                    var $datePickerDiv = $(inst.dpDiv);
                    _this.getDestinationFlightDates(false);
                    datepicker.refreshMonthList($datePickerDiv);
                }
            },

            bindings: {
                /**
                 * Events for the date text-input
                 */
                dateInputEvents: function() {
                    var compactSearch   = window.CMS.CompactSearch;
                    var csDatepicker    = compactSearch.datePicker;

                    if (csDatepicker.$dateInputBlock.length !== 0) {
                        //Bind click event on the input-container
                        $('.compact-search').on('click', '.dateText:parent', function(e) {
                            compactSearch.setCurrentCompactSearch($(this));

                            if ($(csDatepicker.dateResult).hasClass('hidden')) {
                                csDatepicker.getDestinationFlightDates(true);
                                csDatepicker.getOriginFlightDates(true);
                                csDatepicker.setDatesOnActivate();
                            }

                            compactSearch.activatePanel(csDatepicker.dateResult);
                        });

                        $(document).on('focus', csDatepicker.dateName, function(e) {
                            compactSearch.setCurrentCompactSearch($(this));

                            if ($(csDatepicker.dateResult).hasClass('hidden')) {
                                csDatepicker.getDestinationFlightDates(true);
                                csDatepicker.getOriginFlightDates(true);
                                csDatepicker.setDatesOnActivate();
                            }

                            compactSearch.activatePanel(csDatepicker.dateResult);
                            compactSearch.setNextInput(this);
                        });

                        $(document).on('keyup', csDatepicker.dateName, function(e) {
                            var _this = this;
                            if ($().allowedInputKey(e)) {
                                $().inputTimer('clear');
                                $().inputTimer('setTimer', setTimeout(function() {
                                        compactSearch.setCurrentCompactSearch($(_this));
                                        csDatepicker.setDatesFromTextInput($(_this));
                                    }, $().inputTimer('getTimeout')
                                ));
                            }
                        });

                        $(document).on('blur', csDatepicker.dateName, function(e) {
                            if($(this).val() == '') {
                                $(this).parents('.input-block').removeClass('active');
                            }
                        });

                        csDatepicker.$dateInputBlock.find('.btn-clear').click(function(e) {
                            csDatepicker.resetAllDates();
                        });
                    }
                },

                /**
                 * Events for the "return flight" checkbox
                 */
                checkBoxEvents: function() {
                    var _this = window.CMS.CompactSearch.datePicker;
                    $(document).on('checkboxEvent', '.noReturnFlight', function(e, value) {
                        _this.toggleReturnFlightDatepicker(value);
                    });
                }
            },

            /**
             * Initializes the datepicker for the compact search
             */
            initialize: function() {
                if($(this.fromDpIdentifier).length !== 0) {
                    //determine options for the datepickers
                    var $from           = $(this.fromDpIdentifier);
                    var $to             = $(this.toDpIdentifier);
                    var datepicker      = window.CMS.Datepicker;
                    this.fromOptions    = $.extend(this.fromOptions, datepicker.dpOptions);
                    this.toOptions      = $.extend(this.toOptions, datepicker.dpOptions);

                    $from.datepicker(this.fromOptions);
                    $to.datepicker(this.toOptions);

                    //Set dates for datepickers to today
                    $from.datepicker('setDate', new Date());
                    $to.datepicker('setDate', new Date());

                    //Populate the month-list
                    datepicker.populateMonthList(this.fromDpIdentifier);
                    datepicker.populateMonthList(this.toDpIdentifier);

                    //mask the input field
                    $(this.dateName).inputmask(
                        "mask", {
                            "mask": "d.m.99 - d.m.99",
                            showMaskOnFocus: false,
                            showMaskOnHover: false,
                            "placeholder": "TT.MM.JJ - TT.MM.JJ",
                            "oncleared": function () {
                                var _this = this;
                                setTimeout(function () {
                                    $(_this).parents('.input-block').addClass('active');
                                }, 1)
                            }
                        }
                    );

                    //init datepicker events
                    this.bindings.checkBoxEvents();
                    this.bindings.dateInputEvents();
                }
            }
        },

        weekPicker: {
            dateHiddenField : '.dateValue',
            weekDpIdentifier : '.gw-weekpicker',
            $dateInputBlock: $('.dateText').parent(),
            dateName: '.dateText',
            dateResult: '.result-date',
            firstDayOfTheWeek: '',
            lastDayOfTheWeek: '',

            weekPickerOptions: {
                onSelect: function(selectedDate, inst) {
                    var compactSearch   = window.CMS.CompactSearch;
                    var weekPicker      = compactSearch.weekPicker;
                    var datepicker      = window.CMS.Datepicker;
                    var $weekPicker     = compactSearch.$currentCompactSearch.find(weekPicker.weekDpIdentifier);
                    var $fromDateValue  = compactSearch.$currentCompactSearch.find(weekPicker.dateHiddenField);
                    var date            = $weekPicker.datepicker('getDate');

                    weekPicker.firstDayOfTheWeek = datepicker.getFirstDayOfTheWeek(date);
                    weekPicker.lastDayOfTheWeek = datepicker.getLastDayOfTheWeek(date);

                    var firstDayOfTheWeekFormatted  = $.datepicker.formatDate( 'dd.mm.yy', weekPicker.firstDayOfTheWeek);
                    var lastDayOfTheWeekFormatted   = $.datepicker.formatDate( 'dd.mm.yy', weekPicker.lastDayOfTheWeek);
                    var displayDate                 = firstDayOfTheWeekFormatted + ' - ' + lastDayOfTheWeekFormatted;

                    $(inst.dpDiv).parent().prev().find('.trip-date').text(displayDate);
                    compactSearch.$currentCompactSearch.find(weekPicker.dateName).val(
                        window.CMS.CompactSearch.datePicker.getShortenedDate(selectedDate)
                    );
                    //refresh the destination month-list
                    $fromDateValue.val(selectedDate);
                },
                beforeShowDay: function (date) {
                    var weekPicker  = window.CMS.CompactSearch.weekPicker;
                    var result      = [];

                    if (date >= weekPicker.firstDayOfTheWeek && date <= weekPicker.lastDayOfTheWeek) {
                        result[1] = 'selected-week'
                    }
                    result[0] = true;
                    return result;
                },
                onChangeMonthYear: function (year, month, inst) {
                    var datepicker      = window.CMS.Datepicker;
                    var $datePickerDiv  = $(inst.dpDiv);

                    datepicker.refreshMonthList($datePickerDiv);
                }
            },

            setHiddenDate: function(date) {
                var compactSearch   = window.CMS.CompactSearch;
                var $dateValueInput = compactSearch.$currentCompactSearch.find(this.dateHiddenField);

                $dateValueInput.val(date);
            },

            setInputText: function(text) {
                var compactSearch   = window.CMS.CompactSearch;
                var $dateTextInput  = compactSearch.$currentCompactSearch.find(compactSearch.datePicker.dateName);

                $dateTextInput.val(text);
                window.COMMON.Forms.textInputs.activateField($dateTextInput);
            },

            getWeekpickerDate: function() {
                var compactSearch   = window.CMS.CompactSearch;
                var $weekPicker     = compactSearch.$currentCompactSearch.find(this.weekDpIdentifier);

                return $weekPicker.datepicker().val();
            },

            /**
             * Set date from the origin-datepicker into the hidden field, shortened date into the text input
             * @TODO Fix for input-change!!
             */
            setDatesOnActivate: function() {
                var compactSearch       = window.CMS.CompactSearch;
                var weekDateValue       = this.getWeekpickerDate();
                var shortenedWeekDate   = compactSearch.datePicker.getShortenedDate(weekDateValue);

                this.setHiddenDate(weekDateValue);
                this.setInputText(shortenedWeekDate);
            },

            bindings: {
                dateInputEvents: function() {
                    var compactSearch   = window.CMS.CompactSearch;
                    var weekPicker      = compactSearch.weekPicker;

                    $(document).on('focus', weekPicker.dateName, function(e) {
                        compactSearch.setCurrentCompactSearch($(this));

                        if ($(weekPicker.dateResult).hasClass('hidden')) {
                            weekPicker.setDatesOnActivate();
                        }

                        compactSearch.activatePanel(weekPicker.dateResult);
                        compactSearch.setNextInput(this);
                    });
                }
            },

            initialize: function() {
                if ($('.gw-weekpicker').length !== 0) {
                    var $weekPicker         = $(this.weekDpIdentifier);
                    var datepicker          = window.CMS.Datepicker;
                    this.weekPickerOptions  = $.extend(this.weekPickerOptions, datepicker.dpOptions);

                    $weekPicker.datepicker(this.weekPickerOptions);
                    $weekPicker.datepicker('setDate', new Date());
                    datepicker.populateMonthList(this.weekDpIdentifier);

                    //mask the input field
                    $(this.dateName).inputmask(
                        "mask", {
                            mask: "d.m.99",
                            showMaskOnFocus: false,
                            showMaskOnHover: false,
                            placeholder: "TT.MM.JJ",
                            oncleared: function () {
                                var _this = this;
                                setTimeout(function () {
                                    $(_this).parents('.input-block').addClass('active');
                                }, 1)
                            }
                        }
                    );

                    this.bindings.dateInputEvents();
                }
            }
        },

        lowFareCalendar: {
            lowFareContainerIdentifier: '.low-fare-calendar-search',
            lowFareDpIdentifier : '.gw-low-fare-calendar',
            lowFareFromDpIdentifier : '.gw-low-fare-calendar.from',
            lowFareToDpIdentifier : '.gw-low-fare-calendar.to',
            originDateHiddenField: '.fromDateValue',
            destinationDateHiddenField: '.toDateValue',

            destinationJsonField: '.lowFareDestinationJson',
            originJsonField: '.lowFareOriginJson',

            originTlcField: '.originTlc',
            destinationTlcField: '.destinationTlc',

            originPrice: '.lowFareOriginPrice',
            destinationPrice: '.lowFareDestinationPrice',

            availableDepartureDates: [],
            availableReturnDates: [],
            currentLowFareCalendar: '',
            datepickerInitialized: false,
            maximumBookingDate: '',

            /**
             * Sets the current lowFareCalendar - should be called with every event
             * @param $element
             */
            setCurrentLowFareCalendar: function($element) {
                this.currentLowFareCalendar = $element.parents(this.lowFareContainerIdentifier);
            },

            /**
             * Applies prices to the origin lowFareCalendar
             * @param html
             * @returns {*}
             */
            applyPricesToOriginCalendar: function(html) {
                return window.CMS.CompactSearch.lowFareCalendar.addPricesToCalendars($(html), 'from');
            },

            /**
             * Apllies prices to thze destination lowFareCalendar
             * @param html
             * @returns {*}
             */
            applyPricesToDestinationCalendar: function(html) {
                return window.CMS.CompactSearch.lowFareCalendar.addPricesToCalendars($(html), 'to');
            },

            /**
             * Refreshes the Text corresponding to the given dp-div
             * @param date
             * @param dpDiv
             */
            refreshDateText: function(date, dpDiv) {
                $(dpDiv).parent().prev().find('.trip-date').text(date);
            },

            /**
             * Disables or enables the return-flight datepicker depending on its current status
             * @param checked
             */
            toggleReturnFlightDatepicker: function(checked) {
                if (checked) {
                    this.enableToDatepicker(true);
                } else {
                    this.disableToDatepicker();
                }
            },

            /**
             * Sets the price data to the given datepicker
             * @param $datePicker
             * @param data
             */
            setPriceDataForDatepicker: function($datePicker, data) {
                this.currentLowFareCalendar.find($datePicker).data('lowFareCalendarData', data);
            },

            /**
             * Gets the price data from the given datepicker
             * @param $datePicker
             * @returns {*}
             */
            getPriceDataForDatepicker: function($datePicker) {
                return $datePicker.data('lowFareCalendarData');
            },

            /**
             * Calculate the duration of the time between departure and populate the duration div
             */
            calculateDays: function() {
                var start           = this.currentLowFareCalendar.find(this.lowFareFromDpIdentifier).datepicker('getDate');
                var $toDatepicker   = this.currentLowFareCalendar.find(this.lowFareToDpIdentifier);
                var end             = $toDatepicker.datepicker('getDate');
                var days            = Math.round((end - start)/1000/60/60/24) + 1;
                var daysText;

                var tripDurationText = $toDatepicker.parent().find('.trip-duration-text').text();
                if (days == 1) {
                    daysText = $toDatepicker.parent().find('.singular').text();
                } else {
                    daysText = $toDatepicker.parent().find('.plural').text();
                }
                $toDatepicker.parent().find('.trip-date').prop('title', tripDurationText + ' ' + days + ' ' + daysText);
            },

            /**
             * Add prices to the given datepicker, the identifier is needed for the customEvent callback from the
             * datepicker select events
             * @param $datePicker
             * @param calendarIdentifier
             * @returns {*}
             */
            addPricesToCalendars: function($datePicker, calendarIdentifier) {
                var data = this.getPriceDataForDatepicker($(this.lowFareToDpIdentifier));

                if (calendarIdentifier == 'from') {
                    data = this.getPriceDataForDatepicker($(this.lowFareFromDpIdentifier));
                }

                return this.mapPricesToElements($datePicker, data, calendarIdentifier);
            },

            /**
             * Maps the prices from the given data to the dates from the given datepicker
             * @param $datePicker
             * @param data
             * @param calendarIdentifier
             * @returns {*}
             */
            mapPricesToElements: function($datePicker, data, calendarIdentifier) {
                var availableFlight = false;
                var replacedHtml;

                $datePicker.find('tr td').each(function() {
                    var $tableCell  = $(this);
                    var month       = ('0' + ($tableCell.data('month') + 1)).slice(-2);
                    var day         = ('0' + $tableCell.text()).slice(-2);
                    var year        = $tableCell.data('year');
                    var dateString  = year + '-' + month + '-' + day;

                    $(data.days).each(function(i, e) {
                        if (e.date == dateString
                            && typeof e.currency != 'undefined'
                            && typeof e.price != 'undefined') {

                            $tableCell.append(
                                '<span class="currency">' + e.currency + '*</span>'
                                + '<span class="price">' + e.price.replace(".", ",") + '</span>'
                            );

                            availableFlight = true;
                        }
                    });
                });

                if (!availableFlight) {
                    if (calendarIdentifier == 'from') {
                        replacedHtml = this.replaceOriginCalendarText($datePicker);
                    } else {
                        replacedHtml = this.replaceDestinationCalendarText($datePicker);
                    }

                    $datePicker.filter('.ui-datepicker-calendar').each(function() {
                        this.innerHTML = replacedHtml;
                    });
                }

                return $datePicker;
            },

            /**
             * Set dates from the masked text-input for the content datepicker-containers
             * @param $input
             */
            setDatesFromLowFareTextInput: function($input) {
                var compactSearch   = window.CMS.CompactSearch;
                var fromDate        = $input.val().substr(0, 8);
                var toDate          = $input.val().substr(11, 19);
                var $from           = this.currentLowFareCalendar.find(this.lowFareFromDpIdentifier);
                var $to             = this.currentLowFareCalendar.find(this.lowFareToDpIdentifier);
                var $fromDateValue  = this.currentLowFareCalendar.find(this.originDateHiddenField);
                var $toDateValue    = this.currentLowFareCalendar.find(this.destinationDateHiddenField);

                if (compactSearch.datePicker.checkDate(fromDate, true)) {
                    $from.prev().find('.trip-date').text(fromDate);
                    $from.datepicker('setDate', fromDate);
                    $fromDateValue.val($from.datepicker().val());
                    $to.datepicker('option', 'minDate', fromDate );
                } else {
                    //@TODO Error-Message for invalid Date
                    $().log('Invalid departure date!');
                }

                if (compactSearch.datePicker.checkDate(toDate, false)) {
                    $to.prev().find('.trip-date').text(toDate);
                    $to.datepicker('setDate', toDate);
                    $toDateValue.val($to.datepicker().val());
                } else {
                    //@TODO Error-Message for invalid Date
                    $().log('Invalid return date!');
                }

                this.calculateDays();
            },

            /**
             * Replaces the calendar output with a hint-text including a link to the next month with available flights
             * @param $datePicker
             * @param destinationName
             * @returns {XML|string}
             */
            replaceCalendarText: function($datePicker, destinationName) {
                var _this = this;
                var replacedHtml;
                var noFlightFoundText = $('.noFlightFoundInfoText').html();
                var monthYear = $datePicker.filter('.ui-datepicker-header').find('.ui-datepicker-title').text();

                replacedHtml = noFlightFoundText.replace('###monthYear###', monthYear)
                    .replace('###destination###', _this.currentLowFareCalendar.find(destinationName).val())
                    //@TODO Get month + year from json
                    .replace('###targetMonthYear###', 'November 2014')
                    //@TODO Get month number from json
                    .replace('###targetMonthNumber###', '11')
                    //@TODO Get month from json
                    .replace('###targetMonth###', 'November');

                return replacedHtml;
            },

            replaceOriginCalendarText: function($datePicker) {
                return this.replaceCalendarText($datePicker, '.destinationName');
            },

            replaceDestinationCalendarText: function($datePicker) {
                return this.replaceCalendarText($datePicker, '.originName');
            },

            /**
             * Returns the call for origin data
             * @returns String
             */
            getFromLowFareCalendarCall: function() {
                var url             = this.currentLowFareCalendar.find(this.originJsonField).data('q');
                var originTlc       = this.currentLowFareCalendar.find(this.originTlcField).val();
                var destinationTlc  = this.currentLowFareCalendar.find(this.destinationTlcField).val();
                var date            = this.currentLowFareCalendar.find(this.originDateHiddenField).val();

                url = url + '?originTlc=' + originTlc + '&destinationTlc=' + destinationTlc + '&date=' + date;

                return url;
            },

            /**
             * Returns the call for the destination data
             * @returns {*}
             */
            getToLowFareCalendarCall: function() {
                var url             = this.currentLowFareCalendar.find(this.destinationJsonField).data('q');
                var originTlc       = this.currentLowFareCalendar.find(this.destinationTlcField).val();
                var destinationTlc  = this.currentLowFareCalendar.find(this.originTlcField).val();
                var date            = this.currentLowFareCalendar.find(this.destinationDateHiddenField).val();

                url = url + '?originTlc=' + destinationTlc + '&destinationTlc=' + originTlc + '&date=' + date;

                return url;
            },

            /**
             *
             */
            publishTotalPrice: function() {
                var priceContainer      = this.currentLowFareCalendar.find('.price-text .price');
                var originPrice         = parseFloat(this.currentLowFareCalendar.find(this.originPrice).val().replace(',','.'));
                var destinationPrice    = parseFloat(this.currentLowFareCalendar.find(this.destinationPrice).val().replace(',','.'));

                if (this.currentLowFareCalendar.find('.noLowFareCalendarReturnFlight input').attr('checked')) {
                    priceContainer.text((originPrice + destinationPrice).toFixed(2));
                } else {
                    priceContainer.text(originPrice.toFixed(2));
                }

                priceContainer.text(priceContainer.text().replace('.',','));
            },

            /**
             *
             * @param html
             * @returns {*}
             */
            getPriceForSelectedOriginDate: function(html) {
                var _this = window.CMS.CompactSearch.lowFareCalendar;
                //apply prices to calendar
                html = _this.applyPricesToOriginCalendar(html);
                //get the current price from the applied prices
                var price = $(html).find('.ui-datepicker-current-day .price').text();

                if (price) {
                    //write price into hidden field
                    _this.currentLowFareCalendar.find(_this.originPrice).val(price);
                    //Get the sum and publish
                    _this.publishTotalPrice();
                }

                return html;
            },

            /**
             *
             * @param html
             * @returns {*}
             */
            getPriceForSelectedDestinationDate: function(html) {
                var _this = window.CMS.CompactSearch.lowFareCalendar;
                //apply prices to calendar
                html = _this.applyPricesToDestinationCalendar(html);
                //get the current price from the applied prices
                var price = $(html).find('.ui-datepicker-current-day .price').text();

                if (price) {
                    //write price into hidden field
                    _this.currentLowFareCalendar.find(_this.destinationPrice).val(price);
                    //Get the sum and publish
                    _this.publishTotalPrice();
                }

                return html;
            },

            /**
             *
             * @param html
             * @returns {*}
             */
            getDestinationPriceForOriginSelect: function(html) {
                var _this = window.CMS.CompactSearch.lowFareCalendar;
                //get the current price from the applied prices
                var price = $(html).find('.ui-datepicker-current-day .price').text();

                if (price) {
                    //write price into hidden field
                    _this.currentLowFareCalendar.find(_this.destinationPrice).val(price);
                    //Get the sum and publish
                    _this.publishTotalPrice();
                }

                return html;
            },

            /**
             * Options for the origin destinationLowFareDatepicker
             */
            lowFareCalendarFromOptions: {
                onSelect: function(selectedDate, inst) {
                    var _this                   = window.CMS.CompactSearch.lowFareCalendar;
                    var datepicker              = window.CMS.Datepicker;
                    var fromDatepicker          = _this.currentLowFareCalendar.find(_this.lowFareFromDpIdentifier);
                    var toDatepicker            = _this.currentLowFareCalendar.find(_this.lowFareToDpIdentifier);
                    var toInst                  = $.datepicker._getInst(toDatepicker[0]);
                    var noReturnFlightCheckbox  = _this.currentLowFareCalendar.find('.noLowFareCalendarReturnFlight').find('input[type=checkbox]');
                    var fromDateValue           = _this.currentLowFareCalendar.find(_this.fromDateHiddenField);
                    var toDateValue             = _this.currentLowFareCalendar.find(_this.destinationDateHiddenField);

                    if ($(noReturnFlightCheckbox).prop('checked')) {
                        if (fromDatepicker.datepicker('getDate') > toDatepicker.datepicker('getDate')) {
                            toDatepicker.prev().find('.trip-date').text(selectedDate);
                            toDateValue.val(selectedDate);
                        }
                    }

                    _this.refreshDateText(selectedDate, inst.dpDiv);
                    toDatepicker.datepicker('option', 'minDate', selectedDate );
                    //Get the price from the DESTINATION datepicker when we pick a origin date
                    _this.getDestinationPriceForOriginSelect(_this.currentLowFareCalendar.find(_this.lowFareToDpIdentifier)[0].innerHTML);

                    //refresh the destination month-list
                    datepicker.refreshMonthList($(toInst.dpDiv));
                    fromDateValue.val(selectedDate);
                    inst.customEvent = _this.getPriceForSelectedOriginDate;
                    _this.calculateDays();
                },
                beforeShowDay: function(date) {
                    var _this           = window.CMS.CompactSearch.lowFareCalendar;
                    var result          = [];
                    var isAvailable     = false;
                    var additionalClass = '';

                    if ($.inArray(date.getTime(), _this.availableDepartureDates) !== -1) {
                        isAvailable = true;
                        additionalClass = 'availableDate';
                    }

                    result[0] = isAvailable;
                    result[1] = additionalClass;
                    return result;
                },
                onChangeMonthYear: function(year, month, inst) {
                    var _this           = window.CMS.CompactSearch.lowFareCalendar;
                    var datepicker      = window.CMS.Datepicker;
                    var $datePickerDiv  = $(inst.dpDiv);

                    _this.currentLowFareCalendar.find(_this.originDateHiddenField).val(
                        ('0' + month).slice(-2)
                    );

                    _this.updateFromLowFareCalendar();
                    datepicker.refreshMonthList($datePickerDiv);
                },
                defaultDate: $('.fromDateValue').val()
            },

            /**
             * Options for the destination lowFareDatepicker
             */
            lowFareCalendarToOptions: {
                onSelect: function(selectedDate, inst) {
                    var _this                           = window.CMS.CompactSearch.lowFareCalendar;
                    var destinationDateValue            = _this.currentLowFareCalendar.find(_this.destinationDateHiddenField);
                    var noReturnFlightCheckboxContainer = _this.currentLowFareCalendar.find('.noLowFareCalendarReturnFlight');
                    var noReturnFlightCheckbox          = noReturnFlightCheckboxContainer.find('input[type=checkbox]');

                    if (!$(noReturnFlightCheckbox).prop('checked')) {
                        _this.enableToDatepicker(false);
                        window.COMMON.Forms.checkBoxes.activateCheckbox(noReturnFlightCheckboxContainer);
                    }

                    _this.refreshDateText(selectedDate, inst.dpDiv);
                    inst.customEvent = _this.getPriceForSelectedDestinationDate;
                    destinationDateValue.val(selectedDate);
                    _this.calculateDays();
                },
                beforeShowDay: function (date) {
                    var _this           = window.CMS.CompactSearch.lowFareCalendar;
                    var result          = [];
                    var isAvailable     = false;
                    var additionalClass = '';

                    if ($.inArray(date.getTime(), _this.availableReturnDates) !== -1) {
                        isAvailable = true;
                        additionalClass = 'availableDate';
                    }

                    result[0] = isAvailable;
                    result[1] = additionalClass;
                    return result;
                },
                onChangeMonthYear: function (year, month, inst) {
                    var _this           = window.CMS.CompactSearch.lowFareCalendar;
                    var datepicker      = window.CMS.Datepicker;
                    var $datePickerDiv  = $(inst.dpDiv);

                    _this.currentLowFareCalendar.find('input[name=toMonth]').val(
                        ('0' + month).slice(-2)
                    );
                    _this.updateToLowFareCalendar();
                    datepicker.refreshMonthList($datePickerDiv);
                },
                defaultDate: $('.toDateValue').val()
            },

            /**
             * Enables the return-flight datepicker matching the given elements' compact search
             * @param isCheckbox
             */
            enableToDatepicker: function(isCheckbox) {
                var compactSearch   = window.CMS.CompactSearch;
                var _this           = compactSearch.lowFareCalendar;
                var $toDatePicker   = _this.currentLowFareCalendar.find(_this.lowFareToDpIdentifier);
                var $fromDatePicker = _this.currentLowFareCalendar.find(_this.lowFareFromDpIdentifier);

                isCheckbox = (typeof isCheckbox === "undefined") ? false : isCheckbox;
                if (isCheckbox) {
                    $toDatePicker.datepicker('setDate', $fromDatePicker.datepicker('getDate'));
                }

                $toDatePicker.parent().removeClass('disabled');
                $toDatePicker.fadeTo(400, 1);
                $toDatePicker.datepicker('option', 'minDate', $fromDatePicker.datepicker('getDate'));
                //$toDatePicker.datepicker('option', 'maxDate', this.maximumBookingDate);
                $toDatePicker.prev().find('.trip-date').text($toDatePicker.datepicker().val());
            },

            /**
             * Disables the return-flight datepicker matching the given elements' compact-search
             */
            disableToDatepicker: function() {
                var compactSearch   = window.CMS.CompactSearch;
                var _this           = compactSearch.lowFareCalendar;
                var $toDatePicker   = _this.currentLowFareCalendar.find(_this.lowFareToDpIdentifier);
                var $fromDatePicker = _this.currentLowFareCalendar.find(_this.lowFareFromDpIdentifier);

                $toDatePicker.datepicker('option', 'minDate', $fromDatePicker.datepicker('getDate'));
                $toDatePicker.datepicker('setDate');
                $toDatePicker.fadeTo(400, 0.5);
                $toDatePicker.parent().addClass('disabled');
            },

            /**
             *
             */
            updateFromLowFareCalendar: function() {
                var compactSearch   = window.CMS.CompactSearch;
                var _this           = compactSearch.lowFareCalendar;
                var $datepicker     = $(_this.lowFareFromDpIdentifier);
                var url             = this.getFromLowFareCalendarCall();

                window.COMMON.Request.getJson(
                    url,
                    function(data) {
                        _this.availableDepartureDates = compactSearch.datePicker.getNormalizedDays(data.days);
                        _this.setPriceDataForDatepicker($datepicker, data);

                        // ... and set the customEvent to render the prices
                        $.datepicker._getInst($datepicker[0]).customEvent = _this.applyPricesToOriginCalendar;
                        $datepicker.datepicker('refresh');
                    },
                    function(data) {
                        compactSearch.handleCompactSearchError(data);
                    },
                    $datepicker
                );
            },

            /**
             *
             */
            updateToLowFareCalendar: function() {
                var compactSearch   = window.CMS.CompactSearch;
                var _this           = compactSearch.lowFareCalendar;
                var $datepicker     = $(_this.currentLowFareCalendar).find(_this.lowFareToDpIdentifier);
                var url             = this.getToLowFareCalendarCall();

                window.COMMON.Request.getJson(
                    url,
                    function(data) {
                        _this.availableReturnDates = compactSearch.datePicker.getNormalizedDays(data.days);
                        _this.setPriceDataForDatepicker($datepicker, data);

                        // ... and set the customEvent to render the prices
                        $.datepicker._getInst($datepicker[0]).customEvent = _this.applyPricesToDestinationCalendar;
                        $datepicker.datepicker('refresh');
                    },
                    function(data) {
                        compactSearch.handleCompactSearchError(data);
                    },
                    $datepicker
                );
            },

            /**
             * Initialize the origin calendar
             */
            initializeFromLowFareCalendar: function() {
                var compactSearch       = window.CMS.CompactSearch;
                var _this               = compactSearch.lowFareCalendar;
                var originPriceValue    = $(this.originJsonField).val();

                if (originPriceValue !== '') {
                    var originPriceData = $.parseJSON(originPriceValue);

                    _this.availableDepartureDates = compactSearch.datePicker.getNormalizedDays(originPriceData.days);
                    _this.setPriceDataForDatepicker($(_this.lowFareFromDpIdentifier), originPriceData);

                    //Show the datepicker so we have an object
                    _this.showFromDatepicker();
                    _this.addPricesToCalendars($(_this.lowFareFromDpIdentifier), 'from');

                    //get the datepicker ...
                    var datepicker = $(_this.currentLowFareCalendar).find(_this.lowFareFromDpIdentifier);
                    // ... and set the customEvent to render the prices
                    $.datepicker._getInst(datepicker[0]).customEvent = _this.applyPricesToOriginCalendar;
                } else {
                    _this.showFromDatepicker();
                }
            },

            /**
             * Initialize the destination calendar
             * @param $element
             */
            initializeToLowFareCalendar: function() {
                var compactSearch           = window.CMS.CompactSearch;
                var _this                   = compactSearch.lowFareCalendar;
                var destinationPriceValue   = $(this.destinationJsonField).val();

                if(destinationPriceValue !== '') {
                    var destinationPriceData = $.parseJSON(destinationPriceValue);

                    _this.availableReturnDates = compactSearch.datePicker.getNormalizedDays(destinationPriceData.days);
                    _this.setPriceDataForDatepicker($(_this.lowFareToDpIdentifier), destinationPriceData);

                    //Show the datepicker so we have an object
                    _this.showToDatepicker();
                    _this.addPricesToCalendars($(_this.lowFareToDpIdentifier), 'to');

                    //get the datepicker
                    var datepicker = $(_this.currentLowFareCalendar).find(_this.lowFareToDpIdentifier);
                    // ... and set the customEvent to render the prices
                    $.datepicker._getInst(datepicker[0]).customEvent = _this.applyPricesToDestinationCalendar;
                } else {
                    _this.showToDatepicker();
                }
            },

            /**
             * Renders the origin datepicker
             */
            showFromDatepicker: function() {
                var datepicker                  = window.CMS.Datepicker;
                var $lowFareCalendarFrom        = $(this.lowFareFromDpIdentifier);
                this.lowFareCalendarFromOptions = $.extend(this.lowFareCalendarFromOptions, datepicker.dpOptions);

                $lowFareCalendarFrom.datepicker(this.lowFareCalendarFromOptions);
                //$lowFareCalendarFrom.datepicker('setDate', $.datepicker.parseDate('dd.mm.y', $(this.originDateHiddenField).val()));

                datepicker.populateMonthList(this.lowFareFromDpIdentifier);
            },

            /**
             * Renders the destination datepicker
             */
            showToDatepicker: function() {
                var datepicker                  = window.CMS.Datepicker;
                var $lowFareCalendarTo          = $(this.lowFareToDpIdentifier);
                this.lowFareCalendarToOptions   = $.extend(this.lowFareCalendarToOptions, datepicker.dpOptions);

                $lowFareCalendarTo.datepicker(this.lowFareCalendarToOptions);
                //$lowFareCalendarTo.datepicker('setDate', $.datepicker.parseDate('dd.mm.y', $(this.destinationDateHiddenField).val()));
                datepicker.populateMonthList(this.lowFareToDpIdentifier);
            },

            /**
             * Bindings ...
             */
            bindings: {
                bindRefreshButton: function() {
                    var compactSearch   = window.CMS.CompactSearch;
                    var _this           = compactSearch.lowFareCalendar;

                    $(document).on('click', '.btn-refresh-low-fare-calendar', function(e) {
                        compactSearch.setCurrentCompactSearch($(this));
                        _this.setCurrentLowFareCalendar($(this));
                        compactSearch.datePicker.maximumBookingDate = new Date('2014-12-12');
                        _this.setDatesFromLowFareTextInput($(compactSearch.datePicker.dateName));
                        _this.updateFromLowFareCalendar();
                        _this.updateToLowFareCalendar();

                        e.preventDefault();
                        return false;
                    });
                },

                /**
                 * Events for the "return flight" checkbox
                 */
                checkBoxEvents: function() {
                    var _this = window.CMS.CompactSearch.lowFareCalendar;

                    $(document).on('checkboxEvent', '.noLowFareCalendarReturnFlight', function(e, value) {
                        _this.setCurrentLowFareCalendar($(this));
                        _this.toggleReturnFlightDatepicker(value);

                        if (!value) {
                            _this.currentLowFareCalendar.find('.destinationPrice').val(0);
                            _this.publishTotalPrice();
                        } else {
                            _this.getPriceForSelectedDestinationDate(_this.currentLowFareCalendar.find(_this.lowFareToDpIdentifier)[0].innerHTML);
                        }
                    });
                }
            },

            /**
             * Initializes the lowFareCalendar functionality
             */
            initialize: function() {
                var compactSearch   = window.CMS.CompactSearch;
                var _this           = compactSearch.lowFareCalendar;

                //@TODO localize
                $(compactSearch.datePicker.dateName).inputmask(
                    "mask", {
                        "mask": "d.m.99 - d.m.99",
                        showMaskOnFocus: false,
                        showMaskOnHover: false,
                        "placeholder": "TT.MM.JJ - TT.MM.JJ",
                        "oncleared": function () {
                            var _this = this;
                            setTimeout(function () {
                                $(_this).parents('.input-block').addClass('active');
                            }, 1)
                        }
                    }
                );

                $(this.lowFareContainerIdentifier).each(function() {
                    _this.currentLowFareCalendar = $(this);
                    compactSearch.setCurrentCompactSearch($(this));

                    _this.initializeFromLowFareCalendar();
                    _this.initializeToLowFareCalendar();
                    _this.currentLowFareCalendar.find('.btn-container').removeClass('hidden');
                });

                this.bindings.bindRefreshButton();
                this.bindings.checkBoxEvents();
            }
        },

        /**
         * Handles functionality for the "passengers" section
         */
        passengers: {
            $passengerInputBlock: $('.passengersText').parent(),

            adultNumber: 'li[data-type="adult"] .number',
            adultType: 'li[data-type="adult"] .type',
            allCalcAdultPlusButtons: 'li[data-type="adult"] .btn-calc-plus',
            allCalcAdultMinusButtons: 'li[data-type="adult"] .btn-calc-minus',

            childrenNumber: 'li[data-type="child"] .number',
            childrenType: 'li[data-type="child"] .type',
            allCalcChildrenPlusButtons: 'li[data-type="child"] .btn-calc-plus',
            allCalcChildrenMinusButtons: 'li[data-type="child"] .btn-calc-minus',

            infantsNumber: 'li[data-type="infant"] .number',
            infantsType: 'li[data-type="infant"] .type',
            allCalcInfantsPlusButtons: 'li[data-type="infant"] .btn-calc-plus',
            allCalcInfantsMinusButtons: 'li[data-type="infant"] .btn-calc-minus',

            passengersResult: '.result-passengers',
            passengersName: '.passengersText',

            totalAllowedPassengers: 9,
            validTextInput: [],

            /**
             * Returns all passengers
             * @returns {number}
             */
            getTotalPassengers: function() {
                return this.getAdults() + this.getChildren() + this.getInfants();
            },

            /**
             * Determines if total allowed passengers is reached
             * @returns {boolean}
             */
            isIncreaseAllowed: function() {
                return this.getTotalPassengers() < this.totalAllowedPassengers;
            },

            showMaxPassengersError: function() {
                $('.max-passengers').removeClass('hidden');
            },

            hideMaxPassengersError: function() {
                $('.max-passengers').addClass('hidden');
            },

            showInfantsError: function() {
                $('.max-infants').removeClass('hidden');
            },

            hideInfantsError: function() {
                $('.max-infants').addClass('hidden');
            },

            checkErrorTexts: function() {
                var adults = this.getAdults();
                var children = this.getChildren();
                var infants = this.getInfants();

                if (adults + children + infants >= this.totalAllowedPassengers) {
                    this.showMaxPassengersError();
                } else {
                    this.hideMaxPassengersError();
                }

                if (infants >= adults) {
                    this.showInfantsError();
                } else {
                    this.hideInfantsError();
                }
            },

            /**
             * Increases the adults-value
             */
            increaseAdults: function() {
                if (this.isIncreaseAllowed()) {
                    this.setAdults(this.getAdults() + 1);

                    this.populateAdults();
                    this.checkCalcButtons();
                    this.populatePassengerInput();
                }
            },

            /**
             * Decreases the adults-value
             */
            decreaseAdults: function() {
                var adults = this.getAdults();
                var infants = this.getInfants();

                if (adults > 1 && adults > infants) {
                    this.setAdults(adults - 1);

                    this.populateAdults();
                    this.checkCalcButtons();
                    this.populatePassengerInput();
                }
            },

            /**
             * Sets the adults-value
             * @param value
             */
            setAdults: function(value) {
                var compactSearch = window.CMS.CompactSearch;

                if (value + this.getChildren() + this.getInfants() <= this.totalAllowedPassengers && value > 0) {
                    this.validTextInput.push(true);
                    compactSearch.$currentCompactSearch.find('.passengersAdults').val(value);
                } else {
                    $().log('Sie haben zu viele Erwachsene angebeben!');
                    this.validTextInput.push(false);
                }

                this.checkErrorTexts();
            },

            /**
             * Returns the total adults from the currentCompactSearch adult hidden-input
             * @returns {*}
             */
            getAdults: function() {
                var compactSearch = window.CMS.CompactSearch;

                return parseInt(compactSearch.$currentCompactSearch.find('.passengersAdults').val());
            },

            /**
             * Increases the children-value
             */
            increaseChildren: function() {
                if (this.isIncreaseAllowed()) {
                    this.setChildren(this.getChildren() + 1);

                    this.populateChildren();
                    this.checkCalcButtons();
                    this.populatePassengerInput();
                }
            },

            /**
             * Decreases the children value
             */
            decreaseChildren: function() {
                var children = this.getChildren();

                if (children > 0) {
                    this.setChildren(children - 1);

                    this.populateChildren();
                    this.checkCalcButtons();
                    this.populatePassengerInput();
                }
            },

            /**
             * Sets the children value
             * @param value
             */
            setChildren: function(value) {
                var compactSearch = window.CMS.CompactSearch;

                if (value + this.getAdults() + this.getInfants() <= this.totalAllowedPassengers) {
                    compactSearch.$currentCompactSearch.find('.passengersChildren').val(value);
                    this.validTextInput.push(true);
                } else {
                    $().log('Sie haben zu viele Kinder angebeben!');
                    this.validTextInput.push(false);
                }

                this.checkErrorTexts();
            },

            /**
             * Returns the total children from the currentCompactSearch children hidden-input
             * @returns {*}
             */
            getChildren: function() {
                var compactSearch = window.CMS.CompactSearch;

                return parseInt(compactSearch.$currentCompactSearch.find('.passengersChildren').val());
            },

            /**
             * Increases the infant value
             */
            increaseInfants: function() {
                if (this.getInfants() < this.getAdults() && this.isIncreaseAllowed()) {
                    this.setInfants(this.getInfants() + 1);

                    this.populateInfants();
                    this.checkCalcButtons();
                    this.populatePassengerInput();
                }
            },

            /**
             * Decreases the infant value
             */
            decreaseInfants: function() {
                var infants = this.getInfants();

                if (infants > 0) {
                    this.setInfants(infants - 1);

                    this.populateInfants();
                    this.checkCalcButtons();
                    this.populatePassengerInput();
                }
            },

            /**
             * Sets the infant value
             * @param value
             */
            setInfants: function(value) {
                var compactSearch = window.CMS.CompactSearch;

                if (value <= this.getAdults() && value + this.getAdults() + this.getChildren() <= this.totalAllowedPassengers) {
                    compactSearch.$currentCompactSearch.find('.passengersInfants').val(value);
                    this.validTextInput.push(true);
                } else {
                    $().log('Sie haben zu viele Kleinkinder angebeben!');
                    this.validTextInput.push(false);
                }

                this.checkErrorTexts();
            },

            /**
             * Returns the total infants from the currentCompactSearch infants hidden-input
             * @returns {*}
             */
            getInfants: function() {
                var compactSearch = window.CMS.CompactSearch;

                return parseInt(compactSearch.$currentCompactSearch.find('.passengersInfants').val());
            },

            /**
             * Populates the passenger values in the current compact search
             */
            populatePassengers: function() {
                this.populateCalcWidget();
                this.populatePassengerInput();
            },

            /**
             * Populates only the text-input
             */
            populatePassengerInput: function() {
                var compactSearch = window.CMS.CompactSearch;
                var $passengerInput = compactSearch.$currentCompactSearch.find(this.passengersName);
                $passengerInput.val(
                    '' + this.getAdults() + this.getChildren() + this.getInfants()
                );
                $passengerInput.parent().addClass('active');
                $passengerInput.parent().removeClass('error');
            },

            /**
             * Populates the passenger calculation widget
             */
            populateCalcWidget: function() {
                this.populateAdults();
                this.populateChildren();
                this.populateInfants();
                this.checkCalcButtons();
            },

            /**
             * Populates the adults value in the current compact search
             */
            populateAdults: function() {
                var compactSearch = window.CMS.CompactSearch;
                var adultType = compactSearch.$currentCompactSearch.find(this.adultType);
                var adults = this.getAdults();

                adultType.children().addClass('hidden');
                if (adults > 1) {
                    adultType.find('.plural').removeClass('hidden');
                } else {
                    adultType.find('.singular').removeClass('hidden');
                }

                compactSearch.$currentCompactSearch.find(this.adultNumber).text(adults);
            },

            /**
             * Populates the children value in the current compact search
             */
            populateChildren: function() {
                var compactSearch = window.CMS.CompactSearch;
                var childrenType = compactSearch.$currentCompactSearch.find(this.childrenType);
                var children = this.getChildren();

                childrenType.children().addClass('hidden');
                if (children > 1 || children == 0) {
                    childrenType.find('.plural').removeClass('hidden');
                } else {
                    childrenType.find('.singular').removeClass('hidden');
                }

                compactSearch.$currentCompactSearch.find(this.childrenNumber).text(children);
            },

            /**
             * Populates the infants value in the current compact search
             */
            populateInfants: function() {
                var compactSearch = window.CMS.CompactSearch;
                var infantsType = compactSearch.$currentCompactSearch.find(this.infantsType);
                var infants = this.getInfants();

                infantsType.children().addClass('hidden');
                if (infants > 1 || infants == 0) {
                    infantsType.find('.plural').removeClass('hidden');
                } else {
                    infantsType.find('.singular').removeClass('hidden');
                }

                compactSearch.$currentCompactSearch.find(this.infantsNumber).text(infants);
            },

            /**
             * Checks all calculator buttons
             */
            checkCalcButtons: function() {
                this.checkTotalAdults();
                this.checkTotalChildren();
                this.checkTotalInfants();
            },

            /**
             * Checks the adult calculator buttons and enables or disables them accordingly
             */
            checkTotalAdults: function() {
                var compactSearch = window.CMS.CompactSearch;
                var totalAdultsReached = this.getAdults() >= this.totalAllowedPassengers;
                var minimumAdultsReached = this.getAdults() <= 1;
                var allCalcAdultPlusButtons = compactSearch.$currentCompactSearch.find(this.allCalcAdultPlusButtons);
                var allCalcAdultMinusButtons = compactSearch.$currentCompactSearch.find(this.allCalcAdultMinusButtons);

                if (totalAdultsReached || !this.isIncreaseAllowed()) {
                    allCalcAdultPlusButtons.addClass('disabled');
                } else {
                    allCalcAdultPlusButtons.removeClass('disabled');
                }

                if (minimumAdultsReached || this.getAdults() <= this.getInfants()) {
                    allCalcAdultMinusButtons.addClass('disabled');
                } else {
                    allCalcAdultMinusButtons.removeClass('disabled');
                }
            },

            /**
             * Checks the children calculator buttons and enables or disables them accordingly
             */
            checkTotalChildren: function() {
                var compactSearch = window.CMS.CompactSearch;
                var totalChildrenReached = this.getChildren() >= this.totalAllowedPassengers - 1;
                var minimumChildrenReached = this.getChildren() <= 0;
                var allCalcChildrenPlusButtons = compactSearch.$currentCompactSearch.find(this.allCalcChildrenPlusButtons);
                var allCalcChildrenMinusButtons = compactSearch.$currentCompactSearch.find(this.allCalcChildrenMinusButtons);

                if (totalChildrenReached || !this.isIncreaseAllowed()) {
                    allCalcChildrenPlusButtons.addClass('disabled');
                } else {
                    allCalcChildrenPlusButtons.removeClass('disabled');
                }

                if (minimumChildrenReached) {
                    allCalcChildrenMinusButtons.addClass('disabled');
                } else {
                    allCalcChildrenMinusButtons.removeClass('disabled');
                }
            },

            /**
             * Checks the infant calculator buttons and enables or disables them accordingly
             */
            checkTotalInfants: function() {
                var compactSearch = window.CMS.CompactSearch;
                var totalInfantsReached = this.getInfants() >= this.getAdults();
                var minimumInfantsReached = this.getInfants() <= 0;
                var allCalcInfantsPlusButtons = compactSearch.$currentCompactSearch.find(this.allCalcInfantsPlusButtons);
                var allCalcInfantsMinusButtons = compactSearch.$currentCompactSearch.find(this.allCalcInfantsMinusButtons);

                if (totalInfantsReached || !this.isIncreaseAllowed()) {
                    allCalcInfantsPlusButtons.addClass('disabled');
                } else {
                    allCalcInfantsPlusButtons.removeClass('disabled');
                }

                if (minimumInfantsReached) {
                    allCalcInfantsMinusButtons.addClass('disabled');
                } else {
                    allCalcInfantsMinusButtons.removeClass('disabled');
                }
            },

            /**
             * Reads data from given profile-element and applies it to the compact search
             * @param $element
             */
            applyTravelProfile: function($element) {
                this.setAdults($element.data('adults'));
                this.setChildren($element.data('children'));
                this.setInfants($element.data('infants'));

                this.populatePassengers();
            },

            /**
             * Resets the passenger inputs
             */
            resetPassengers: function() {
                var compactSearch = window.CMS.CompactSearch;
                this.setAdults(1);
                this.setChildren(0);
                this.setInfants(0);

                compactSearch.$currentCompactSearch.find(this.passengersName).val('');
                this.populateCalcWidget();
            },

            /**
             * Populates the passengers from the text input
             * @param $textInput
             */
            populatePassengersFromTextInput: function($textInput) {
                var unmaskedValue = $textInput.inputmask('unmaskedvalue');
                var adults = parseInt(unmaskedValue.charAt(0));
                var children = parseInt(unmaskedValue.charAt(1));
                var infants = parseInt(unmaskedValue.charAt(2));

                this.validTextInput = [];
                this.setAdults(adults);
                this.setChildren(children);
                this.setInfants(infants);

                if ($.inArray(false, this.validTextInput) == -1) {
                    $textInput.parent().removeClass('error');
                } else {
                    $textInput.parent().addClass('error');
                }

                this.populateCalcWidget();
            },

            bindings: {
                /**
                 * Events for the text-input
                 */
                passengerInputEvents: function() {
                    var compactSearch = window.CMS.CompactSearch;

                    if (compactSearch.passengers.$passengerInputBlock.length !== 0) {
                        compactSearch.passengers.$passengerInputBlock.find(compactSearch.passengers.passengersName).focus(function(e) {
                            compactSearch.setCurrentCompactSearch($(this));
                            compactSearch.activatePanel(compactSearch.passengers.passengersResult);
                        });

                        compactSearch.passengers.$passengerInputBlock.find(compactSearch.passengers.passengersName).on('keyup', function(e) {
                            var _this = this;
                            if ($().allowedInputKey(e)) {
                                $().inputTimer('clear');
                                $().inputTimer('setTimer', setTimeout(function() {
                                        compactSearch.setCurrentCompactSearch($(_this));
                                        compactSearch.passengers.populatePassengersFromTextInput($(_this));
                                    }, $().inputTimer('getTimeout')
                                ));
                            }
                        });

                        compactSearch.passengers.$passengerInputBlock.find(compactSearch.passengers.passengersName).on('blur', function(e) {
                            if($(this).val() == '') {
                                $(this).parents('.input-block').removeClass('active');
                            }
                        });

                        compactSearch.passengers.$passengerInputBlock.find('.btn-clear').click(function(e) {
                            compactSearch.setCurrentCompactSearch($(this));
                            compactSearch.passengers.resetPassengers();
                        });
                    }
                },

                /**
                 * Events for the Plus- and Minus-Buttons
                 */
                passengerCalcWidgetEvents: function() {
                    var compactSearch = window.CMS.CompactSearch;
                    var $passengerResult = $('.compact-search').find('.result-passengers');

                    $passengerResult.on('click', 'li[data-type="adult"] .btn-calc-plus', function() {
                        compactSearch.setCurrentCompactSearch($(this));
                        compactSearch.passengers.increaseAdults();
                    });

                    $passengerResult.on('click', 'li[data-type="adult"] .btn-calc-minus', function() {
                        compactSearch.setCurrentCompactSearch($(this));
                        compactSearch.passengers.decreaseAdults();
                    });

                    $passengerResult.on('click', 'li[data-type="child"] .btn-calc-plus', function() {
                        compactSearch.setCurrentCompactSearch($(this));
                        compactSearch.passengers.increaseChildren();
                    });

                    $passengerResult.on('click', 'li[data-type="child"] .btn-calc-minus', function() {
                        compactSearch.setCurrentCompactSearch($(this));
                        compactSearch.passengers.decreaseChildren();
                    });

                    $passengerResult.on('click', 'li[data-type="infant"] .btn-calc-plus', function() {
                        compactSearch.setCurrentCompactSearch($(this));
                        compactSearch.passengers.increaseInfants();
                    });

                    $passengerResult.on('click', 'li[data-type="infant"] .btn-calc-minus', function() {
                        compactSearch.setCurrentCompactSearch($(this));
                        compactSearch.passengers.decreaseInfants();
                    });
                },

                /**
                 * Events for the profile LI-Elements
                 */
                passengerProfileEvents: function() {
                    var compactSearch = window.CMS.CompactSearch;
                    if ($('.list-profiles').length !== 0) {
                        $('.compact-search').find('.list-profiles').on('click', 'li', function() {
                            compactSearch.setCurrentCompactSearch($(this));
                            compactSearch.passengers.applyTravelProfile($(this));
                        });
                    }
                }
            },

            /**
             * Initialises the passenger functionality in the compact search
             */
            initialize: function() {
                //mask the input field
                //@TODO localize
                $('.passengersText').inputmask(
                    "mask", {
                        "mask": "u Erw., c K\\in\\der, i Kle\\ink.",
                        showMaskOnFocus: false,
                        showMaskOnHover: false,
                        "placeholder": "0 Erw., 0 Kinder, 0 Kleink.",
                        "oncleared": function () {
                            var _this = this;
                            setTimeout(function () {
                                $(_this).parents('.input-block').addClass('active');
                            }, 1)
                        }
                    }
                );
                this.bindings.passengerInputEvents();
                this.bindings.passengerCalcWidgetEvents();
                this.bindings.passengerProfileEvents();
            }
        },

        /**
         * Bind initial events for the compact search
         */
        initialize: function() {
            this.bindings.focusOutEvents();

            this.origin.initialize();

            this.destination.initialize();

            this.daySelect.initialize();

            this.datePicker.initialize();

            this.weekPicker.initialize();

            this.lowFareCalendar.initialize();

            this.passengers.initialize();
        },

        /**
         * Triggers when DOM is loaded
         */
        domReady: function() {
            window.CMS.CompactSearch.initialize();
        }
    };

    $(document).ready(window.CMS.CompactSearch.domReady);

}(this, this.document, this.jQuery, this.define));
(function (window, document, $) {

    'use strict';

    window.CMS = window.CMS ? window.CMS : {};

    /**
     * Class for login functionality
     * @author simon.koch@denkwerk.com
     */
    window.CMS.Login = {

        $loginForm: $('.loginForm'),
        $loginLink: $('.loginLink'),
        $logoutLink: $('.logoutLink'),

        // Login check if successful or not
        loginCheck: function(data) {
            // If returned API data is correct
            if (data.length !== 0) {
                window.CMS.Login.loginSuccess(data);
            } else {
                window.CMS.Login.loginFail();
            }
        },

        // Login successful
        loginSuccess: function(data) {
        	// write JSON response to cookie
        	$.cookie('loginData', JSON.stringify(data));
            var redirect = this.$loginForm.data('redirecturl');
            if(redirect){
                // redirect to specific url if one is set
                // and add the success hash value to display success message
                window.location.href = redirect+'#!/login-success';
                //location.reload();
            }else{ // default
                // Reload page with success hash value
                // - to display success message after reload
                window.COMMON.Utility.setHashBang('login-success');
                location.reload();
            }
        },

        // Login failed
        // - if wrong credentials
        loginFail: function() {
            // Show warning group message for failed login
            window.COMMON.Warning.show('login-fail');
        },

        // Login error
        // - if service is not available
        loginError: function(data) {
            // Show warning group message for login error
            window.COMMON.Warning.show('login-error');
        },

        // Logout check if successful or not
        logoutCheck: function(data) {
            // If returned API data is correct
            if (data.length !== 0 && data[0]['logoutSuccessful'] === 'true') {
                window.CMS.Login.logoutSuccess(data);
            } else {
                window.CMS.Login.logoutFail();
            }
        },

        // Logout successful
        logoutSuccess: function(data) {
            // Reload page with success hash value
            // - to display success message after reload
            window.COMMON.Utility.setHashBang('logout-success');
            location.reload();
        },

        // Logout failed
        // - if wrong credentials
        logoutFail: function() {
            // Show alert message
            window.COMMON.Alert.show('logout-fail');
        },

        // Logout error
        // - if service is not available
        logoutError: function(data) {
            // Show alert message
            window.COMMON.Alert.show('logout-error');
        },

        // Bind function for login form
        bindForm: function() {
            var _this = this;

            // Toggle login flyout
            this.$loginForm.on('submit', function (e) {
                e.preventDefault();

                if (_this.$loginForm.valid()) {
                    var url = $(this).attr('action'),
                            $occupiedContainer = $(this),
                            data = $(this).serialize();

                    window.COMMON.Request.post(url, window.CMS.Login.loginCheck, window.CMS.Login.loginError, $occupiedContainer, data, 'json');
                }
            });

            // Login link
            // - Submits the login form (e.g. if login error is thrown
            this.$loginLink.on('click', function (e) {
                e.preventDefault();

                // Submits the login form
                _this.$loginForm.submit();
            });

            // Logout link
            this.$logoutLink.on('click', function (e) {
                e.preventDefault();

                var url = $(this).attr('href'),
                            $occupiedContainer = $(this);

                window.COMMON.Request.getJson(url, window.CMS.Login.logoutCheck, window.CMS.Login.logoutError, '');
            });
        },

        // Triggers when DOM is loaded
        domReady: function() {
            window.CMS.Login.bindForm();
        }
    };

    $(document).ready(window.CMS.Login.domReady);

}(this, this.document, this.jQuery));
(function (window, document, $, define, undef) {

    'use strict';

    window.CMS = window.CMS === undef ? {} : window.CMS;

    /**
     * Class for the custom germanwings datepicker
     * @author daniel.grobelny@denkwerk.com
     */
    window.CMS.Datepicker = {


        /**
         * General datepicker options
         */
        dpOptions: {
            //@TODO Lokalisierung
            dayNames: ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
            dayNamesShort: [ "So", "Mo", "Di", "Mi", "Do", "Fr", "Sa" ],
            dayNamesMin: ['So','Mo','Di','Mi','Do','Fr','Sa'],
            monthNames: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
            monthNamesShort: [ "Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez" ],
            weekHeader: 'KW',
            regional: 'de',
            firstDay: 1,
            minDate: new Date(),
            showOtherMonths: true,
            selectOtherMonths: true,
            dateFormat: "dd.mm.yy",
            altFormat: "dd.mm.yy"
        },

        bindings: {
            /**
             * Events for the month-list
             */
            otherMonthsEvents: function() {
                $(document).on('click', '.month-list span', function(e) {
                    $(this).parents('.hasDatepicker').removeClass('activeMonthList');
                    window.CMS.Datepicker.adjustShownMonth($(this));
                });
            },

            /**
             * Events for the datepicker title-bar (eg. "Februar 2014")
             */
            datePickerTitleEvents: function() {
                $(document).on('click', '.ui-datepicker-title', function(e) {
                    $(this).parents('.hasDatepicker').toggleClass('activeMonthList');
                });
            }
        },

        /**
         * Returns the parent-datepicker to the given element
         * @param $element
         * @returns {*}
         */
        getCurrentDatePicker: function($element) {
            return $element.parents('.hasDatepicker');
        },

        /**
         * Generates the clickable month-list for the given datepicker, logic had to be "kind of" copied from
         * original jquery datepicker implementation
         * @param currentDatepickerElement
         */
        populateMonthList: function(currentDatepickerElement) {
            var id = '#' + $(currentDatepickerElement).attr('id');
            var inst = $.datepicker._getInst($(id)[0]);
            var showCurrentAtPos = $.datepicker._get(inst, "showCurrentAtPos");
            var drawMonth = inst.drawMonth - showCurrentAtPos;
            var minDate = $.datepicker._getMinMaxDate(inst, "min");
            var maxDate = $.datepicker._getMinMaxDate(inst, "max");
            var drawYear = inst.drawYear;
            var shortenedYear = drawYear.toString().slice(-2);
            var monthNamesShort = $.datepicker._get(inst, "monthNamesShort");
            var month;
            var inMinYear = (minDate && minDate.getFullYear() === drawYear);
            var inMaxYear = (maxDate && maxDate.getFullYear() === drawYear);
            var result = '';

            result += '<div class="month-list">';

            for (month = 0; month < 12; month++) {
                if ((!inMinYear || month >= minDate.getMonth()) && (!inMaxYear || month <= maxDate.getMonth())) {
                    result += "<span class='monthListItem' data-month='" + month + "'" +
                        (month === drawMonth ? " class='selected'" : "") +
                        ">" + monthNamesShort[month] + " '" + shortenedYear + "</span>";
                }
            }

            result += '</div>';

            $(currentDatepickerElement).append(result);
        },

        /**
         * Shows the chosen month from the month-list in the datepicker
         * @param $element
         */
        adjustShownMonth: function($element) {
            var currentDatePicker = this.getCurrentDatePicker($element);
            var id = '#' + $(currentDatePicker).attr('id');
            var selectedMonth = this.getSelectedMonth(id);
            var chosenMonth = $element.data('month');
            var offset = chosenMonth - selectedMonth;

            $.datepicker._adjustDate(id, offset, 'M');
        },

        /**
         * Returns the selectedMonth from the given datepicker
         * @param id
         * @returns {Datepicker._newInst.selectedMonth|*|i._newInst.selectedMonth|d._newInst.selectedMonth|b._newInst.selectedMonth|selectedMonth}
         */
        getSelectedMonth: function(id) {
            var inst = $.datepicker._getInst($(id)[0]);

            return inst.selectedMonth;
        },

        /**
         * Returns the selectedYear from the given datepicker
         * @param id
         * @returns {Datepicker._newInst.selectedMonth|*|i._newInst.selectedMonth|d._newInst.selectedMonth|b._newInst.selectedMonth|selectedMonth}
         */
        getSelectedYear: function(id) {
            var inst = $.datepicker._getInst($(id)[0]);

            return inst.selectedYear;
        },

        /**
         * Refreshes the month-list
         * @param $element
         */
        refreshMonthList: function($element) {
            var currentDatepicker = this.getCurrentDatePicker($element);
            var currentDatePickerId = '#' + $(currentDatepicker).attr('id');
            //remove the current month list
            $(currentDatepicker).find('.month-list').remove();
            //populate new one
            this.populateMonthList(currentDatePickerId);
        },

        /**
         * Returns the first 'monday' of the past from the given date
         * @param date
         * @returns {Date}
         */
        getFirstDayOfTheWeek : function(date) {
            var dayOfTheWeek = date.getDay() == 0 ? 6 : date.getDay() - 1;
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() - dayOfTheWeek);
        },

        /**
         * Returns the first 'sunday' of the future from the given date
         * @param date
         * @returns {Date}
         */
        getLastDayOfTheWeek : function(date) {
            var dayOfTheWeek = date.getDay() == 0 ? 6 : date.getDay() - 1;
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() - dayOfTheWeek + 6);
        },

        /**
         * Bind initial events for all element functionality
         */
        initialize: function() {
            this.bindings.otherMonthsEvents();
            this.bindings.datePickerTitleEvents();
        },

        /**
         * Triggers when DOM is loaded
         */
        domReady: function() {
            window.CMS.Datepicker.initialize();
        }
    };

    $(document).ready(window.CMS.Datepicker.domReady);

}(this, this.document, this.jQuery, this.define));
(function (window, document, $, define, undef) {

    'use strict';

    window.CMS = window.CMS === undef ? {} : window.CMS;

    /**
     * Class for element specific functionality
     * @author daniel.grobelny@denkwerk.com
     */
    window.CMS.Events = {

        clickEventTriggerAttribute: '[data-trigger-event-click]',
        clickUpdateTriggerAttribute: '[data-trigger-update-click]',
        eventListenerAttribute: 'data-listen-to-event',
        updateListenerAttribute: 'data-listen-to-update',
        changeSubmitTriggerAttribute: '[data-trigger-submit-change]',

        setChangeSubmitTriggers: function() {
            $(document).on('click', '.input-checkbox' + this.changeSubmitTriggerAttribute, function(e) {
                $(this).parents('form').submit();
            });

            $(document).on('keypress', '.input-checkbox' + this.changeSubmitTriggerAttribute, function(e) {
                if (e.which == '32') {
                    $(this).parents('form').submit();
                }
            });

            $(document).on('click', '.input-select' + this.changeSubmitTriggerAttribute + ' .selection li', function (e) {
                $(this).parents('form').submit();
            });

            $(document).on('keydown', '.input-select' + this.changeSubmitTriggerAttribute + ' .selection li', function (e) {
                if ((e.which == '9')
                    || (e.which == '13')
                    || (e.which == '38')
                    || (e.which == '40')) {
                    $(this).parents('form').submit();
                }
            });

            $(document).on('keydown', '.input-select' + this.changeSubmitTriggerAttribute, function(e) {
                if ((e.which == '32') || (e.which == '13')) {
                    if(!$(this).hasClass('focus')) {
                        $(this).parents('form').submit();
                    }
                }

                if (e.which == '38') {
                    $(this).parents('form').submit();
                }

                if (e.which == '40') {
                    $(this).parents('form').submit();
                }
            });
        },

        /**
         * Sets up triggers for click events
         */
        setClickEventTriggers: function() {
            var _this = this;
            $(document).on('click', this.clickEventTriggerAttribute, function(e) {
                var eventName = $(e.target).data('triggerEventClick');
                _this.triggerEventListeners(eventName);
            });
        },

        /**
         * Sets up triggers for click updates
         */
        setClickUpdateTriggers: function() {
            var _this = this;
            $(document).on('click', this.clickUpdateTriggerAttribute, function(e) {
                var eventName = $(e.target).data('triggerUpdateClick');
                _this.triggerUpdateListeners(eventName);
            });
        },

        /**
         * This method is called if an "X-GWR-Function"-http-header is set for an ajax event.
         * The comma-separated list contains events, which will be triggered.
         * @param functionNames comma-separated string of function names
         */
        triggerResponseFunctions: function(functionNames) {
            var fnArr = functionNames.split(',');
            $.each(fnArr, function() {
                eval(this)();
            });
        },

        /**
         * Triggers all elements that have listeners applied to them
         * @param eventName
         */
        triggerEventListeners: function(eventName) {
            var _this = this;
            $('[' + this.eventListenerAttribute + '=' + eventName + ']').each(function() {
                 _this[eventName](this);
            });
        },

        refreshAlphabeticNav: function() {
            window.CMS.Filters.refreshAlphabeticNav();
        },

        /**
         * Triggers updates for all elements listening to the given events
         * @param triggerNames String, coma-separated list of triggers
         */
        triggerUpdateListeners: function(triggerNames) {
            var _this = this;
            var triggerNamesArray = triggerNames.split(',');

            $.each(triggerNamesArray, function(index, value) {
                $('[' + _this.updateListenerAttribute + '=' + $.trim(value) + ']').each(function() {
                    if ($(this).data('resultTargetReplace') == true) {
                        _this.replaceElement(this);
                    } else {
                        _this.updateElement(this);
                    }
                });
            });
        },

        /**
         * Update the content of the given element with the data from the request
         * @param element
         */
        updateElement: function(element) {
            var call = $(element).data('q');

            window.COMMON.Request.getHtml(
                call,
                function(data) {
                    $(element).html(data);
                },
                function(data) {
                    //@TODO error handling
                    $(element).html('<p>Error!</p>');
                },
                $(element)
            );
        },

        /**
         * Replace the given element with the data from the request
         * @param element
         */
        replaceElement: function(element) {
            var call = $(element).data('q');

            window.COMMON.Request.getHtml(
                call,
                function(data) {
                    $(element).replaceWith(data);
                },
                function(data) {
                    //@TODO error handling
                    $(element).html('<p>Error!</p>');
                },
                $(element)
            );
        },

        /**
         * Bind initial events for all element functionality
         */
        initialize: function() {
            this.setClickEventTriggers();
            this.setClickUpdateTriggers();
            this.setChangeSubmitTriggers();
        },

        /**
         * Triggers when DOM is loaded
         */
        domReady: function() {
            window.CMS.Events.initialize();
        }
    };

    $(document).ready(window.CMS.Events.domReady);

}(this, this.document, this.jQuery, this.define));
/**
 * Filter-Modul
 * 
 * classes:
 * "filter-module" (module)
 * "filter-results" (html-results-container)
 * "filter-items" on lists of filter-items (no select)
 * "js-filter-refresh" (filter-selects)
 * 
 * optional data-attributes
 * data-columns="[number]" on ".filter-module" (number of columns, default 2)
 * data-url="/myUrl" on ".filter-module" (url for request, default form-action)
 * data-type="html"  on ".filter-module" (html or json, default json)
 * data-filter="filter-name" on ul of select-field (if set list entries are filtered)
 * 
 * initial filling: html
 */






(function(window, document, $, define, undef) {

    'use strict';
    window.CMS = window.CMS === undef ? {} : window.CMS;
    /**
     * Class: filter-modules
     * 
     */
    window.CMS.Filters = {
        results: {},
        $element: {},
        initialize: function() {
            var _this = this;
            $('.filter-module').each(function() {

                /**
                 * Load initial data with request with dat-initial-json-url if data-type = json
                 */
                var $module = $(this),
                        url = $module.data('url') || $module.find('form').attr('action'),
                        dataType = $module.data('type') || 'json';
                if (dataType === 'json') {
                    window.COMMON.Request.getJson(url, function(data) {

                        // Parse string to json
                        if ($.type(data) === 'string') {
                            data = $.parseJSON(data);
                        }
                        _this.results = data;
                    }, '', '');
                }
            });
            this.bindEvents();
        },
        bindEvents: function() {
            var _this = this;
            $(document)

                    // Form submit on change select with ajaxform-class
                    .on('selectValueEvent checkboxEvent', '.js-filter-refresh', function() {
                        var $form = $(this).parents('.ajaxform');
                        $form.submit();
                    })
                    // Set alphabetic filter
                    .on('click', '.nav-alphabetic a', function(e) {
                        e.preventDefault();
                        var $module = $(this).parents('.filter-module');

                        // Excluding inactive letters
                        if ($(this).hasClass('active')) {
                            var filter = $(this).text().toUpperCase();
                            _this.filterResults($module, filter);
                        }

                        // Resetter
                        if ($(this).hasClass('show-all')) {
                            _this.createHtmlOnJsonResult(_this.results, $module);
                        }
                    })

                    // Form submit on change select-/input-value
                    .on('selectValueEvent checkboxEvent', '.js-filter-refresh', function() {
                        _this.refreshFilter(this);
                    })
                    //click on filter-btn fills hidden-field with data-value
                    .on('click', '.js-filter-refresh', function(e) {
                        e.preventDefault();
                        if(!$(this).hasClass('input-block')){
                            $(this).parents('.js-filter-items').find('input[type="hidden"]').val($(this).data('value'));
                            _this.refreshFilter(this);
                        }
                    })
                    .on('htmlCompleteEvent', function(e) {
                        _this.updateSort(e);
                        _this.updateFilter(_this.results, e);

                        // If carousel
                        window.CMS.Carousel.init();
                    })

        },
        refreshFilter: function(elem) {
            var _this = this,
                    $form = $(elem).parents('form'),
                    $module = $(elem).parents('.filter-module'),
                    url = $module.data('url') || $form.attr('action'),
                    dataType = $module.data('type') || 'json',
                    params = $form.serialize();
            url = _this.buildURL($form, url);

            // save on klick
            _this.$element = $(elem);

            // Get with callback
            if (dataType === 'html') {
                _this.getHTMLResults(url, params, $module);
            } else {
                _this.getJsonResults(url, params, $module);
            }
        },
        /**
         * Data request with optional parameter
         */
        getJsonResults: function(url, params, $module) {
            var _this = this;

            window.COMMON.Request.getJson(url, function(data) {
                // Parse string to json
                if ($.type(data) === 'string') {
                    data = $.parseJSON(data);
                }

                _this.results = data;
                _this.createHtmlOnJsonResult(data, $module);
                _this.refreshAlphabeticNav($module);

            }, '', '');
        },
        getHTMLResults: function(url, params, $module) {
            var _this = this;
            var $resultContainer = $module.find('.filter-results');
            window.COMMON.Request.getHtml(url, function(data) {

                _this.insertHTML($resultContainer, data);

            }, '', '');
        },
        /**
         *  Alphabetic filter
         */
        filterResults: function($module, filter) {
            var filteredData = [],
                    sortLetter;
            // >Parse string to json

            $.each(this.results, function(index, value) {
                sortLetter = value.initial;
                if (sortLetter.indexOf(filter) !== -1) {
                    filteredData.push(value);
                }
            });
            this.createHtmlOnJsonResult(filteredData, $module);
        },
        /**
         * Create html on json-result
         */
        createHtmlOnJsonResult: function(results, $module) {
            var contentArr = [],
                    contentHTML = '',
                    $pattern = $module.find(".pattern-content"),
                    itemHTML = $pattern.find('.filter-item').parent().html(),
                    separatorHTML = $pattern.find('.separator').parent().html(),
                    newItem = '',
                    columns = $module.data('columns') || 2,
                    htmlContainer = $module.find('.filter-results'),
                    subHeadlineLink = '',
                    subHeadline = '';

            // Create table rows
            $.each(results, function(index, value) {
                if (value.separator) {
                    subHeadline = value.label;

                    // build link if given
                    if (typeof value.link !== 'undefined') {
                        subHeadlineLink = value.link.target;
                    } else {
                        subHeadlineLink = '';
                    }
                    newItem = separatorHTML
                            .replace('###label###', subHeadline)
                            .replace('###linkTarget###', subHeadlineLink)
                } else {
                    newItem = itemHTML
                            .replace('###label###', value.label)
                            .replace('###price###', value.price)
                            .replace('###priceLabel###', value.priceLabel)
                            .replace('###linkTarget###', value.link.target)
                            .replace('###departure###', value.departure)
                            .replace('###initial###', value.initial)


                }
                contentArr.push(newItem);
            });

            contentHTML = this.createTables(contentArr, columns, $pattern, itemHTML);

            this.insertHTML(htmlContainer, contentHTML);

        },
        /*
         * Create a table with 1-3 columns
         */
        createTables: function(contentArr, columns, $pattern, itemHTML) {
            var contentHTML = '',
                    innerWrap = $pattern.find(".filter-item").parents('.row').html().replace(itemHTML, '###innerwrap###'),
                    outerWrap = '<div class="grid grid-2"><div class="row">###outerwrap###</div></div>',
                    count = contentArr.length,
                    numberOfElements = Math.ceil((count / columns)),
                    i = 0,
                    columnArr = [];
            // Build columns as array
            for (i; i < columns; i++) {
                var myArr = [];
                myArr = contentArr.slice(i * numberOfElements, (i + 1) * numberOfElements);
                columnArr.push(myArr);
            }
            $.each(columnArr, function(index, value) {
                // Rows from array to string
                var itemsToHtml = '';
                $.each(value, function(index, items) {

                    itemsToHtml += items;
                });

                // Roin rows as string
                contentHTML += innerWrap.replace('###innerwrap###', itemsToHtml);

            });

            return outerWrap
                    .replace('grid-2', 'grid-' + columns)
                    .replace('###outerwrap###', contentHTML);

        },
        /**
         * Insert html
         */
        insertHTML: function($elem, content) {
            $elem.empty().append(content).trigger('htmlCompleteEvent', $elem);
        },
        /**
         * Update navigation
         */
        refreshAlphabeticNav: function($module) {
            var glossary = [];
            // Read first letter of item-text
            $module.find('.filter-name').each(function() {
                var firstLetter = $(this).text().toUpperCase().replace('Ä', 'A').replace('Ö', 'O').replace('Ü', 'U');
                if ($.inArray(firstLetter, glossary) === -1) {
                    glossary.push(firstLetter);
                }
            });
            // Refresh navigation 
            $module.find('.nav-alphabetic a').each(function() {
                $(this).removeClass('active');
                if ($.inArray($(this).text().toUpperCase(), glossary) !== -1) {
                    $(this).addClass('active');
                }
            });


        },
        /*
         * Catch all filter values and build a dott-seperated string ('value.value.value')
         */
        buildURL: function($form, url) {
            var params = '',
                    extensionIndex = url.lastIndexOf('.'),
                    extension = url.slice(extensionIndex),
                    url = url.slice(0, extensionIndex),
                    selectedValue = '';

            // Select values
            $form.find('input').each(function() {
                if ($(this).attr('type') === 'checkbox' || $(this).attr('type') === 'radio') {
                    if ($(this).prop('checked')) {
                        selectedValue = $(this).val();
                    }
                } else {
                    selectedValue = $(this).val();
                }
                if (selectedValue.length > 0) {
                    params += '.' + selectedValue;
                }
                selectedValue = '';
            });
            // Complete url with params
            url = url + params + extension;
            return url;
        },
        updateSort: function(e) {
            var $lastRow, $firstRow;
            if ($(e.target).find('.separator').length !== 0) {
                $(e.target).find('.col').each(function() {
                    $lastRow = $(this).find('tr').last();
                    //if separator headline is last in list and not alone
                    if ($lastRow.hasClass('separator') && $lastRow.prev().hasClass('filter-item')) {
                        $lastRow.remove();
                        $(this).next().find('table').prepend($lastRow);
                    }
                    //if single list-item on top of column
                    $firstRow = $(this).find('tr').first();
                    if (!$firstRow.next().hasClass('filter-item') && !$firstRow.hasClass('separator')) {
                        $firstRow.remove();
                        $(this).prev().find('table').append($firstRow);
                    }
                });
            }
        },
        updateFilter: function(results, e) {
            var $module = $(e.target).parents('.filter-module'),
                    filterArr = [],
                    filterDataArr = [],
                    activeFilter = this.$element.find('ul[data-filter]').data('filter') || 'undefined',
                    $filterLists = $module.find('ul[data-filter]'),
                    $filterListElems = $filterLists.find('li[data-value]'),
                    filterValue;

            if ($module.find('[data-filter]').length !== 0) {
                //build Array of filter names
                $filterLists.each(function() {
                    filterArr.push($(this).data('filter'));
                });
                //build Array of filter data from Json
                $.each(filterArr, function(index, filter) {
                    $.each(results, function(index, value) {
                        if (typeof value[filter] !== 'undefined') {
                            filterDataArr.push(value[filter]);
                        }
                    });
                });
                $filterListElems.each(function() {
                    filterValue = $(this).data('value');
                    if (typeof filterValue !== 'undefined' && $.inArray(filterValue, filterDataArr) !== -1) {
                        $(this).removeClass('hidden');
                    } else if ($(this).parent('ul').data('filter') !== activeFilter) {
                        $(this).addClass('hidden');
                    }
                });
            }
        },
        /**
         * Triggers when DOM is loaded
         */
        domReady: function() {
            window.CMS.Filters.initialize();
        }
    };
    $(document).ready(window.CMS.Filters.domReady);
}(this, this.document, this.jQuery, this.define));

(function (window, document, $, undefined) {
    'use strict';

    $.widget('cms.promos', {
        options: {
            page: 1,
            itemsPerPage: 8,
            data: []
        },
        widgetEventPrefix: 'cms.promos:',
        results: {},

        _create: function () {
            this._cacheElements();
            this._bindEvents();
            this._super();
        },

        _cacheElements: function () {
            this._url = this.element.data('url');
            this._result = $('.promotion-result', this.element);
            this._filter = $('.promo-filter', this.element);
            this._tmpl = $('.result_tmpl', this.element)
            this._tmpl_subresult = $('.subresult_tmpl', this.element)
        },


        _bindEvents: function () {
            var self = this;
            $(document)
                .on('selectValueEvent checkboxEvent', '.js-promo-filter-refresh', function () {
                    var url = self._buildURL(self._url);
                    self._getJsonResults(url);
                })
                .on('selectValueEvent checkboxEvent', '.js-promo-order-refresh', function (event) {
                    $('#destination', self._filter).val($(event.currentTarget).data('destination'));
                    $('#origin', self._filter).val($(event.currentTarget).data('origin'));
                    var url = self._buildURL(self._url);
                    self._getJsonResults(url, $(event.currentTarget).closest('.toggle-content'));
                });
            this.element.on('click', '.nav-tabs li:not(.active)', function(event) {
                event.preventDefault();
                toggleActive($(event.currentTarget), self);
                var url = self._buildURL(self._url);
                self._getJsonResults(url);
            });
            this.element.on('cms.promos:jsonloaded', function (event, data) {
                event.preventDefault();
                self._createHtmlOnJsonResult(data);
                if(data.container === undefined) {
                    self._updateFilter(data);
                }
            });
        },

        _destroy: function () {
            this._super();
        },

        _setOption: function (key, value) {
            var self = this,
                prev = this.options[key],
                fnMap = {
                    serviceUrl: function () {
                        sync(self, 'GET');
                    },
                    data: function () {
                        paging(value, self);
                    }
                };
            this._super(key, value);
            if (key in fnMap) {
                fnMap[key]();
                this._triggerOptionChanged(key, prev, value);
            }
        },

        _triggerOptionChanged: function (optionKey, previousValue, currentValue) {
            this._trigger('setOption', {
                type: 'setOption'
            }, {
                option: optionKey,
                previous: previousValue,
                current: currentValue
            });
        },

        _buildURL: function (url) {
            var self = this,
                suffix = '',
                selectedName,
                $priceRange = $('.nav-tabs li.active', self._filter),
                selectedValue;

            // Select values
            $('.input-select input', self.element).each(function () {
                selectedName = $(this).attr('name');
                selectedValue = $(this).val();
                if (selectedValue.length > 0) {
                    suffix += '/' + selectedName + "=" + selectedValue;
                }
            });
            if($priceRange.length > 0) {
                var priceFrom = $priceRange.data('value-from'),
                    priceTo = $priceRange.data('value-to');
                if(priceFrom !== undefined && priceFrom !== "") {
                    suffix += '/price_from=' + $priceRange.data('value-from');
                }
                if(priceTo !== undefined && priceTo !== "") {
                    suffix += '/price_to=' + $priceRange.data('value-to');
                }
            }
            // Complete url with suffix
            url = url + suffix;
            return url;
        },
        _getJsonResults: function (url, $container) {
            var self = this;

            window.COMMON.Request.getJson(url, function (data) {
                // Parse string to json
                if ($.type(data) === 'string') {
                    data = $.parseJSON(data);
                }
                self._trigger('jsonLoaded', {
                    type: 'jsonLoaded'
                }, {
                    results: data,
                    container: $container
                });
            }, '', '');
        },
        _createHtmlOnJsonResult: function (data) {
            var self = this,
                items = [];
            if(data.container !== undefined) {
                $.each(data.results.promoModel, function(item) {
                   items = data.results.promoModel[item][0]['items'];
                });
                $('.subresult', data.container).html(tmpl(self._tmpl_subresult.html(), { items: items}));
            } else {
                self._result.html(tmpl(self._tmpl.html(), data.results));
            }
        },
        _updateFilter: function (data) {
            var self = this,
                filterObj = (data.results.filter || {});

            $('ul.selection', self._filter).each(function () {
                var filter = $(this).data('filter');
                $('li', $(this)).each(function () {
                    var value = $(this).data('value');
                    if(filterObj[filter] !== undefined && filterObj[filter][value] !== undefined) {
                        $(this).removeClass('hidden');
                    } else {
                        $(this).addClass('hidden');
                    }
                });

            });
        }
    });

    function toggleActive($elem, $widget) {
        $('li.active', $widget._filter).removeClass('active');
        $elem.addClass('active');
    }

    var cache = {};
    function tmpl(str, data){
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        var fn = !/\W/.test(str) ?
            cache[str] = cache[str] ||
                tmpl($(str).html()) :

            // Generate a reusable function that will serve as a template
            // generator (and which will be cached).
            new Function("obj",
                    "var p=[],print=function(){p.push.apply(p,arguments);};" +

                    // Introduce the data as local variables using with(){}
                    "with(obj){p.push('" +

                    // Convert the template into pure JavaScript
                    str
                        .replace(/[\r\t\n]/g, " ")
                        .split("<!!").join("\t")
                        .replace(/((^|!!>)[^\t]*)'/g, "$1\r")
                        .replace(/\t=(.*?)!!>/g, "',$1,'")
                        .split("\t").join("');")
                        .split("!!>").join("p.push('")
                        .split("\r").join("\\'")
                    + "');}return p.join('');");

        // Provide some basic currying to the user
        return data ? fn( data ) : fn;
    }

    $(function ($) {
        $('.promo-module').promos();
    });
})(this, this.document, this.jQuery);

(function (window, document, $, define, undef) {

    'use strict';

    window.CMS = window.CMS === undef ? {} : window.CMS;

    /**
     * Class for element specific functionality
     * @author daniel.grobelny@denkwerk.com
     */
    window.CMS.Autosuggest = {

        autoSuggestAttribute: '[data-autosuggest]',

        bindAutoSuggest: function() {
            var _this = this;
            $(document).on('keyup', this.autoSuggestAttribute, function(e) {
                var inputValue = e.target.value;
                var call = $(e.target).data('autosuggest');
                var data = { suggest: inputValue };

                if (inputValue.length > 2 && e.which != 27) {
                    $().inputTimer('clear');
                    $().inputTimer('setTimer', setTimeout(function() {
                            window.COMMON.Request.post(
                                call,
                                function(data) {
                                    _this.showSuggestFlyout(data, e.target);
                                },
                                function(data) {
                                    $().log(data);
                                },
                                $('#resultTarget'),
                                data
                            );
                        }, $().inputTimer('getTimeout')
                    ));
                } else {
                    $('.suggestFlyout').remove();
                }
            });

            $(document).on('click', function(e) {
                var $parent = $(e.target).parents('.input-text').find('.suggestFlyout');
                var $autoSuggestContainer = $(e.target).parents('.suggestFlyout');

                if ($autoSuggestContainer.length == 0 && $parent.length == 0) {
                    $('.suggestFlyout').remove();
                }
            });
        },

        showSuggestFlyout: function(data, element) {
            var flyoutContainer = '<div class="suggestFlyout">' + data + '</div>';

            $(element).parent().append(flyoutContainer);
        },

        /**
         * Bind initial events for all element functionality
         */
        initialize: function() {
            this.bindAutoSuggest();
        },

        /**
         * Triggers when DOM is loaded
         */
        domReady: function() {
            window.CMS.Autosuggest.initialize();
        }
    };

    $(document).ready(window.CMS.Autosuggest.domReady);

}(this, this.document, this.jQuery, this.define));
(function (window, document, $, define, undef) {

    'use strict';

    window.CMS = window.CMS === undef ? {} : window.CMS;

    /**
     * Class for header-functionality
     * @author simon.koch@denkwerk.com
     */
    window.CMS.Header = {

        $toggles: $('[data-toggle]'),
        $meta: $('.header-meta'),
        $flyoutClose: $('[data-close="header-flyout"]'),
        showFlyoutClassPrefix: 'show-flyout-',

        // Show header flyout
        showFlyout: function(key, className) {
            // Hide previous flyout
            this.hidePreviousFlyout();

            // Add CSS class to show flyout
            this.$meta.addClass(className);

            // Add flyout key via data object to define open flyout
            this.$meta.data('flyout', key);
        },

        // Hide header flyout
        hideFlyout: function(key, className) {
            this.$meta.removeClass(className);
            this.$meta.removeAttr('data', 'flyout');
        },

        // Check for previous active flyout and hide it
        hidePreviousFlyout: function() {
            var activeFlyoutKey = this.getActiveFlyoutKey();
            var activeFlyoutClassName = this.getActiveFlyoutClassName(activeFlyoutKey);

            this.$meta.removeClass(activeFlyoutClassName);
        },

        // Close active header flyout
        closeActiveFlyout: function() {
            var activeFlyoutKey = this.getActiveFlyoutKey();
            var activeFlyoutClassName = this.getActiveFlyoutClassName(activeFlyoutKey);

            this.hideFlyout(activeFlyoutKey, activeFlyoutClassName);
        },

        // Returns active flyout key
        getActiveFlyoutKey: function() {
            return this.$meta.data('flyout');
        },

        // Returns active flyout class
        getActiveFlyoutClassName: function(activeFlyoutKey) {
            return [this.showFlyoutClassPrefix, activeFlyoutKey].join('');
        },

        // Toggle function for header search form
        toggleFlyout: function(key) {
            var flyoutClassName = [this.showFlyoutClassPrefix, key].join('');

            // If flyout is already toggled
            if (this.$meta.hasClass(flyoutClassName)) {
                this.hideFlyout(key, flyoutClassName);
            } else {
                this.showFlyout(key, flyoutClassName);
            }
        },

        // Bind function for meta header flyout
        bindFlyout: function() {
            // Toggle flyout binding
            this.$toggles.on('click', function (e) {
                e.preventDefault();

                window.CMS.Header.toggleFlyout($(this).data('toggle'));
            });

            // Close flyout binding
            this.$flyoutClose.on('click', function (e) {
                e.preventDefault();

                window.CMS.Header.closeActiveFlyout();
            });
        },

        // Triggers when DOM is loaded
        domReady: function() {
            window.CMS.Header.bindFlyout();
        }
    };

    $(document).ready(window.CMS.Header.domReady);

}(this, this.document, this.jQuery, this.define));
(function (window, document, $, undef) {

    'use strict';

    /**
     * private newsletter
     */
    var inputMaskTimeout,
        $newsletterBirthdayInput = $('#newsletter-birthday');

    var customTimeout = function () {
        window.clearTimeout(inputMaskTimeout);

        $newsletterBirthdayInput.parents('.input-block').addClass('active');
    };

    var onCleared = function () {
        inputMaskTimeout = window.setTimeout(customTimeout, 1);
    };

    var setBirthdayInputMask = function () {
        var inputMaskSettings = {
            mask: 'd.m.9999',
            showMaskOnFocus: false,
            showMaskOnHover: false,
            placeholder: 'TT.MM.JJJJ',
            oncleared: onCleared
        };

        $newsletterBirthdayInput.inputmask('mask', inputMaskSettings);
    };

    var onDOMReady = function () {
        setBirthdayInputMask();
    };

    $(onDOMReady);

} (this, this.document, this.jQuery));
(function (window, document, $, undef) {

    'use strict';

    var onNewsFlashSubmit = function (event) {
        event.preventDefault();

        if (!$(event.currentTarget).valid()) { return false; }

        $('.newsflashForm').removeClass('hidden');
    };

    var onDOMReady = function () {
        $('.preNewsflashForm').on('submit', onNewsFlashSubmit);
    };

    $(onDOMReady);

} (this, this.document, this.jQuery));
(function(window, document, $, define, undef) {

    'use strict';
    window.CMS = window.CMS === undef ? {} : window.CMS;
    
    window.CMS.tariffAdvisor = {
        answers: [],
        $element: $('#tariff-advisor'),
        showFareInfoPopupDialog: function(elementClass, title) {
            $('.' + elementClass).dialog({
                dialogClass: 'gw-dialog',
                title: title,
                width: 'auto',
                minHeight: 0,
                resizable: false,
                modal: true
            });
        },
        switchToSlide: function(slideId) {
            $('.start, .question, .result, .tariff-advisor-ibe', this.$element).hide();
            $('#slide' + slideId, this.$element).show();
        },
        validateAnswers: function() {
            var basicCount = 0,
                    smartCount = 0,
                    bestCount = 0,
                    result = '';
            for (var i = 0; i < 8; i++) {
                for (var j = 0; j < this.answers[i].length; j++) {
                    if (this.answers[i][j] === 'ba') {
                        basicCount++;
                    } else if (this.answers[i][j] === 'sm') {
                        smartCount++;
                    } else if (this.answers[i][j] === 'be') {
                        bestCount++;
                    }
                }
            }

            if (basicCount > smartCount && basicCount > bestCount) {
                result = 'result-basic';
            } else if (smartCount > basicCount && smartCount > bestCount) {
                result = 'result-smart';
            } else if (bestCount > basicCount && bestCount > smartCount) {
                result = 'result-best';
            } else if (bestCount === basicCount && bestCount === smartCount) {
                result = 'result-best';
            } else if (bestCount === smartCount) {
                result = 'result-best';
            } else if (basicCount === smartCount) {
                result = 'result-smart';
            }
            return result;
        },
        bindEvents: function() {

            var _this = this,
                 $element = this.$element;
            $element
                .on('click', '.btn_go, .start', function(){
                    _this.switchToSlide(2);
                })
                .on('click', '.question a, .fare-switch, .info', function(event) {
                    event.preventDefault();
                })
                .on('click', '.btn_basic-fare', function() {
                    $('.result').removeClass('result-smart').removeClass('result-best').addClass('result-basic');
                })
                .on('click', '.btn_smart-fare', function() {
                    $('.result').removeClass('result-basic').removeClass('result-best').addClass('result-smart');
                })
                .on('click', '.btn_best-fare', function() {
                    $('.result').removeClass('result-basic').removeClass('result-smart').addClass('result-best');
                })
                .on('click', '.btn_back', function() {
                    var slideNo = $(this).parent().parent().attr('id').slice(5);
                    $(this).parent().parent().hide();
                    $('#slide' + (slideNo - 1)).show();
                })
                .on('click', '.answer', function() {
                    var slideNo = parseInt($(this).parent().parent().attr('id').slice(5));
                    $(this).parent().parent().hide();
                    $('#slide' + (slideNo + 1)).show();
                })
                .on('click', '.result .btn_fluege-suchen').click(function() {
                    window.location.href = fareadvisor_search_url;
                })
                .on('click', '.answer').click(function() {
                    var tariffs = $(this).attr('data-tariff').split(',');
                    //console.log('Tarif(e): ' + tariffs);
                })
                .on('click', '.info').click(function(event) {
                    event.preventDefault();
                    var fare = $(this).attr('data-fare');
                    _this.showFareInfoPopupDialog(fare + 'InfoDialog');
                })
                .on('click', '.question1 .answer', function() {
                    _this.answers[0] = $(this).attr('data-tariff').split(',');
                })
                .on('click', '.question2 .answer', function() {
                    _this.answers[1] = $(this).attr('data-tariff').split(',');
                })
                .on('click', '.question3 .answer', function() {
                    _this.answers[2] = $(this).attr('data-tariff').split(',');
                })
               .on('click', '.question4 .answer', function() {
                    _this.answers[3] = $(this).attr('data-tariff').split(',');
                })
                .on('click', '.question5 .answer', function() {
                    _this.answers[4] = $(this).attr('data-tariff').split(',');
                })
                .on('click', '.question6 .answer', function() {
                    _this.answers[5] = $(this).attr('data-tariff').split(',');
                })
                .on('click', '.question7 .answer', function() {
                    _this.answers[6] = $(this).attr('data-tariff').split(',');
                })
                .on('click', '.question8 .answer', function() {
                    _this.answers[7] = $(this).attr('data-tariff').split(',');
                    var result = _this.validateAnswers();
                    $('.result').removeClass('result-basic').addClass(result);
                    //$('.result' ).addClass(result);
                });

        },
        initialize: function() {
            this.bindEvents();
        },
        domReady: function() {
            window.CMS.tariffAdvisor.initialize();
        }
    };
    $(document).ready(window.CMS.tariffAdvisor.domReady);
}(this, this.document, this.$, this.define));


(function (window, document, $, define, undef) {

    'use strict';

    window.CMS = window.CMS === undef ? {} : window.CMS;

    /**
     * Class for flight monitor functionality
     * @author marc.oltmanns@diepartments.de
     */
    window.CMS.Flightmonitor = {

        // settings
        $monitor : {},
        $overlays: {},
        $toggles: {},
        $overlayClose: {},
        activeOverlay: null,
        activeToggle: null,

        // initialize
        init: function() {

            var _this = this;

            // selectors
            this.$monitor = $('[data-flightmonitor]').first();
            if(!_this.$monitor.length) return;
            this.$overlays = this.$monitor.find('.flight-monitor-overlay');
            this.$toggles = this.$monitor.find('.icon-arrow-link');
            this.$overlayClose = this.$monitor.find('[data-overlay-close]');

            // event binding
            this.bindEvents();

        },

        /*
         * hide Overlay
         */
        hideOverlay: function(el){

            el.hide();
            this.activeOverlay = null;

        },

        /*
         * show Overlay
         */
        showOverlay: function(el){

            el.show();
            this.activeOverlay = el;

        },

        /*
         * activate toggle
         */
        activateToggle: function(el){

            el.parent().addClass('active');
            this.activeToggle = el;

        },

        /*
         * deactivate toggle
         */
        deactivateToggle: function(el){

            el.parent().removeClass('active');
            this.activeToggle = false;

        },

        getOverlayFromToggle: function(toggle){

            var key = toggle.data('container');
            return window.CMS.Flightmonitor.$overlays.filter("[data-name="+key+"]");

        },

        /*
         * on Close Click
         */
        onCloseClick: function(e){
            e.preventDefault();

            var _this = window.CMS.Flightmonitor;

            _this.hideOverlay(_this.activeOverlay);
            _this.deactivateToggle(_this.activeToggle);

        },

        /*
         * on Toggle Click
         */
        onToggleClick: function(e){

            e.preventDefault();
            var _this = window.CMS.Flightmonitor,
                $el = $(e.currentTarget);

            if($el.is(_this.activeToggle)){ // self active

                _this.deactivateToggle($el);
                _this.hideOverlay(_this.activeOverlay);

            }else{ // not self active => we have to activate one

                if(_this.activeToggle){ // other is active

                    // hide/deactivate current actives
                    _this.hideOverlay(_this.activeOverlay);
                    _this.deactivateToggle(_this.activeToggle);

                }

                // activate new
                _this.activateToggle($el);
                _this.showOverlay(_this.getOverlayFromToggle($el));

            }

        },

        /*
         * bind events
         */
        bindEvents: function(){

            // navigation
            this.$toggles.on('click', this.onToggleClick);
            // close button
            this.$overlayClose.on('click', this.onCloseClick);

        },

        // Triggers when DOM is loaded
        domReady: function() {
            window.CMS.Flightmonitor.init();
        }
    };

    $(document).ready(window.CMS.Flightmonitor.domReady);

}(this, this.document, this.jQuery, this.define));

(function (window, document, $, define, undef) {

    'use strict';

    window.CMS = window.CMS === undef ? {} : window.CMS;

    /**
     * Class for carousel functionality
     * @author marc.oltmanns@diepartments.de
     */
    window.CMS.Carousel = {

        // settings
        carouselSel: '.carousel',
        itemWrapperClass : '.carousel-inner-wrap',
        nextBtnClass : '.carousel-next', // can also be set via data attribute (data-next-class=".class")
        prevBtnClass : '.carousel-prev', // can also be set via data attribute (data-prev-class=".class")
        startItemClass : '.start-item',  // class for first slider-item (optional in markup)
        activeItemClass : 'current-item',
        paginationHTML : '<nav class="carousel-pagination font-light"></nav>',
        // slider defaults
        defaults: {
            slideSpeed : 1000,
            autoDuration : false, // false = deactivated
            showPagination : false,
            showSlideCounter : false,
            continuous: true
        },
        swipes : [],

        // initialize Carousel
        init: function() {

            var _this = this;

            // init each carousel
            $(_this.carouselSel).each(function(i, obj){
                if($(obj).data('swipe')) return;
                var slidesWrapper = $(obj).find(_this.itemWrapperClass),
                    slides = $(obj).find( _this.itemWrapperClass).children(),
                    parent = $(obj).parent(), // .carousel-wrappers

                    // specific carousel options
                    startSlideObj = _this.getStartSlide(slides),
                    startSlide = startSlideObj.index(),
                    // Sliding Speed
                    slideSpeed = $(obj).data('slide-speed') ? $(obj).data('slide-speed') : _this.defaults.slideSpeed,
                    // pause duration
                    autoDuration = $(obj).data('auto-duration') ? $(obj).data('auto-duration') : _this.defaults.autoDuration,
                    continuous = $(obj).data('continuous') == false ? false : true,
                    // show pagination (pagination placed in prev/next-buttons)
                    showPagination = $(obj).data('show-pagination') ? $(obj).data('show-pagination') : _this.defaults.showPagination,
                    // show slide couter (z.B. "2/5")
                    showSlideCounter = $(obj).data('show-slidecounter') ? $(obj).data('show-slidecounter') : _this.defaults.showSlideCounter,
                    // next button class
                    nextBtnClass = $(obj).data('next-class') ? $(obj).data('next-class') : _this.nextBtnClass,
                    // prev button class
                    prevBtnClass = $(obj).data('prev-class') ? $(obj).data('prev-class') : _this.prevBtnClass,

                    pagination = $(_this.paginationHTML),
                    pagString = '';
                // for each slide
                slides.each(function(i, obj){

                    // set slide id - bc plugin functionality in this part is buggy
                    $(obj).attr('data-id', i);

                    // pagination string
                    if (showPagination){
                        if(i != 0){
                            pagString += ' <span class="separator-line">|</span>'
                        }
                        pagString += (i == startSlide) ? ('<a class="active current" data-id="'+i+'">'+(i+1)+'</a>') : ('<a class="active" data-id="'+i+'">'+(i+1)+'</a>');
                    }
                })

                // set active class to startItem
                _this.setActiveState(_this.getStartSlide(slides));

                // append pagination
                if(showPagination){
                    pagination.append(pagString);
                }

                // slides counter?
                if(showSlideCounter) _this.initSlideCounter(parent, slides, startSlide);

                // init each slide
                //if(showPagination) _this.initPagination(slides, pagination);

                // init carousel tool
                var swipe = new Swipe(obj, {
                    startSlide: startSlide,
                    auto: autoDuration,
                    continuous: continuous,
                    speed: slideSpeed,
                    // disableScroll: true,
                    // stopPropagation: true,

                     callback: function(index, element) { // runs on slide change
                         // "index" not equals "data-id"

                         // remove all active classes
                         _this.removeActiveState(slidesWrapper.children());
                         // add active class to new current item
                         _this.setActiveState($(element));

                         // get current slide id
                         var id = $(element).data('id');

                         // update slide counter
                         if(showSlideCounter) _this.updateSlideCounter(parent.find('.slides-counter .count'), id + 1);

                         // update pagination
                         if(showPagination) _this.updatePagination(parent, id)

                         // fire change event
                         $(obj).trigger('carouselChange', element);

                     }
                    // transitionEnd: function(index, element) {}
                });

                // bind api to carousel DOM node
                $(obj).data('swipe', swipe);

                // bind next
                _this.bindNext($(obj).data('swipe'), nextBtnClass, parent, pagination, showPagination);
                // bind prev
                _this.bindPrev($(obj).data('swipe'), prevBtnClass, parent, pagination, showPagination);

                // pagination click events
                if(showPagination){
                    parent.find('.carousel-pagination a').on('click', function(e){
                        e.preventDefault();
                        e.stopPropagation();
                        $(obj).data('swipe').slide($(this).data('id'))
                    })
                }

            })

        },

        /*
         *  set active state
         */
        setActiveState: function(el){
            el.addClass(this.activeItemClass);
        },

        /*
         *  remove active state
         */
        removeActiveState: function(el){
            el.removeClass(this.activeItemClass);
        },

        /*
         * get start slide
         */
        getStartSlide: function(slides){

            var start = slides.filter(this.startItemClass),
                // get item with "start-class" or first item
                startItem = start.length ? start : slides.first();

            return startItem
        },


        /*
         * append Pagination
         */
        appendPagination: function(parent, pagination){

            parent.append(pagination);

        },

        /*
         * initialize Pagination
         */
        updatePagination : function(parent, id){

            var paginations = parent.find('.carousel-pagination'),
                items = paginations.find('a'),
                // find new pagination item to activate
                newCurrent = items.filter(":nth-of-type("+(id+1)+")"),
                activeClass = 'current';

            // switch active state
            items.removeClass(activeClass);
            newCurrent.addClass(activeClass);

        },

        /*
         * initialize Slide Counter
         */
        initSlideCounter : function(parent, slides, start){

            var startcount = start + 1;
            parent.append('<div class="slides-counter"><span class="count">'+startcount+'</span>/<span class="total">'+slides.length+'</span></div>');

        },

        /*
         * update Slide Counter
         */
        updateSlideCounter : function(counter, count){

            counter.text(count);

        },

        /*
         * bind next button
         */
        bindNext: function(api, nextBtnClass, parent, pagination, showPagination){

            var el = parent.find(nextBtnClass);
            el.on('click', function(e){
                e.preventDefault();
                api.next();
            })
            if(showPagination){
                el.append(pagination.clone());
            }

        },

        /*
         * bind prev button
         */
        bindPrev: function(api, prevBtnClass, parent, pagination, showPagination){

            var el = parent.find(prevBtnClass);
            el.on('click', function(e){
                e.preventDefault();
                api.prev();
            })
            if(showPagination){
                el.append(pagination.clone());
            }

        },

        // Triggers when DOM is loaded
        domReady: function() {
            window.CMS.Carousel.init();
        }
    };

    $(document).ready(window.CMS.Carousel.domReady);

}(this, this.document, this.jQuery, this.define));

(function (window, document, $, define, undef) {

    'use strict';

    window.CMS = window.CMS === undef ? {} : window.CMS;

    /**
     * Class for counter functionality
     * @author marc.oltmanns@diepartments.de
     */
    window.CMS.Countdown = {

        // settings
        $Countdown : {},
        $dayItem : {},
        $hourItem : {},
        $minItem : {},
        $secItem : {},
        remainDuration : 0, // remaining time in milliseconds

        // initialize Countdown
        init: function() {

            var _this = this;

            // selectors
            this.$Countdown = $('[data-countdown]').first();
            if(!_this.$Countdown.length) return;
            this.$dayItem = _this.$Countdown.find('[data-day]');
            this.$hourItem = _this.$Countdown.find('[data-hour]');
            this.$minItem = _this.$Countdown.find('[data-min]');
            this.$secItem = _this.$Countdown.find('[data-sec]');

            this.remainDuration = this.getStartDuration();
            if(this.remainDuration <= 0) return;

            // set interval (1 second)
            setInterval(_this.doCount, 1000);

            // first count
            _this.doCount();

        },

        /*
         *  do Count
         */
        doCount: function(){
            var _this = window.CMS.Countdown,
                rest = _this.remainDuration,
            // calculate time values
            // days
                days = Math.floor(rest / (24*60*60*1000)),
                dmodulo = rest % (24*60*60*1000),
            // hours
                hours = Math.floor(dmodulo/(60*60*1000)),
                hmodulo = dmodulo % (60*60*1000),
            // minutes
                mins = Math.floor(hmodulo/(60*1000)),
                mmodulo = hmodulo % (60*1000),
            // seconds
                secs = Math.floor(mmodulo/(1000)),
                smodulo = mmodulo % (1000);

            // format values (leading null if < 9)
            days = days > 9 ? days : '0'+days;
            secs = secs > 9 ? secs : '0'+secs;
            mins = mins > 9 ? mins : '0'+mins;
            hours = hours > 9 ? hours : '0'+hours;

            // change values in markup
            _this.$dayItem.text(days);
            _this.$hourItem.text(hours);
            _this.$minItem.text(mins);
            _this.$secItem.text(secs);

            // reduce remaining time
            _this.remainDuration = rest - 1000;

            // reload page after Countdown
            if(_this.remainDuration <= 0) _this.onAfterCountdown();
        },

        /*
         * get start countdown duration (in milliseconds)
         */
        getStartDuration: function(){

//            var d = this.$dayItem.length ? this.$dayItem.text() * (24*60*60*1000) : 0;
//            d += this.$hourItem.text() * (60*60*1000);
//            d += this.$minItem.text() * (60*1000);
//            d += this.$secItem.text() * 1000;

            var end = this.$Countdown.data('timestamp'),
                now = new Date().valueOf(),
                d = end - now;
            return d;

        },

        /*
         * on after countdown
         */
        onAfterCountdown: function(){

            this.reloadPage();

        },

        /*
         * reload page from server
         */
        reloadPage: function(){

            // parameter "true" -> loading page from server not from browsercache
            location.reload(true);

        },

        // Triggers when DOM is loaded
        domReady: function() {
            window.CMS.Countdown.init();
        }
    };

    $(document).ready(window.CMS.Countdown.domReady);

}(this, this.document, this.jQuery, this.define));
(function (window, document, $, define, undef) {

    'use strict';

    window.CMS = window.CMS === undef ? {} : window.CMS;

    /**
     * @author daniel.grobelny@denkwerk.com
     */
    window.CMS.Initializer = {
        initialize: function() {
            $(document).ajaxSuccess(function() {
                //$().log('ajaxSuccess great success!');
            });
        },

        /**
         * Triggers when DOM is loaded
         */
        domReady: function() {
            window.CMS.Initializer.initialize();
        }
    };

    $(document).ready(window.CMS.Initializer.domReady);

}(this, this.document, this.jQuery, this.define));
