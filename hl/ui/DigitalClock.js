/*!
 * HL JS Library
 * Copyright(c) 2011 huang long.
 */

/**
 * ʸ������ʱ��UI�ؼ���
 */
HL.ui.DigitalClock = HL.Class(HL.ui.Base, {
	
	hour : [{}, {}], 
	
	min : [{}, {}], 
	
	second : [{}, {}],
	
	init : function(config){
		this.super.init.call(this, config);
	},

	renderUI : function(){
		var id = this.id,
			cl = ['<div id="hour' + id + '" style="float:left"></div>',
		      '<div style="float:left;margin-top:20px"><p><strong>·</strong></p><p><strong>·</strong></p></div>',
			  '<div id="min' + id + '" style="float:left"></div>',
			  '<div style="float:left;margin-top:20px"><p><strong>·</strong></p><p><strong>·</strong></p></div>',
			  '<div id="second' + id + '" style="float:left"></div>'];

		this.body = HL.dom.createEl('div', {id : id});
		this.body.innerHTML = cl.join('');
		this.container.appendChild(this.body);

		this.hour.each(function(i, v, a){
			a[i] = new HL.ui.DigitalNumber({
				renderID : 'hour' + id, allCls : 'clocknum'
			});
		});
		this.min.each(function(i, v, a){
			var bit = i === 1 ? 9 : 5;
			a[i] = new HL.ui.DigitalNumber({
				renderID : 'min' + id, maxbit : bit, allCls : 'clocknum'
			});
		});
		this.second.each(function(i, v, a){
			var bit = i === 1 ? 9 : 5;
			a[i] = new HL.ui.DigitalNumber({
				renderID : 'second' + id, maxbit : bit, allCls : 'clocknum'
			});
		});

		this.super.renderUI.call(this);
	},

	initEvent : function() {

		// �����λ����λʱ��ʮλ����һ
		this.second[1].on('carry', function(){
			this.second[0].add();
		}, this);
		// ����ʮλ����λʱ�������λ����һ
		this.second[0].on('carry', function(){
			this.min[1].add();
		}, this);
		// �����λ����λʱ��У��ϵͳʱ��
		this.min[1].on('change', function(){
			this.checkTime();
		}, this);
	},

	/**
	 * ʱ�ӿ�ʼ��ʱ
	 */
	run : function(){
		this.checkTime();
		this.second[1].count(1000);
	},

	/**
	 * ���ϵͳʱ�䣬У�Ե�ǰʱ��
	 */
	checkTime : function(){
		var time = new Date(),
			h = time.getHours(),
			m = time.getMinutes(),
			s = time.getSeconds();
		
		this.hour[0].set(parseInt(h / 10));
		this.hour[1].set(h % 10);
		this.min[0].set(parseInt(m / 10));
		this.min[1].set(m % 10);
		this.second[0].set(parseInt(s / 10));
		this.second[1].set(s % 10);
	}
});
