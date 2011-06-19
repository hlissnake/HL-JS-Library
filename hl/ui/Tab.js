/*!
 * HL JS Library 
 * Copyright(c) 2011 huang long.
 */
(function(HL){

	/**
	 * Tab��ǩҳUI�ؼ���
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
		 * �����������ƶ�
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
		 * �����������ƶ�
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
			
			// ����Tabҳ�� ִ������߼�
			this.on('add', this.onAdd);
			// ɾ��Tabҳ�� ִ������߼�
			this.on('removed', this.onRemove);
			// ����Tabҳ�� ִ������߼�
			this.on('actived', this.onActive);

			this.super.initEvent.call(this);
		},

		/**
		 * ���ӱ�ǩҳ�󴥷��ļ�������
		 * @param trigger
		 * @param ct
		 */
		onAdd : function(trigger, ct){

			var head = this.ul.parentNode,
				ulcw = head.clientWidth,
				left = HL.q(head, 'i.' + this.leftbtnCls),
				right = HL.q(head, 'i.' + this.rightbtnCls),
				movingTask;
				// ȡ������Tabҳ���ܿ��
				this.ulWidth = trigger.offsetLeft + trigger.clientWidth;
				this.ulcw = ulcw;
			
			// Tabҳ������ ul��Ŀ�ȷ�Χ���������һ�����ť��δ����
			if( (this.ulWidth > ulcw) && (!left && !right)){
				// �������һ����� ��ť
				left = HL.dom.createEl('i', {
					className : this.leftbtnCls
				});
				right = HL.dom.createEl('i', {
					className : this.rightbtnCls
				});
				right.style.left = ulcw - 20 + 'px'; // �����һ���ť��ˮƽλ��
				head.appendChild(right);
				head.insertBefore(left, head.firstChild);
				
				
				// �����ߵİ�ť��UL ��ʼ���󻬶���movingTask��һ�����������߳�
				HL.on(left, 'mousedown', function(){
					movingTask = this.moveLeft.createInterval(this.sleekFrequency, this);
					movingTask.run();
				}, this);
				// �ſ���ߵİ�ť��UL ֹͣ���󻬶�
				HL.on(left, 'mouseup', function(){
					movingTask.stop();
				}, this);

				// ����ұߵİ�ť��UL ��ʼ���һ�����movingTask��һ�����������߳�
				HL.on(right, 'mousedown', function(){
					movingTask = this.moveRight.createInterval(this.sleekFrequency, this);
					movingTask.run();
				}, this);
				// �ſ��ұߵİ�ť��UL ֹͣ���һ���
				HL.on(right, 'mouseup', function(){
					movingTask.stop();
				}, this);

			}
		},

		/**
		 * �ƶ���ǩҳ�󴥷��ļ�������
		 */
		onRemove : function(){
			var head = this.ul.parentNode,
				ulcw = head.clientWidth,
				left = HL.q(head, 'i.' + this.leftbtnCls),
				right = HL.q(head, 'i.' + this.rightbtnCls);
			this.ulWidth = this.ul.lastChild.offsetLeft + this.ul.lastChild.clientWidth;
			// ���������Ƿ񳬳���δ������ɾ�����һ�����ť
			if( (this.ulWidth <= ulcw) && (left && right)) {
				HL.dom.removeEl(left, head);
				HL.dom.removeEl(right, head);
				this.ul.style.left = '0px';
			}
		},

		/**
		 * ����ĳ��ǩҳ��ļ�������
		 * @param activehd
		 */
		onActive : function(activehd){
			var head = this.ul.parentNode,
				ulcw = head.clientWidth,
				width = activehd.offsetLeft + activehd.clientWidth;
			// ������Tab��ǩ�������Ҳ�
			if( ulcw - width - 20 <= this.ul.offsetLeft){
				this.ul.style.left = ulcw - width - 20 + 'px';
			}
			// ������Tab��ǩ���������
			if( activehd.offsetLeft + this.ul.offsetLeft < 0){
				this.ul.style.left = 0 - activehd.offsetLeft + 'px';
			}
		},

		/**
		 * �����±�ǩҳ
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

			// �Ƿ񳬹����Tabҳ������
			if(this.tabnum < this.max){
				// �Ƿ�ɹر�
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
		 * ����ĳ��ǩҳ
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
		 * �Ƴ�ĳ��ǩҳ
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
		 * �жϱ�ǩҳ�Ƿ����
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
		 * ����������Ĵ����¼�
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
		 * �����������Ĵ����¼�
		 * @param event
		 */
		onPanelClick : function(event){
			
		}
		
	});

})(HL);