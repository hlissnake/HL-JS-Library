/*!
 * HL JS Library
 * Copyright(c) 2011 huang long.
 */

/**
 * 矢量数字时钟UI控件类
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
		      '<div style="float:left;margin-top:20px"><p><strong>路</strong></p><p><strong>路</strong></p></div>',
			  '<div id="min' + id + '" style="float:left"></div>',
			  '<div style="float:left;margin-top:20px"><p><strong>路</strong></p><p><strong>路</strong></p></div>',
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

		// 秒针个位数进位时，十位数近一
		this.second[1].on('carry', function(){
			this.second[0].add();
		}, this);
		// 秒针十位数进位时，分针个位数近一
		this.second[0].on('carry', function(){
			this.min[1].add();
		}, this);
		// 分针个位数进位时，校对系统时间
		this.min[1].on('change', function(){
			this.checkTime();
		}, this);
	},

	/**
	 * 时钟开始计时
	 */
	run : function(){
		this.checkTime();
		this.second[1].count(1000);
	},

	/**
	 * 检测系统时间，校对当前时间
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
