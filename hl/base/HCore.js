/*!
 * HL JS Library 3.3.1
 * Copyright(c) 2011 huang long.
 */
if(!window['HL']) {
	window['HL'] = {
		version : 0.5
	};
}

var DOC = document;

HL.append = function(destination, source){
	for(var o in source){
		destination[o] = source[o];
	}
	return destination;
};

HL.append(Object.prototype, {
	
	clone : function(){
		var cloneattr = function(org){
			var obj;
			if(typeof org == 'object' && org.constructor === Array)
				obj = [];
			else
				obj = {};
			for(var i in org){
				if(typeof org[i] === 'object')
					obj[i] = cloneattr(org[i]);
				else
					obj[i] = org[i];
			}
			return obj;
		};
		return cloneattr(o || this);
	},
	
	each : function(fn, scope){
		var i = 0, len = this.length,
			array = [];
		for(; i < len; i++){
			array[i] = this[i];
		}
		for(i = 0; i < len; i++){
			fn.call(scope || this, i, array[i], array);
		}
	}
});


HL.append(Function.prototype, {

	//锟斤拷锟接碉拷前锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷锟街革拷锟斤拷锟斤拷锟�
	delegate : function(scope){
		var method = this,
			arglist = Array.prototype.slice.call(arguments, 1);
		return function(){
			var callargs = Array.prototype.slice.call(arguments,0).concat(arglist);
			return method.apply(scope || method || this, callargs);
		};
	},
	
	defer : function(time, scope){
		var slice = Array.prototype.slice,
			method = this,
			callargs = slice.call(arguments, 2);

		setTimeout(function(){
			return method.apply(scope || method || this, callargs);
		}, time);
	},
	
	buffer : function(time, scope){
		var slice = Array.prototype.slice,
			args = slice.call(arguments, 2),
			method = this,
			invoked = false;

		return function(){
			var callargs = Array.prototype.slice.call(arguments,0).concat(args);

			if(!invoked){
				invoked = true;
				setTimeout(function(){
					invoked = false;
				}, time);
				return method.apply(scope || method || this, callargs);
			}
		};
	},
	
	loop : function(frequency, scope, condition){
		var method = this,
			callargs = Array.prototype.slice.call(arguments, 3);
		
		setTimeout(function(){
			method.apply(scope || method || window, callargs);
			if( !condition || condition.apply(scope || method || this, callargs) !== false )
				setTimeout(arguments.callee, frequency);
		}, frequency);
	},
	
	createInterval : function(frequency, scope){
		var interval,
			method = this,
			callargs = Array.prototype.slice.call(arguments, 3);
		
		return {
			run : function(){
				interval = setInterval(method.delegate(scope), frequency);
			},

			stop : function(){
				clearInterval(interval);
			}
		};
	},

	intercept : function(fn, scope){
		var slice = Array.prototype.slice,
			method = this,
			argList = slice.call(arguments, 2);
		return function(){
			var callargs = slice.call(arguments,0).concat(argList);
			if(fn.apply(object || method || window, callargs) === false){
				return method.apply(object || method || this, callargs);
			}
			return false;
		};
	},

	newInstance : function(){
		var slice = Array.prototype.slice,
			that = function(){},
			cls = this,
			newObj,
			params = slice.call(arguments, 0);;
		that.prototype = this.prototype;

		return function(){
			var res,
				callargs = slice.call(arguments,0).concat(params);
			newObj = new that();
			res = cls.apply(newObj, callargs);
			return (typeof res === 'object' && res) || newObj;
		};
	}
});

HL.append(Array.prototype, {
	
	each : function(fn){
		if(this.length){
			var i = 0, len = this.length;
			for(; i < len; i++){
				fn.call(this, i, this[i], this);
			}
		}
	}
	
});

HL.append(HL, {
	
	isIE : function(){
		return !+[1,];
	},
	
	namespace : function(namespace){
		var ns = namespace.split('.'),
			o, i, len = ns.length, 
			chain = window[ns[0]] = window[ns[0]] || {};
		for(i = 1; i < len; i++){
			o = ns[i];
			chain = chain[o] = chain[o] || {};
		}
	},

	// 锟斤拷态注锟斤拷锟絊cript锟脚憋拷
	load : function(url, fn){
		var regjs = /(\.js)$/,
			regcss = /(\.css)$/,
			type = regjs.test(url)? 'js' : (regcss.test(url) ? 'css' : ''),
			callback = fn || function(){},
			el;

		if(type === 'js'){
			el = HL.dom.createEl('script', {
				src : url, 
				type : 'text/javascript'
			});
		} else if (type === 'css'){
			el = HL.dom.createEl('link', {
				href : url, 
				type : 'text/css', rel : 'stylesheet'
			});
		} else {
			throw 'the resource is not avaible!';
		}
		if(el.readyState){
			el.onreadystatechange = function(){
				if(el.readyState == 'loaded' || el.readyState == 'complete'){
					el.onreadystatechange = null;
					callback();
				}
			};
		} else {
			el.onload = function(){
				callback();
			};
		}
		document.getElementsByTagName('head')[0].appendChild(el);
	},
	
	loadModule : function(moudel){
		
	},
	
	// 锟斤拷锟斤拷URL锟斤拷锟斤拷锟街凤拷锟斤拷锟斤拷JSON锟斤拷锟斤拷
	parseQueryString : function(url){
		var args = [], params = [],
			key, value, cache = {};
		
		if(typeof url !== 'string') 
			return;
		
		args = url.split('&');
		for(var i = 0; i < args.length; i++){
			params = args[i].split('=');
			key = params[0];
			value = params[1];
			if(cache[key] === undefined){
				cache[key] = value;
			} else {
				if(typeof cache[key] === 'object'){
					cache[key].push(value);
				} else {
					cache[key] = [cache[key], value];
				}
			}
		}
		
		return cache;
	},

	// 锟斤拷锟斤拷JSON锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷台锟结交锟斤拷URL锟街凤拷
	parseJsonParams : function(json, parent){
		var args = [], params = [],
			key, value, type, cache = [];
		
		parent = parent || '';
		if(parent !== ''){
			parent = parent + '.';
		}

		if(typeof json === 'object' && typeof json !== 'function'){
			for( key in json ){
				if( json.hasOwnProperty(key) ) {
					value = json[key];
					type = typeof value;
					
					if (type !== 'object' && type !== 'function') {
						cache.push(parent + key + '=' + value);
					} else if (value.length && value.slice && value.constructor === Array) {
						for(var i = 0; i < value.length; i++) {
							cache.push(parent + key + '=' + value[i]);
						}
					} else if (type !== 'function') {
						cache.push(this.parseJsonParams(value, key));
					}
				}
			}
			return cache.join('&');
		}
		return json;
	}
});



HL.namespace('HL.dom');

HL.append(HL.dom, {
	
	createEl : function(type, attrs){
		var el = DOC.createElement(type), 
			attr;
		for( attr in attrs){
			if(attrs.hasOwnProperty(attr)){
				el[attr] = attrs[attr];
			}
		}
		return el;
	},
	
	removeEl : function(el, root){
		root = root || DOC.body;
		HL.clear(el);
		root.removeChild(el);
	},
	
	setStyle : function(el, attributes){
		var attr, style = el.style;
		
		for(attr in attributes){
			if(attributes.hasOwnProperty(attr)){
				style[attr] = attributes[attr];
			}
		}
		return el;
	},
	
	getPosition : function(el){
		var left = 0, top = 0, obj = el;
		
		while(obj !== DOC.body){
			left = left + obj.offsetLeft;
			top = top + obj.offsetTop;
			obj = obj.offsetParent;
		}
		return { 
			left : left, 
			top : top 
		};
	},
	
	animate : function(el, attrs, time, isAbsolute, callback){
		var attr, size, offset,
			attrType = /^(height|width|left|top|opacity|background)$/,
			frequency = 30,
			time = time || 500,
			style = el.style, tmp,
			
			change = function(attr, maxsize, tmp, asc, ot){
				tmp = tmp + ot * asc;
				if ( (maxsize - tmp) * asc > 0 ) {
					style[attr] = tmp + 'px';
					arguments.callee.defer( frequency, this, attr, maxsize, tmp, asc, ot );
				} else {
					style[attr] = maxsize + 'px';
					if(callback) 
						callback.apply(el);
					if( !isAbsolute )
						style.position = 'relative';
				}
			};

		if( !isAbsolute ){
			style.position = 'absolute';
		}
		for(attr in attrs){
			if(attrs.hasOwnProperty(attr)){
				if( !attrType.test(attr) ){
					continue;
				}
				//var first = attr.shift();
				tmp = el['offset' + attr.charAt(0).toUpperCase() + attr.slice(1)];
				if(tmp > attrs[attr]){
					offset = (tmp - attrs[attr]) / (time / frequency);
					change(attr, attrs[attr], tmp, -1, offset);
				} else {
					offset = (attrs[attr] - tmp) / (time / frequency);
					change(attr, attrs[attr], tmp, 1, offset);
				}
			}
		}
	},

	query : function(el, selector, all){
		var id = /^(#\w+)/,
			tag = /\w+/,
			cls = /^(.\w+)/;

		if(el.querySelector){
			return all ? el.querySelectorAll(selector) : el.querySelector(selector);
		} else {
			
		}
	},
	
	findParent : function(el, selector, d){
		var parent = el.parentNode,
			mparent,
			depth = d || 5,
			nodes, node, i, len;
		if(!parent){
			return el;
		}
		mparent = parent.parentNode;
		if(document.querySelector){
			nodes = parent.querySelectorAll(selector);
			for(i = 0, len = nodes.length; i < len; i++){
				if(nodes[i] === el)
					return el;
			}
			while(depth > 0 &&  mparent){
				nodes = mparent.querySelectorAll(selector);
				for(i = 0, len = nodes.length; i < len; i++){
					if(nodes[i] === parent)
						return parent;
				}
				parent = mparent;
				mparent = parent.parentNode;
				depth--;
			}
			return false;
		} else {
			return parent;
		}
	},
	
	addClass : function(dom, className){
		var cls = dom.className.split(' '),
			i, len = cls.length;
		for(i = 0; i < len; i++){
			if(className === cls[i]){
				return;
			}
		};
		dom.className = cls.join(' ') + ' ' + className;
		return dom;
	},

	hasClass : function(dom, className){
		var cls = dom.className.split(' '),
			i, len = cls.length;
		for(i = 0; i < len; i++){
			if(className === cls[i]){
				return true;
			}
		};
		return false;
	},
	
	removeClass : function(dom, className){
		var cs = dom.className.split(' '),
			c = [], 
			i, n = 0, len = cs.length;
		
		for(i = 0; i < len; i++){
			if(className !== cs[i]){
				c[n++] = cs[i];
			}
		}
		dom.className = c.join(' ');
		return dom;
	}
	
});

var query = HL.dom.query;

var $ = function(id){
	return DOC.getElementById(id);
};


Class = function(){
	var classImpl, superClass,
		_super = Object,
		clazz = function(){
			this.init.apply(this, arguments);
		};
	if(typeof arguments[0] === 'function'){
		superClass = arguments[0];
		classImpl = arguments[1];
	} else {
		classImpl = arguments[0];
	}
	if(superClass){
      	var parent = function(){ };
      	parent.prototype = superClass.prototype;
		clazz.prototype = new parent();
		_super = superClass.prototype;
	}

	clazz.prototype.super = _super;
	HL.append(clazz.prototype, classImpl);
	//window[classname] = clazz;
	return clazz;
};

HL.namespace('HL.ui');
HL.namespace('HL.bi');
HL.namespace('HL.event');
HL.namespace('HL.data');


HL.ui.Base = Class({
	
	init : function(config){
	
		if(config.renderID){
			this.container = DOC.getElementById(config.renderID);
			delete config.renderID;
		} else if(config.el) {
			this.container = config.el;
			delete config.el;
		}
		
		HL.append(this, config);
		HL.Observable(this);
		this.renderUI();
		this.initEvent();
	},
	
	renderUI : function(){
		this.fire('render', this);
	},
	
	initEvent : function(){},
	
	destroy : function(){
		if(this.fire('beforeDestroy', this)){
			this.fire('destroy', this);
		}
	}
});
