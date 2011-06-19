
/**
 * 可拖动行为控件类
 */
HL.bi.Draggable = HL.Class({

    /**
     * 拖动行为构造函数
     * @param options
     */
    init : function(options) {
        
        this.dragEl = typeof options.dragEl === 'string' ? HL.g(options.dragEl) : options.dragEl;
        this.moveEl = options.moveEl ? 
        		(typeof options.moveEl === 'string' ? HL.g(options.moveEl) : options.moveEl) : 
        		this.dragEl;
        this.dragType = options.dragType;
        this.range = options.range;
        this.needup = options.needup; //2011-6-19 是否自动停止拖拽（True:放开鼠标停止）
        this.lastCursorX = 0;
        this.lastCursorY = 0;

        HL.Observable(this);
        
        HL.dom.setStyle(this.dragEl, {cursor : 'move'});
        
        HL.on(this.dragEl, "mousedown", this.onDrag, this);
    },
    
    /**
     * 保存鼠标坐标值
     * @param coords
     */
    saveMousePosition : function(coords) {
        this.lastCursorX = (coords.x < 0) ? 0 : coords.x;
        this.lastCursorY = (coords.y < 0) ? 0 : coords.y;
    },

    /**
     * 保存拖动元素的位置坐标值
     */
    savePanelPosition : function() {
        var position = HL.dom.getPosition(this.moveEl);
        this.lastPositionLeft = position.left;
        this.lastPositionTop = position.top;
    },

    /**
     * 开始拖动监听函数
     * @param ev
     */
    onDrag : function(ev) {

    	var coords = ev.getCoords(),
    		el = this.moveEl;

    	if(this.fire('beforeDrag', coords)) {
    		
            ev.stopEvent();
            this.saveMousePosition(coords);
			if(el.setCapture){ //IE
				HL.on(el, "losecapture", this.onDrop);
				el.setCapture();
			}else if(window.captureEvents){ //标准DOM
				HL.on(window, "blur", this.onDrop);
			}
			
            this.savePanelPosition();
            HL.dom.setStyle(el, {
            	position : 'absolute',
            	zIndex : 999
            });

            HL.on(document.body, "mousemove", this.onMove, this);
            
            if(this.needup){
            	// 非自动停止时，需要让下次 Mouse down 事件的onDrag函数终止
            	this.on('beforeDrag', function(){
            		return false;
            	}, this, {single : true});
            	HL.on(document.body, "mousedown", this.onDrop, this);
            } else {
            	HL.on(document.body, "mouseup", this.onDrop, this);
            }
            
            this.fire('drag', coords);
    	}

    },

    /**
     * 拖动中监听函数
     * @param ev
     */
    onMove : function(ev) {
    	var coords = ev.getCoords(),
        	X = coords.x - this.lastCursorX,
        	Y = coords.y - this.lastCursorY,
        	left = (this.lastPositionLeft + X < 0)? 0: this.lastPositionLeft + X, 
        	top  = (this.lastPositionTop + Y < 0)?  0: this.lastPositionTop + Y;

        HL.dom.setStyle(this.moveEl, {
        	left : left + 'px',
        	top  : top  + 'px'
        });
    },

    /**
     * 拖放结束监听函数
     * @param ev
     */
    onDrop : function(ev) {
    	var coords = ev.getCoords();
    	if(this.fire('beforeDrop', coords)) {

            HL.un(document.body, "mouseup", arguments.callee);
            HL.un(document.body, "mousemove", this.onMove);

            this.fire('drop', coords);
    	}
    }

});