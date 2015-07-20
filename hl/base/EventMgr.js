
/**
 * 锟铰硷拷锟斤拷锟斤拷涌锟�
 */
HL.event.Observable = function(target){

	// 锟秸帮拷占锟侥观诧拷锟竭ｏ拷锟斤拷锟斤拷枚锟斤拷锟斤拷锟斤拷锟斤拷录锟斤拷募锟斤拷锟斤拷锟�
	var observer = {};
	
	// 为某一锟铰硷拷锟斤拷蛹锟斤拷锟斤拷锟�
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

	// 锟斤拷锟斤拷某锟铰硷拷锟斤拷锟斤拷锟叫硷拷锟斤拷锟斤拷
	target.fire = function(event){
		var listeners = observer[event] || [],
		    func, scope, paramters,
		    //不缓存监听队列长度，因为可能会动态删除len = listeners.length,
			args = Array.prototype.slice.call(arguments, 1);

		if(listeners){
			for(var i = 0; i < listeners.length; i++){
				func = listeners[i].fireFn;
				scope = listeners[i].scope;
				paramters = listeners[i].args || [];
				// 运行监听函数，返回false即终止继续触发
				if(func.apply(scope, paramters.concat(args)) === false)
					return false;
			}
		}
		return true;
	};
	
	// 锟狡筹拷锟铰硷拷某一锟斤拷锟斤拷锟斤拷锟斤拷
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
 * 锟铰硷拷锟斤拷锟斤拷锟斤拷
 */
HL.event.Manager = function(){
	
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
		
		// 锟斤拷DOM元锟斤拷锟斤拷锟斤拷录锟斤拷锟斤拷锟�
		addListener : function(target, eventname, handler, scope, config){
			var el = typeof target === 'object' ? target : DOC.getElementById(target),
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
		
		removeListener : function(target, eventname, handler){
			var el = typeof target === 'object' ? target : DOC.getElementById(target),
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
		
		clearListeners : function(target){
			var el = typeof target === 'object' ? target : DOC.getElementById(target),
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
HL.event.EventObj = function(event){
	
	var ev = event || window.event, 
		e = {

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
			
			getTarget : function(){
				return ev.target ? ev.target : ev.srcElement;
			},
			
			getRelatedTarget : function(){
				if(HL.isIE()){
					HL.event.mouseout.test(ev.type) ? ev.toElement : ev.fromElement;
				} else {
					return ev.relatedTarget;
				}
			},
			
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
