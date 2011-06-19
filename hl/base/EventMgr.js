
/**
 * 观察者事件模型（函数化接口方法）
 */
HL.event.Observable = function(target){

	var observer = {},
		fnIndex = 0; // 2011-6-19增加：监听函数队列遍历索引值，用来辅助动态删除监听函数队列

	/**
	 * 注册自定义事件的监听函数
	 */
	target.on = function(event, listener, scope, config, args){
		var l = observer[event],
		    array = [], 
		    handler = listener, 
		    config = config || {}, o;

		if(typeof args == 'object'){
			for(var i in args){
				array.push(args[i]);
			}
		} else {
			array = Array.prototype.slice.call(arguments, 4);
		}

		if(config.single === true){// 监听事件只触发一次
			o = this;
			handler = function(){
				fnIndex--; //2011-6-19 监听函数删除后，遍历索引回到上一位置
				o.removeListener(event, listener, scope);
				return listener.apply(scope || this, arguments);
			};
		} else if (config.buffer){// 监听事件触发存在缓冲
			o = this;
			if(typeof config.buffer === 'number')
				handler = listener.buffer(config.buffer);
			else
				handler = listener.buffer(100);
		}
		var ct = {
				fn : listener, // 作为删除时检索的关键字
				fireFn : handler, // 触发时实际运行的函数
				scope : scope || this,// 防止作用域为空时时删除时不成功
				args : array
		};
		if(l === undefined)
			observer[event] = [ct];
		else
			observer[event].push(ct);

		return this;
	};

	/**
	 * 触发相应事件的监听函数
	 */
	target.fire = function(event){
		var listeners = observer[event] || [],
		    func, scope, paramters,
		    //不缓存监听队列长度，因为可能会动态删除 len = listeners.length,
			args = Array.prototype.slice.call(arguments, 1);

		if(listeners){
			for( fnIndex = 0; fnIndex < listeners.length; fnIndex++ ){
				func = listeners[fnIndex].fireFn;
				scope = listeners[fnIndex].scope;
				paramters = listeners[fnIndex].args || [];
				// 运行监听函数，返回false即终止继续触发
				if(func.apply(scope, paramters.concat(args)) === false)
					return false;
			}
		}
		return true;
	};

	/**
	 * 删除事件的某监听函数
	 */
	target.removeListener = function(event, fn, scope){
		var l = observer[event],
			i = l.length - 1;
		scope = scope || this;
		while(i >= 0){
			if(l[i].fn === fn && l[i].scope === scope) {
				l.splice(i, 1);
				break;
			}
			i--;
		}
		return true;
	};
	
	return target;
};
HL.Observable = HL.event.Observable;

/**
 * DOM事件模型
 */
HL.event.Manager = function(){

	/**
	 * 缓存DOM元素的事件列表
	 */
	var elCache = {},
	
	addEventHandler = function(){
		var h;
		if(window.addEventListener){
			h = function(target, eventname, handler){
				target.addEventListener(eventname, handler, false);
			};
		} else if (window.attachEvent){
			h = function(target, eventname, handler){
				target.attachEvent('on' + eventname, handler);
			};
		}
		return h;
	}(),

	removeEventHandler = function(){
		var h;
		if(window.removeEventListener){
			h = function(target, eventname, handler){
				target.removeEventListener(eventname, handler, false);
			};
		} else if (window.detachEvent){
			h = function(target, eventname, handler){
				target.detachEvent('on' + eventname, handler);
			};
		}
		return h;
	}();
	
	
	return {

		/**
		 * 注册DOM事件
		 * @param target
		 * @param eventname
		 * @param handler
		 * @param scope
		 * @param config
		 * @returns
		 */
		addListener : function(target, eventname, handler, scope, config){
			var el = typeof target === 'object' ? target : document.getElementById(target),
				id;
			wrap = function(event){
				var e = HL.event.EventObj(event);
				handler.call(scope || el, e);
			};
			
			if(!el)
				throw 'The element is not exist in the document!';
			id = el.id;
			if(!elCache[id]){
				elCache[id] = {};
			}
			if(!elCache[id][eventname]){
				elCache[id][eventname] = [];
			}
			elCache[id][eventname].push({
				fn : handler,
				wrap : wrap
			});

			addEventHandler(el, eventname, wrap);
			return el;
		},

		/**
		 * 清除某监听函数
		 * @param target
		 * @param eventname
		 * @param handler
		 * @returns
		 */
		removeListener : function(target, eventname, handler){
			var el = typeof target === 'object' ? target : document.getElementById(target),
				id, listeners, wrap;
			
			if(!el)
				throw 'The element is not exist in the document!';
			id = el.id;
			if(elCache[id][eventname]){
				listeners = elCache[id][eventname];
				for(var i = 0, len = listeners.length; i < len; i++){
					if(listeners[i].fn === handler){
						wrap = listeners[i].wrap;
					}
				}
				if(!wrap)
					return el;
			} else {
				return el;
			}

			removeEventHandler(el, eventname, wrap);
			return el;
		},

		/**
		 * 清除DOM元素所以监听函数
		 * @param target
		 * @returns
		 */
		clearListeners : function(target){
			var el = typeof target === 'object' ? target : document.getElementById(target),
				id, o, event,listeners;
			if(!el)
				throw 'The element is not exist in the document!';
			id = el.id;
			if(elCache[id]){
				o = elCache[id];
				for(event in o){
					if(o.hasOwnProperty(event)){
						listeners = o[event];
						for(var i = 0, len = listeners.length; i < len; i++){
							removeEventHandler(el, event, listeners[i].wrap);
						}
					}
				}
			}
		}
		
	};
}();

HL.on = HL.event.Manager.addListener;
HL.un = HL.event.Manager.removeListener;
HL.clear = HL.event.Manager.clearListeners;


HL.event.mouseout = /^(mouseout|mouseleave)/,
HL.event.mouseover = /^(mouseover|mouseenter)/;

/**
 * Event对象封装
 */
HL.event.EventObj = function(event){
	
	var ev = event || window.event, 
		e = {

			/**
			 * 取得鼠标坐标
			 */
			getCoords : function(){
				if(ev.pageX){
					return {
						x : ev.pageX,
						y : ev.pageY
					};
				} else {
					return {
						x : HL.isIE() ? 
							ev.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft) : 
							ev.clientX,
						y : HL.isIE() ? 
							ev.clientY + (document.documentElement.scrollTop || document.body.scrollTop) : 
							ev.clientY
					};
				}
			},

			/**
			 * 取得事件源DOM元素
			 */
			getTarget : function(){
				return ev.target ? ev.target : ev.srcElement;
			},

			/**
			 * 取得事件源Related元素
			 */
			getRelatedTarget : function(){
				if(HL.isIE()){
					HL.event.mouseout.test(ev.type) ? ev.toElement : ev.fromElement;
				} else {
					return ev.relatedTarget;
				}
			},

			/**
			 * 取消事件默认行为
			 */
			stopEvent : function(){
				if(ev.stopPropagation){
					ev.stopPropagation();
					ev.preventDefault();
				} else {
					ev.cancelBubble = true;
					ev.returnValue = false;
				}
			}
		};

	HL.append(e, ev);
	return e;
};
