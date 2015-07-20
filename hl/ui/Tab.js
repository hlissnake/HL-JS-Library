/*!
 * HL JS Library 0/5
 * Copyright(c) 2011 huang long.
 */
HL.ui.Tab = Class( HL.ui.Base, {
	
	panelCls : 'tab-panel',
	
	tpCls : 'tab-top',

	btCls : 'tab-bottom',
	
	hdCls : 'tab-hd',
	
	currentCls : 'tab-active',
	
	inactiveCls : 'tab-inactive',
	
	triggerCls : 'tab-trigger',
	
	bdCls : 'tab-body',
	
	contextCls : 'tab-context',

	tabs : {},

	tabnum : 0,

	max : 5,

	activeid : false,

	init : function(config){
		this.super.init.call(this, config);
	},
	
	renderUI : function(){
		var b = [];

		b.push('<s class="' + this.tpCls + '"><b></b></s>');
		b.push('<ul class="' + this.hdCls + '">');
		b.push('</ul>');
		b.push('<div class="' + this.bdCls + '">');
		b.push('</div>');
		b.push('<s class="' + this.btCls + '"><b></b></s>');
		
		this.body = HL.dom.createEl('div', {
			id : this.id, 
			className : this.panelCls,
			innerHTML : b.join('')
		});
		this.ul = query(this.body, 'ul.' + this.hdCls);
		this.bd = query(this.body, 'div.' + this.bdCls);
		
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
	},

	addTab : function(id, tabname, context, uncloseble){
		var hd = this.ul,
			body = query(this.body, 'div'),
			trigger,
			ct, i;

		if(this.tabnum < this.max){
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
				
				if(context.class && context.params){
					HL.append(context.params, {
						renderID : ct.id
					});
					new context.class(context.params);
				}
			}
			this.tabnum++;
			this.tabs[trigger.id] = ct.id;
			this.fire('add', trigger.id, ct.id);
			return true;
		} else {
			return false;
		}
	},

	activeTab : function(id){
		var activeHd,
			activePanel,
			lastTab,
			lastPanel,
			titles,
			panels;
		
		if(typeof id === 'number'){
			titles = query(this.body, 'ul.' + this.hdCls + ' li', true),
			panels = query(this.body, 'div.' + this.contextCls, true);
			activeHd = titles[id];
			activePanel = panels[id];
		} else {
			activeHd = query(this.ul, '#' + id);
			activePanel = query(this.body, '#' + this.tabs[id]);
		}
		if(!activeHd) return;
		if(this.activeid){
			lastTab = query(this.ul, '#' + this.activeid);
			lastPanel = query(this.body, '#' + this.tabs[this.activeid]);
			HL.dom.removeClass(lastTab, this.currentCls);
			HL.dom.addClass(lastTab, this.inactiveCls);
			lastPanel.style.display = 'none';
		}

		this.activeid = activeHd.id;
		HL.dom.removeClass(activeHd, this.inactiveCls);
		HL.dom.addClass(activeHd, this.currentCls);
		activePanel.style.display = 'block';
		
		this.fire('actived', this.activeid);
	},
	
	removeTab : function(id){
		var activeHd,
			activePanel,
			titles,
			panels;
		if(typeof id === 'number'){
			titles = query(this.body, 'ul.' + this.hdCls + ' li', true),
			panels = query(this.body, 'div.' + this.contextCls, true);
			activeHd = titles[id];
			activePanel = panels[id];
		} else {
			activeHd = query(this.body, '#' + id);
			activePanel = query(this.body, '#' + this.tabs[id]);
		}
		
		if(this.fire('beforeremove', activeHd.id)){
			this.tabnum--;
			this.tabs[activeHd.id] = false;
			HL.dom.removeEl(activeHd, this.ul);
			HL.dom.removeEl(activePanel, query(this.body, 'div.' + this.bdCls));
			
			this.fire('removed', activeHd.id);
			
			if(this.activeid === activeHd.id){
				this.activeid = false;
				this.activeTab(0);
			}
		}
	},
	
	hasTab : function(id){
		if(this.tabs[id])
			return true;
		else
			return false;
	},
	
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
	
	onPanelClick : function(event){
		
	}
	
});