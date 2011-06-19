/*!
 * HL JS Library
 * Copyright(c) 2011 huang long.
 */
(function(){

var version = {
		// 页面中的框架名称，默认为 'HL'，在多个版本中可以分别设置加以区分
		prefix : 'HL',
		verid : 0.7
	},
	
	// 闭包变量，防止同名HL全局变量冲突
	HL = {
		uuid : version.prefix,
		version : version.verid
	};


/**
 * 对象属性复制
 * @param destination
 * @param source
 * @returns
 */
HL.append = function(destination, source){
	for(var o in source){
		destination[o] = source[o];
	}
	return destination;
};

// 对象原型扩展
HL.append(Object.prototype, {

	// 对象深度复制
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

	// Array like 对象的遍历
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


// 函数原型扩展
HL.append(Function.prototype, {

	// 作用域代理
	delegate : function(scope){
		var method = this,
			arglist = Array.prototype.slice.call(arguments, 1);
		return function(){
			var callargs = Array.prototype.slice.call(arguments,0).concat(arglist);
			return method.apply(scope || method || this, callargs);
		};
	},

	// 延迟调用(计时器)
	defer : function(time, scope){
		var slice = Array.prototype.slice,
			method = this,
			callargs = slice.call(arguments, 2);

		setTimeout(function(){
			return method.apply(scope || method || this, callargs);
		}, time);
	},

	// 缓冲调用
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

	// 循环调用(自动迭代)
	/**
	 * condition 为迭代是否循环的条件函数
	 */
	loop : function(frequency, scope, condition){
		var method = this,
			callargs = Array.prototype.slice.call(arguments, 2);
		
		setTimeout(function(){
			method.apply(scope || method || window, callargs);
			if( !condition || condition.apply(scope || method || this, callargs) !== false )
				setTimeout(arguments.callee, frequency);
		}, frequency);
	},

	// setInterval 封装
	createInterval : function(frequency, scope){
		var interval,
			method = this;
		
		return {
			run : function(){
				interval = setInterval(method.delegate(scope, arguments), frequency);
			},

			stop : function(){
				clearInterval(interval);
			}
		};
	},

	// 拦截(AOP)
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

	// new 方法的模拟，返回新函数，新函数以函数调用的形式初始化对象
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
	
	each : function(fn, scope){
		if(this.length){
			var i = 0, len = this.length;
			for(; i < len; i++){
				fn.call(scope || this, i, this[i], this);
			}
		}
	}
	
});

/**
 * 取得当前页 HCore JS 文件的路径
 */
(function(){
	var test = /(hl\/base\/HCore.js)$/,
		scripts = document.getElementsByTagName('script'),
		i = 0, len = scripts.length, src;

	for(; i < len; i++){
		src = scripts[i].getAttribute('src');
		if(test.test(src)){
			HL.path = src.slice(0, src.indexOf('hl/base/HCore.js'));
			break;
		}
	}
})();

/**
 * 静态工具方法
 */
HL.append(HL, {
	
	jsu : [], // 已加载的JS文件路径
	
	cssu : [], // 已加载的CSS文件路径
	
	isIE : function(){
		return !+[1,];
	},
	
	/**
	 * 创建自定义模块（比如 HL.ui）-----向Tangram/Extjs致敬
	 * 2011-6-19
	 * @param namespace 模块完整的命名空间
	 * @param fn 模块执行函数，fn默认参数为已实例化的模块对象
	 * @param owner 模块的目标环境，默认Window
	 */
	module : function(namespace, owner){
		var ns = namespace.split('.'),
			i = 0, len = ns.length, 
			o, chain;

		// 未指定目标环境时，在当前作用域内查找，若无变量则默认Window
		if(!owner) {
			try{
				owner = eval(ns[0]);
				i = 1;
			} catch(e) {
				owner = window;
			}
		}
		for( ; i < len; i++){
			o = ns[i];
			owner = owner[o] = owner[o] || {};
		}
	},

	/**
	 * 延迟加载CSS、JS文件
	 * @param url 可以是一个地址数组
	 * @param fn 加载成功时回调函数
	 * @param cascade 传入地址数组时起作用，True时顺序递归加载，否则同时异步加载
	 */
	load : function(url, fn, cascade){
		var regjs = /(\.js)$/,
			regcss = /(\.css)$/,
			type, el,
			callback = fn || function(){};

		// 加载多个文件时
		if(url.length && url.constructor === Array){
			// 顺序递归加载
			if(cascade){
				if(url.length > 1){
					this.load(url.shift(), function(){
						this.load(url, callback, true);
					}.delegate(this));
				} else {
					this.load(url[0], callback);
				}
			} else { // 同时异步加载
				url.each(function(i, v, a){
					this.load(v, callback);
				});
			}
			return;
		}

		type = regjs.test(url)? 'js' : (regcss.test(url) ? 'css' : '');

		// 判断是否已经被加载过
		if(this.cssu.indexOf(url) < 0 || this.jsu.indexOf(url) < 0){
			if(type === 'js'){
				el = HL.dom.createEl('script', {
					src : url, 
					type : 'text/javascript'
				});
				this.jsu.push(url);
			
			} else if (type === 'css'){
				el = HL.dom.createEl('link', {
					href : url, 
					type : 'text/css', rel : 'stylesheet'
				});
				this.cssu.push(url);
			} else {
				throw 'the resource is not avaible!';
			}
		} else {
			callback();
			return;
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

	/**
	 * 延迟加载相应UI组件/应用组件所对应的JS/CSS文件
	 * @param name 组件名称
	 * @param callback 回调函数
	 * @param requires 依赖的其他JS文件
	 */
	loadCmp : function(name, callback, requires){
		var cmp, js, css, reqs;
		
		if(!this.cmps) return;
		if(!this.cmps[name]) return null;
		
		cmp = this.cmps[name];
		js = cmp.js || [];
		css = cmp.css || [];
		if(requires){
			requires.each(function(i, v, a){
				a[i] = this + a[i];
			}, this.path);
		}
		if(js.length && js.constructor === Array){
			js.each(function(i, v, a){
				a[i] = this + a[i];
			}, this.path);
			js = js.concat(requires || []);
		} else {
			js = this.path + js;
			js = [js].concat(requires || []);
		}
		if(css.length && css.construtor === Array){
			css.each(function(i, v){
				a[i] = this + a[i];
			}, this.path);
		} else {
			css = this.path + css;
		}
		
		this.load(css);
		this.load(js, callback, true);
	},
	
	/**
	 * 注册组件，指定相应的JS/CSS文件，方便后期进行延迟加载
	 * @param name 组件名称
	 * @param config 组件配置信息 :
	 * 		js : string/array
	 *  	css : string/array
	 */
	register : function(name, config){
		this.cmps = this.cmps || {};
		this.cmps[name] = this.cmps[name] || {};
		this.append(this.cmps[name], config);
	},

	/**
	 * 将url解析为Json对象
	 * @param url
	 * @returns {___anonymous5283_5284}
	 */
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

	/**
	 * 将Json对象解析成Url字符串
	 * @param json
	 * @param parent（初次调用不使用）
	 * @returns
	 */
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
	},
	

	/**
	 * 类定义器
	 * @param classImpl 类方法以及属性
	 * @param superClass 父类构造器
	 * @returns 类构造函数
	 */
	Class : function(){
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
		clazz.prototype.constructor = clazz;
		HL.append(clazz.prototype, classImpl);

		return clazz;
	}
});

/**
 * Dom操作函数
 */
HL.module('HL.dom');
HL.append(HL.dom, {

	displayMode : /^(block|inline)$/,

	/**
	 * 创建DOM对象
	 * @param type
	 * @param attrs
	 * @returns
	 */
	createEl : function(type, attrs){
		var el = document.createElement(type), 
			attr;
		for( attr in attrs){
			if(attrs.hasOwnProperty(attr)){
				el[attr] = attrs[attr];
			}
		}
		return el;
	},

	/**
	 * 删除DOM对象
	 * @param el
	 * @param root
	 */
	removeEl : function(el, root){
		root = root || document.body;
		HL.clear(el);
		root.removeChild(el);
	},

	/**
	 * 设置样式
	 * @param el
	 * @param attributes（json对象）
	 * @returns
	 */
	setStyle : function(el, attributes){
		var attr, style = el.style;
		
		for(attr in attributes){
			if(attributes.hasOwnProperty(attr)){
				style[attr] = attributes[attr];
			}
		}
		return el;
	},

	/**
	 * 确定元素的绝对方位坐标
	 * @param el
	 * @returns {___anonymous7762_7801}
	 */
	getPosition : function(el){
		var left = 0, top = 0, obj = el;
		
		while(obj !== document.body){
			left = left + obj.offsetLeft;
			top = top + obj.offsetTop;
			obj = obj.offsetParent;
		}
		return { 
			left : left, 
			top : top 
		};
	},
	
	/**
	 * 切换DOM元素的display状态
	 * @param el
	 */
	toggle : function(el){
		var display = this.getComputedStyle(el)['display'];
		
		if (this.displayMode.test(display)) {
			el.style.display = 'none';
		} else if (display === 'none') {
			el.style.display = 'block';
		}
	},
	
	/**
	 * 取得元素高度，no padding 与offsetHeight不相等
	 * @param el
	 * @returns
	 */
	getHeight : function(el){
		var height = this.getComputedStyle(el)['height'];
		return parseInt(height.split('px')[0]);
	},
	
	/**
	 * 取得元素宽度，no padding 与offsetWidth不相等
	 * @param el
	 * @returns
	 */
	getWidth : function(el){
		var width = this.getComputedStyle(el)['width'];
		return parseInt(width.split('px')[0]);
	},
	
	/**
	 * 取得DOM元素计算出的样式
	 * @param el
	 * @returns
	 */
	getComputedStyle : function(el){
		var style;
		if(el.currentStyle){
			return el.currentStyle;
		} else if(document.defaultView.getComputedStyle) {
			return document.defaultView.getComputedStyle(el);
		}
	},

	/**
	 * 改变元素样式，并产生动画效果
	 * @param el
	 * @param attrs 需要改变的样式Json格式
	 * @param time 动画执行总时间
	 * @param isAbsolute 元素是否为绝对定位
	 * @param callback 动画执行完毕的回调函数
	 */
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

	/**
	 * Css选择器，不支持低端浏览器
	 * @param el
	 * @param selector
	 * @param all
	 * @returns
	 */
	query : function(el, selector, all){
		var id = /^(#\w+)/,
			tag = /\w+/,
			cls = /^(.\w+)/;

		if(el.querySelector){
			return all ? el.querySelectorAll(selector) : el.querySelector(selector);
		} else {
			
		}
	},

	/**
	 * 向上检索满足Css选择器的父对象
	 * @param el
	 * @param selector
	 * @param d 检索的深度
	 * @returns
	 */
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

	/**
	 * 增加Class属性
	 * @param dom
	 * @param className
	 * @returns
	 */
	addClass : function(dom, className){
		var cls = dom.className.split(/\s+/),
			i, len = cls.length;
		for(i = 0; i < len; i++){
			if(className === cls[i]){
				return;
			}
		};
		dom.className = cls.join(' ') + ' ' + className;
		return dom;
	},

	/**
	 * 判断是否包含Class
	 * @param dom
	 * @param className
	 * @returns {Boolean}
	 */
	hasClass : function(dom, className){
		var cls = dom.className.split(/\s+/),
			i, len = cls.length;
		for(i = 0; i < len; i++){
			if(className === cls[i]){
				return true;
			}
		};
		return false;
	},

	/**
	 * 清除相应Class
	 * @param dom
	 * @param className
	 * @returns
	 */
	removeClass : function(dom, className){
		var cs = dom.className.split(/\s+/),
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

// 函数的快捷方法
HL.q = HL.dom.query;
HL.g = function(id){
	return document.getElementById(id);
};


// 创建模块命名空间
HL.module('HL.ui');
HL.module('HL.bi');
HL.module('HL.event');
HL.module('HL.data');


/**
 * 注册Accordion组件
 */
HL.register('accordion', {
	js : 'hl/ui/Accordion.js',
	css : 'hl/css/AccordionNormal.css'
});
/**
 * 注册Clock组件
 */
HL.register('clock', {
	js : ['hl/ui/DigitalNumber.js', 'hl/ui/DigitalClock.js'],
	css : 'hl/css/Number.css'
});
/**
 * 注册Grid组件
 */
HL.register('grid', {
	js : 'hl/ui/Grid.js',
	css : 'hl/css/Grid.css'
});
/**
 * 注册Tab组件
 */
HL.register('tab', {
	js : 'hl/ui/Tab.js',
	css : 'hl/css/Tab.css'
});
/**
 * 注册Tree组件
 */
HL.register('tree', {
	js : 'hl/ui/TreeView.js',
	css : 'hl/css/TreeView.css'
});

/**
 * UI组件基础父类
 */
HL.ui.Base = HL.Class({

	/**
	 * 组件初始化方法
	 * @param config
	 */
	init : function(config){
	
		if(config.renderID){
			this.container = document.getElementById(config.renderID);
			delete config.renderID;
		} else if(config.el) {
			this.container = config.el;
			delete config.el;
		}
		
		HL.append(this, config);
		HL.Observable(this); // 实现观察者行为接口
		this.renderUI();
		this.initEvent();
	},

	/**
	 * DOM对象渲染
	 */
	renderUI : function(){
		this.fire('render', this);
	},

	/**
	 * 注册事件
	 */
	initEvent : function(){
		var event;
		if(this.listeners){
			for( event in this.listeners ){
				if(this.listeners.hasOwnProperty(event)){
					this.on(event, this.listeners[event], this);
				}
			}
		}
	},

	/**
	 * 销毁UI
	 */
	destroy : function(){
		if(this.fire('beforeDestroy', this)){
			this.fire('destroy', this);
		}
	}
});


	/**
	 * 向Window全局变量中注入 HL 变量，根据版本的不同，可以让多个HL模块共存
	 */
	if(!window[HL.uuid]) {
		window[HL.uuid] = HL;
	}
	
})();