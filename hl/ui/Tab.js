/*!
 * HL JS Library 
 * Copyright(c) 2011 huang long.
 */
(function(HL){

	/**
	 * Tab标签页UI控件类
	 */
	HL.ui.Tab = HL.Class( HL.ui.Base, {
		
		panelCls : 'tab-panel',
		
		tpCls : 'tab-top',

		btCls : 'tab-bottom',
		
		hpCls : 'tab-hd-panel',
		
		hdCls : 'tab-hd',
		
		currentCls : 'tab-active',
		
		inactiveCls : 'tab-inactive',
		
		triggerCls : 'tab-trigger',
		
		bdCls : 'tab-body',
		
		contextCls : 'tab-context',

		leftbtnCls : 'tab-leftbtn',
		
		rightbtnCls : 'tab-rightbtn',

		tabs : {},

		tabnum : 0,

		max : 8,

		activeid : false,
		
		sleekFrequency : 20,

		/**
		 * 标题栏向左移动
		 */
		moveLeft : function(){
			var left = this.ul.offsetLeft,
				style = this.ul.style;
			if(left + 4 <= 0){
				style.left = left + 4 + 'px';
			} else {
				style.left = '0px';
			}
		},

		/**
		 * 标题栏向右移动
		 */
		moveRight : function(){
			var left = this.ul.offsetLeft,
				style = this.ul.style;
			if(this.ulWidth + left -4 >= this.ulcw - 20){
				style.left = left - 4 + 'px';
			} else {
				style.left = this.ulcw - this.ulWidth - 20 + 'px';
			}
		},

		init : function(config){
			this.super.init.call(this, config);
		},
		
		renderUI : function(){
			var b = [];

			b.push('<s class="' + this.tpCls + '"><b></b></s><div class="' + this.hpCls + '">');
			b.push('<ul class="' + this.hdCls + '">');
			b.push('</ul></div>');
			b.push('<div class="' + this.bdCls + '">');
			b.push('</div>');
			b.push('<s class="' + this.btCls + '"><b></b></s>');
			
			this.body = HL.dom.createEl('div', {
				id : this.id, 
				className : this.panelCls,
				innerHTML : b.join('')
			});
			this.ul = HL.q(this.body, 'ul.' + this.hdCls);
			this.bd = HL.q(this.body, 'div.' + this.bdCls);
			
			this.body.style.height = this.height ? this.height + 'px' : 'auto';
			this.bd.style.height = this.height ? this.height - this.ul.offsetHeight + 'px' : 'auto';

			this.container.appendChild(this.body);
			this.super.renderUI.call(this);
			if(this.items){
				this.items.each(function(i, v, a){
					this.addTab(v.id, v.tabname, v.context, v.uncloseble);
				}, this);
				delete this.items;
			}
		},

		initEvent : function(){
			var ul = this.ul,
				bd = this.bd;
			
			HL.on(ul, 'click', this.onTitleClick, this);
			HL.on(bd, 'click', this.onPanelClick, this);
			
			// 增加Tab页后 执行相关逻辑
			this.on('add', this.onAdd);
			// 删除Tab页后 执行相关逻辑
			this.on('removed', this.onRemove);
			// 激活Tab页后 执行相关逻辑
			this.on('actived', this.onActive);

			this.super.initEvent.call(this);
		},

		/**
		 * 增加标签页后触发的监听函数
		 * @param trigger
		 * @param ct
		 */
		onAdd : function(trigger, ct){

			var head = this.ul.parentNode,
				ulcw = head.clientWidth,
				left = HL.q(head, 'i.' + this.leftbtnCls),
				right = HL.q(head, 'i.' + this.rightbtnCls),
				movingTask;
				// 取得所有Tab页的总宽度
				this.ulWidth = trigger.offsetLeft + trigger.clientWidth;
				this.ulcw = ulcw;
			
			// Tab页超出了 ul块的宽度范围，并且左右滑动按钮尚未创建
			if( (this.ulWidth > ulcw) && (!left && !right)){
				// 创建左右滑动的 按钮
				left = HL.dom.createEl('i', {
					className : this.leftbtnCls
				});
				right = HL.dom.createEl('i', {
					className : this.rightbtnCls
				});
				right.style.left = ulcw - 20 + 'px'; // 设置右滑动钮的水平位置
				head.appendChild(right);
				head.insertBefore(left, head.firstChild);
				
				
				// 点击左边的按钮，UL 开始向左滑动，movingTask是一个滑动动画线程
				HL.on(left, 'mousedown', function(){
					movingTask = this.moveLeft.createInterval(this.sleekFrequency, this);
					movingTask.run();
				}, this);
				// 放开左边的按钮，UL 停止向左滑动
				HL.on(left, 'mouseup', function(){
					movingTask.stop();
				}, this);

				// 点击右边的按钮，UL 开始向右滑动，movingTask是一个滑动动画线程
				HL.on(right, 'mousedown', function(){
					movingTask = this.moveRight.createInterval(this.sleekFrequency, this);
					movingTask.run();
				}, this);
				// 放开右边的按钮，UL 停止向右滑动
				HL.on(right, 'mouseup', function(){
					movingTask.stop();
				}, this);

			}
		},

		/**
		 * 移动标签页后触发的监听函数
		 */
		onRemove : function(){
			var head = this.ul.parentNode,
				ulcw = head.clientWidth,
				left = HL.q(head, 'i.' + this.leftbtnCls),
				right = HL.q(head, 'i.' + this.rightbtnCls);
			this.ulWidth = this.ul.lastChild.offsetLeft + this.ul.lastChild.clientWidth;
			// 检测标题宽度是否超出，未超出则删除左右滑动按钮
			if( (this.ulWidth <= ulcw) && (left && right)) {
				HL.dom.removeEl(left, head);
				HL.dom.removeEl(right, head);
				this.ul.style.left = '0px';
			}
		},

		/**
		 * 激活某标签页后的监听函数
		 * @param activehd
		 */
		onActive : function(activehd){
			var head = this.ul.parentNode,
				ulcw = head.clientWidth,
				width = activehd.offsetLeft + activehd.clientWidth;
			// 被激活Tab标签隐藏在右侧
			if( ulcw - width - 20 <= this.ul.offsetLeft){
				this.ul.style.left = ulcw - width - 20 + 'px';
			}
			// 被激活Tab标签隐藏在左侧
			if( activehd.offsetLeft + this.ul.offsetLeft < 0){
				this.ul.style.left = 0 - activehd.offsetLeft + 'px';
			}
		},

		/**
		 * 创建新标签页
		 * @param id
		 * @param tabname
		 * @param context
		 * @param uncloseble
		 * @returns {Boolean}
		 */
		addTab : function(id, tabname, context, uncloseble){
			var hd = this.ul,
				body = HL.q(this.body, 'div.' + this.bdCls),
				trigger,
				ct, i;

			// 是否超过最大Tab页数限制
			if(this.tabnum < this.max){
				// 是否可关闭
				i = uncloseble ? '' : '<i></i>';
				trigger = HL.dom.createEl('li', {
					id : id, 
					className : this.inactiveCls,
					innerHTML : '<h3>' + tabname + '</h3>' + i
				});
				hd.appendChild(trigger);

				ct = HL.dom.createEl('div', {
					id : 'ct_' + id, 
					className : this.contextCls
				});
				HL.dom.setStyle( ct, {
					display : 'none',
					height : this.height ? this.height - this.ul.offsetHeight + 'px' : 'auto'
				});
				body.appendChild(ct);

				if(typeof context === 'string'){
					ct.innerHTML = context;
				} else if(typeof context === 'object') {
					
					if(context.xtype && context.params){
						HL.append(context.params, {
							renderID : ct.id
						});
						new context.xtype(context.params);
					}
				}
				this.tabnum++;
				this.tabs[trigger.id] = ct.id;
				this.fire('add', trigger, ct);
				return true;
			} else {
				return false;
			}
		},

		/**
		 * 激活某标签页
		 * @param id
		 */
		activeTab : function(id){
			var activeHd,
				activePanel,
				lastTab,
				lastPanel,
				titles,
				panels;
			
			if(typeof id === 'number'){
				titles = HL.q(this.body, 'ul.' + this.hdCls + ' li', true),
				panels = HL.q(this.body, 'div.' + this.contextCls, true);
				activeHd = titles[id];
				activePanel = panels[id];
			} else {
				activeHd = HL.q(this.ul, '#' + id);
				activePanel = HL.q(this.body, '#' + this.tabs[id]);
			}
			if(!activeHd) return;
			if(this.activeid){
				lastTab = HL.q(this.ul, '#' + this.activeid);
				lastPanel = HL.q(this.body, '#' + this.tabs[this.activeid]);
				HL.dom.removeClass(lastTab, this.currentCls);
				HL.dom.addClass(lastTab, this.inactiveCls);
				lastPanel.style.display = 'none';
			}

			this.activeid = activeHd.id;
			HL.dom.removeClass(activeHd, this.inactiveCls);
			HL.dom.addClass(activeHd, this.currentCls);
			activePanel.style.display = 'block';
			
			this.fire('actived', activeHd);
		},

		/**
		 * 移除某标签页
		 * @param id
		 */
		removeTab : function(id){
			var activeHd,
				activePanel,
				titles,
				panels;
			if(typeof id === 'number'){
				titles = HL.q(this.body, 'ul.' + this.hdCls + ' li', true),
				panels = HL.q(this.body, 'div.' + this.contextCls, true);
				activeHd = titles[id];
				activePanel = panels[id];
			} else {
				activeHd = HL.q(this.body, '#' + id);
				activePanel = HL.q(this.body, '#' + this.tabs[id]);
			}
			
			if(this.fire('beforeremove', activeHd.id)){
				this.tabnum--;
				this.tabs[activeHd.id] = false;
				HL.dom.removeEl(activeHd, this.ul);
				HL.dom.removeEl(activePanel, HL.q(this.body, 'div.' + this.bdCls));
				
				this.fire('removed', activeHd);
				
				if(this.activeid === activeHd.id){
					this.activeid = false;
					this.activeTab(0);
				}
			}
		},

		/**
		 * 判断标签页是否存在
		 * @param id
		 * @returns {Boolean}
		 */
		hasTab : function(id){
			if(this.tabs[id])
				return true;
			else
				return false;
		},

		/**
		 * 点击标题栏的触发事件
		 * @param event
		 */
		onTitleClick : function(event){
			var target = event.getTarget(),
				trigger = HL.dom.findParent(target, 'li'),
				nodetype = target.nodeName;

			if( /^i$/i.test(target.nodeName)){
				this.removeTab(trigger.id);
			} else if ( !HL.dom.hasClass(trigger, this.currentCls) ){
				this.activeTab(trigger.id);
			}
		},

		/**
		 * 点击内容区域的触发事件
		 * @param event
		 */
		onPanelClick : function(event){
			
		}
		
	});

})(HL);