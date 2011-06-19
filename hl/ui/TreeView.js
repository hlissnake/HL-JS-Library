/**
 * HL JS Library
 * Copyright(c) 2011 huang long.
 */

// 树节点特殊DOM属性
HL.treeNodeid = 'tree-node-id';

/**
 * Tree树 UI控件类
 */
HL.ui.TreeView = HL.Class( HL.ui.Base, {

	bodyCls : 'treepanel',
	
	ulCls : 'treeroot',

    init : function(config) {
    	this.root = [];
    	this.nodeUI = this.nodeUI || HL.ui.TreeNode;
    
		this.super.init.call(this, config);
    },
    
    renderUI : function(){
    	var root, n, node = this.nodeUI;

    	this.body = HL.dom.createEl('div', {
    		className : this.bodyCls,
    		id	: this.id,
    		innerHTML : '<ul class="' + this.ulCls + '"></ul>'
    	});
		this.container.appendChild(this.body);

		root = HL.q(this.body, 'div ul.' + this.ulCls);
    	// 插入根节点, 初始化传入的Root参数规定为对象格式
    	if(this.root.length && this.root.constructor === Array){
        	this.root.each(function(i, n){
        		root.appendChild(n.ui);
        	});
    	} else {
    		root.appendChild(this.root.ui);
    	}

		this.super.renderUI.call(this);
    },

    initEvent : function(){
    	HL.on(this.body, 'click', this.onClick, this);
    	HL.on(this.body, 'dblclick', this.onDblclick, this);
    	HL.on(this.body, 'mousedown', this.onMousedown, this);
    	
    	// 树节点单击事件
    	this.on('click', function(node, e){
    		var t = e.getTarget(),
    			i = HL.q(node.ui, 'div i.icon');
    		
    		if(t === i){
    			// 没有子节点.则异步加载节点数据
    			if(node.childNodes.length === 0){
    				this.loadNodes(node);
    			} else {
            		node.toggleNodeStatus(this.animate);
    			}
    		}
    	});
    	// 树节点双击事件
    	this.on('dblclick', function(node, e){
    		var t = e.getTarget(),
				i = HL.q(node.ui, 'div i.icon');

    		if(t === i.nextSibling && !node.isLeaf){
        		node.toggleNodeStatus(this.animate);
    		}
    	});
    	this.on('mousedown', function(node, e){
    		
    	});

		this.super.initEvent.call(this);
    },

	/**
	 * 事件代理模式执行函数
	 * @param eventName
	 * @param e
	 */
    processHandler : function(eventname, e) {
    	var target = e.getTarget(),
    		el = HL.dom.findParent(target, 'div.wrapper'),
    		node, id;

    	// 事件源DOM位于树节点之中
    	if(el){
    		id = el.getAttribute(HL.treeNodeid);
    		if(this.root.length && this.root.constructor === Array){
            	this.root.each(function(i, n){
            		if(!node){
            			// 根据ID查找相应Node节点对象
            			node = n.findChild('nodeID', id);
            		}
            	});
        	} else {
        		node = this.root.findChild(HL.treeNodeid, id);
        	}

    		this.fire(eventname, node, e);
    	}
    },

    onClick : function(e){
    	this.processHandler('click', e);
    },

    onDblclick : function(e){
    	this.processHandler('dblclick', e);
    },

    onMousedown : function(e){
    	this.processHandler('mousedown', e);
    },

    createNewNode : function(option) {
        return new this.nodeUI(option);
    },

    expandAllNodes : function() {
        this.rootNodes.each(function(node){

            if(node.childList.length == 0) {
                node.onNodeExpand();
            }

            this.expandChildNodes.delay(0.1, node, this);
        }, this);      
    },

    /**
     * 依次展开子节点
     * @param node
     * @param tree
     */
    expandChildNodes : function(node, tree) {
        var childNodes = node.childList;
        
        for(var i = 0; i < childNodes.length; i++) {
            var node = childNodes[i];
            if(node.childList.length == 0) {
                node.onNodeExpand();
            }
            tree.expandChildNodes.delay(0.2, node, tree);
        }
    },

    /**
     * 增加节点
     * @param parentID
     * @param nodeID
     */
    addNode : function(parentID, nodeID) {
        this.addNodeUrl.call(null, nodeID);
        $(parentID).control.expandChildNodes();
    },

    /**
     * 加载子节点（异步方式）
     * @param node
     */
    loadNodes : function(node){
    	
    }
});


/**
 * TreeNode树节点组件类
 */
HL.ui.TreeNode = HL.Class({
	
    nodeCls : 'node',
    
    lastCls : 'node-last',
    
    wrapperCls : 'wrapper',
    
    iconCls : 'icon',
    
    expandCls : 'expand',
    
    collapseCls : 'collapse',
    
    folderCls : 'folder',
    
    openCls : 'open',
    
    leafCls : 'leaf',
    
    colCls : 'col',
    
    ulCls : 'branch',
    
    status : 'expand',

	init : function(option) {

		this.nodeID    	= option.id;
		this.nodeName  	= option.name;
		this.isLeaf    	= option.leaf;
		this.isLast		= option.last;
     	this.childNodes	= [];
		this.isExpand	= false;
     
     	// 创建节点DOM元素
	    this.createNodeUI(option.children);
	},

    /**
     * 创建节点DOM元素
     */
	createNodeUI : function(children){
		// 为每个节点的DOM增加一个nodeid属性，方便遍历查找节点位置
		var html = ['<div class="', this.wrapperCls, '" ', HL.treeNodeid, '="', this.nodeID, '">'];
		
		html.push('<i class="' + this.iconCls + '"></i>');
		html.push('<i class="' + this.iconCls + '"></i>');
		html.push('<div class="' + this.colCls + '">' + this.nodeName + '</div></div>');
		html.push('<ul class="' + this.ulCls + '"/>');

		this.ui = HL.dom.createEl('li', {
			className : this.nodeCls,
			innerHTML : html.join('')
		});
		
		// 是否最后一个子节点
		if(this.isLast){
			HL.dom.addClass(this.ui, this.lastCls);
		}
		
		var i = HL.q(this.ui, 'i.' + this.iconCls);
		// 是否叶子节点
		if(this.isLeaf){
			HL.dom.addClass(i.nextSibling, this.leafCls);
		} else {
			// 插入子节点
			if ( children && children.length > 0 && children.constructor === Array ){
				children.each(function(i, v, a){
					if( i === a.length - 1){
						HL.append(v, {
							last : true
						});
					}
					this.addChildNode(new HL.ui.TreeNode(v));
				}, this);
				// 节点为展开状态
				HL.dom.addClass(i, this.expandCls);
				HL.dom.addClass(i.nextSibling, this.openCls);
				this.status = 'expand';
				return;
			}
			// 节点为收起状态
			HL.dom.addClass(i, this.collapseCls);
			HL.dom.addClass(i.nextSibling, this.folderCls);
			this.status = 'collapse';
		}
	},

    /**
     * 切换Node的状态：展开/收起
     */
	toggleNodeStatus : function(animate){
		// 取得
		var i = HL.q(this.ui, 'i.' + this.iconCls),
			next = i.nextSibling;

		// 当前为收起状态，切换为展开
		if(this.status === 'collapse') {
			HL.dom.removeClass(i, this.collapseCls);
			HL.dom.addClass(i, this.expandCls);
			HL.dom.removeClass(next, this.folderCls);
			HL.dom.addClass(next, this.openCls);
			this.expand(animate);
			this.status = 'expand';
		}
		// 当前为收起展开状态，切换为收起 
		else if( this.status === 'expand') {
			HL.dom.removeClass(i, this.expandCls);
			HL.dom.addClass(i, this.collapseCls);
			HL.dom.removeClass(next, this.openCls);
			HL.dom.addClass(next, this.folderCls);
			this.collapse(animate);
			this.status = 'collapse';
		}
	},

    /**
     * 展开节点
     * @param animate 是否具备动画效果
     */
	expand : function(animate){
		if(this.childNodes){
			var ul = HL.q(this.ui, 'ul.' + this.ulCls),
				h;
			ul.style.display = 'block';
			// 是否有动画效果
			if(animate){
				h = HL.dom.getHeight(ul);
				ul.style.height = '0px';
				HL.dom.animate(ul, {
					height : h
				}, 200, true, function(){
					ul.style.height = 'auto';
				});
			}
		}
	},

    /**
     * 收起节点
     */
	collapse : function(){
		if(this.childNodes){
			var ul = HL.q(this.ui, 'ul.' + this.ulCls);
			ul.style.display = 'none';
		}
	},
	
    /**
     * 增加子节点
     */
	addChildNode : function(node){
		var ul = HL.q(this.ui, 'ul.' + this.ulCls);
		if(ul){
			ul.appendChild(node.ui);
			this.childNodes.push(node);
		}
	},
	
	/**
	 * 查找子节点
	 * @param attr
	 * @param value
	 * @returns
	 */
	findChild : function(attr, value){
		var target = false,
		f = function(node){
			var v = node[attr];
			if(v === value){
				target = node;
				return false;
			}
		};

		this.cascade(f);
		return target;
	},

	/**
	 * 递归遍历所有子节点
	 * @param fn 遍历函数
	 * @param scope
	 * @param args
	 */
    cascade : function(fn, scope, args){
        if(fn.apply(scope || this, args || [this]) !== false){
            var cs = this.childNodes;
            for(var i = 0, len = cs.length; i < len; i++) {
                cs[i].cascade(fn, scope, args);
            }
        }
    }

});
