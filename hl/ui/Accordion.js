/**
 * 
 */

HL.ui.Accordion = Class( HL.ui.Base, {

	tpCls : 'box-top',
	
	btCls : 'box-bottom',
	
	hdCls : 'box-hd',
	
	bdCls : 'box-bd',
	
	accordCls : 'box-Panel',
	
	collapseCls : 'collapse',
	
	expandCls : 'expand',
	
	activeIndex : -1,
	
	length : 0,

	init : function(config){
		this.super.init.call(this, config);
	}, 

	renderUI : function(){
		var i = 0, context,
			len = this.accords.length,
			bd = ['<s class="' + this.tpCls + '"><b></b></s>'];

		this.length = len;	
		for(; i < len; i++){
			if(typeof this.accords[i].context === 'string'){
				context = this.accords[i].context;
			} else if (typeof this.accords[i].context === 'object'){
				context = '';
			}
			bd.push('<div class="' + this.hdCls + '">');
			bd.push('<i class="' + this.collapseCls + '"></i><h3>' + this.accords[i].title + '</h3></div>');
			bd.push('<div class="' + this.bdCls + '" index="' + i + '" style="display : none">' + context + '</div>');
		}
		bd.push('<s class="' + this.btCls + '"><b></b></s>');
		
		this.body = HL.dom.createEl('div', {
			className : this.accordCls,
			innerHTML : bd.join('')
		});
		this.container.appendChild(this.body);
		this.super.renderUI.call(this);
	},

	initEvent : function(){
		HL.on(this.body, 'click', this.onAccordionClick, this);
	},
	
	addAccordion : function(accord){
		var bd = [];
		if( accord.title && accord.context ){
			bd.push('<div class="' + this.hdCls + '">');
			bd.push('<i class="' + this.collapseCls + '"></i><h3>' + this.hdCls + '">' + accord.title + '</h3></div>');
			bd.push('<div class="' + this.bdCls + '" index="' + this.length + '">' + accord.context + '</div>');
			
			this.length++;
			this.body.appendChlid(bd.join(''));
		}
	},

	onAccordionClick : function(ev) {
		var target = ev.getTarget(),
			t = HL.dom.findParent(target, 'div.' + this.hdCls),
			b = HL.dom.findParent(target, 'div.' + this.bdCls),
			ads, i;

		if(t){
			ads = query(this.body, 'div.' + this.bdCls, true);
			i = query(t, 'div i');
			if(i.className === this.expandCls){

				t.nextSibling.style.display = 'none';
				i.className = this.collapseCls;
				this.activeIndex = -1;

			} else {

				t.nextSibling.style.display = 'block';
				i.className = this.expandCls;
				
				if(this.activeIndex >= 0){
					ads[this.activeIndex].style.display = 'none';
					i = query(ads[this.activeIndex].previousSibling, 'div i');
					i.className = this.collapseCls;
				}
				this.activeIndex = parseInt(t.nextSibling.getAttribute('index'));
			}
		} else if (b) {
			this.fire('panelClick', this.activeIndex, ev);
		}
	}

});