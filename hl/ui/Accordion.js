/*!
 * HL JS Library
 * Copyright(c) 2011 huang long.
 */

/**
 * Accordion�ַ��� UI�ؼ���
 */
HL.ui.Accordion = HL.Class( HL.ui.Base, {

	tpCls : 'box-top',
	
	btCls : 'box-bottom',
	
	hdCls : 'box-hd',

	hdClickCls : 'box-hd-click',
	
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
			// �Ϸ���Բ��Ч��
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
		// �·���Բ��Ч��
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
		this.super.initEvent.call(this);
	},

	/**
	 * ����һ��������
	 * @param accord
	 */
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

	/**
	 * ���������ʱ�Ĵ����¼�
	 * @param ev
	 */
	onAccordionClick : function(ev) {
		var target = ev.getTarget(),
			t = HL.dom.findParent(target, 'div.' + this.hdCls),
			b = HL.dom.findParent(target, 'div.' + this.bdCls),
			ads, i, h, style;

		// ������Ǳ�����
		if(t){
			ads = HL.q(this.body, 'div.' + this.bdCls, true);
			i = HL.q(t, 'div i');
			if(i.className === this.expandCls){

				t.nextSibling.style.display = 'none';
				i.className = this.collapseCls;
				this.activeIndex = -1;
				//HL.dom.removeClass(t, this.hdClickCls);

			} else {
				
				//HL.dom.addClass(t, this.hdClickCls);
				b = t.nextSibling;
				// ����չ���ĸ߶ȣ�ʵ�ֶ���Ч��
				b.style.display = 'block';
				h = HL.dom.getHeight(b);
				b.style.height = '0';
				HL.dom.animate(b, {
					height : h
				}, 300, true);
				
				//b.style.left = t.clientLeft + t.clientWidth + 'px';
				//b.style.top = t.clientTop + 'px';
				i.className = this.expandCls;
				
				if(this.activeIndex >= 0){
					ads[this.activeIndex].style.display = 'none';
					//HL.dom.removeClass(ads[this.activeIndex].previousSibling, this.hdClickCls);
					i = HL.q(ads[this.activeIndex].previousSibling, 'div i');
					i.className = this.collapseCls;
				}
				this.activeIndex = parseInt(t.nextSibling.getAttribute('index'));
			}
			this.fire('headClick', this.activeIndex, ev);
		}
		// ���������������
		else if (b) {
			this.fire('panelClick', this.activeIndex, ev);
		}
	}

});