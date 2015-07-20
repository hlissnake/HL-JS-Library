
HL.bi.DragDrop = Class({
    
    initialState : "inactive",
    
    activeState  : "active",
    
    moveState    : "moving",
    
    DragType : {
    	clone : 'clone'
    },
    
    init : function(dragTarget, dragHead, dragType) {
        
        this.panelElement = $(dragTarget);
        this.titleElement = $(dragHead);
        this.dragType = dragType;
        
        this.currentState = this.initialState;
        this.lastCursorX = 0;
        this.lastCursorY = 0;

        HL.dom.setStyle(this.titleElement, {cursor : 'move'});//style.cursor = "move";
        
        //if (this.dragType == DragDrop.DragType.clone )
            // create clone panel of the target panel
            //this.movingPanel = $(JQ(this.panelElement).clone()[0]);
        //else
            this.movingPanel = this.panelElement;
        
        //this.eventHandle = this.handleEvent.bindAsEventListener(this);
        HL.on(this.titleElement, "mousedown", this.handleEvent, this);
    },

    handleEvent : function(event) {

        var actionTransitionFunction = this.actionTransitionFunctions[this.currentState][event.type];
        
        if (!actionTransitionFunction) {
            actionTransitionFunction = this.unexpectedEvent;
        }

        var nextState = actionTransitionFunction.call(this, event);
        if(!this.actionTransitionFunctions[nextState])
            nextState = this.unexpectedEvent(event);

        this.currentState = nextState;
    },

    // Test method, catch the unexpected event
    unexpectedEvent: function(event) {
        //alert('Drag&Drop received unexpected event ' + event.type + ' in state ' + this.currentState);
        return this.initialState; 
    },
    
    saveMousePosition : function(event) {
    	var coords = event.getCoords();
        this.lastCursorX = (coords.x < 0) ? 0 : coords.x;
        this.lastCursorY = (coords.y < 0) ? 0 : coords.y;
    },
    
    savePanelPosition : function(panel) {
        var position = HL.dom.getPosition(panel);
        this.lastPositionLeft = position.left;
        this.lastPositionTop = position.top;
    },

    onDragStop : function() {

        if (this.dragType == this.DragType.clone ) {

            this.panelElement.style.position = 'absolute';
            this.panelElement.clonePosition(this.movingPanel);
            DOC.body.removeChild(this.movingPanel);
        }
        
        HL.un(DOC.body, "mouseup",   this.handleEvent);
        HL.un(DOC.body, "mousemove", this.handleEvent);

        return this.initialState;
    },

    actionTransitionFunctions : {

        // inactive state
        inactive : {
            
            mousedown : function(event) {

                this.saveMousePosition(event);
                this.savePanelPosition(this.panelElement);
                HL.dom.setStyle(this.movingPanel, {
                	position : 'absolute',
                	zIndex : 101
                });
                
                HL.on(DOC.body, "mousemove", this.handleEvent, this);
                HL.on(DOC.body, "mouseup",   this.handleEvent, this);
                
                if (this.dragType == this.DragType.clone ) {
                    DOC.body.appendChild(this.movingPanel);

                    // set clone panel's opacity
                    this.movingPanel.setOpacity(0.3);
                    this.movingPanel.clonePosition(this.panelElement);
                }

                return this.activeState;
            }
        },

        // active state
        active : {

            mouseup : function(event) {
                return this.onDragStop();
            },

            mousemove : function(event) {
            	var coords = event.getCoords();
                var X = coords.x - this.lastCursorX;
                var Y = coords.y - this.lastCursorY;
                var left = (this.lastPositionLeft + X < 0)? 0: this.lastPositionLeft + X; 
                var top  = (this.lastPositionTop + Y < 0)?  0: this.lastPositionTop + Y;
                
                HL.dom.setStyle(this.movingPanel, {
                	left : left + 'px',
                	top  : top  + 'px'
                });
                
                //this.saveMousePosition(event);
                //this.savePanelPosition(this.movingPanel);
                
                return this.moveState;
            }
        },

        // moving state
        moving : {

            mousemove : function(event) {
                var state = this.actionTransitionFunctions.active.mousemove.call(this, event);
                return state;
            },

            mouseup : function(event) {
                return this.onDragStop();
            }
        }
    }
});