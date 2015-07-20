/*!
 * HL JS Library 3.3.1
 * Copyright(c) 2011 huang long.
 */
HL.ui.DigitalNumber = Class( HL.ui.Base, {
	
	tpl : [ '<div class="top"></div>',
		    '<div class="left"></div>',	
		    '<div class="center"></div>',
		    '<div class="right"></div>',
		    '<div class="top"></div>',
		    '<div class="left"></div>',	
		    '<div class="center"></div>',
		    '<div class="right"></div>',
		    '<div class="top"></div>'],
			
	shape : [[1,1,1,0,1,1,1], // 0
	         [0,0,1,0,0,1,0], // 1
			 [1,0,1,1,1,0,1], // 2
			 [1,0,1,1,0,1,1], // 3
			 [0,1,1,1,0,1,0], // 4
			 [1,1,0,1,0,1,1], // 5
			 [1,1,0,1,1,1,1], // 6
			 [1,0,1,0,0,1,0], // 7
			 [1,1,1,1,1,1,1], // 8
			 [1,1,1,1,0,1,1]],// 9

	maxbit : 9,

	init : function(config){
		var number = 0, loop = {},
			allCls = config.allCls || 'all';

		this.setNumber = function(n){
			number = n;
		};
		this.getNumber = function(){
			return number;
		};
		this.getAllCls = function(){
			return allCls;
		};
		this.setAllCls = function(cls){
			allCls = cls;
		};
		this.count = function(frequency){
			if(typeof frequency === 'string'){
				frequency = parseInt(frequency);
			} else if(typeof frequency !== 'number'){
				return;
			}
			loop = this.add.createInterval(frequency, this);
			loop.run();
		};
		this.stopCount = function(){
			loop.stop();
		};
		
		config.maxbit = config.maxbit || this.maxbit;
		this.super.init.call(this, config);
	},
	
	renderUI : function(){
		
		this.body = HL.dom.createEl('div', {
			className : this.getAllCls(),
			innerHTML : this.tpl.join('')
		});
		this.container.appendChild(this.body);
		
		this.fleshUI(this.number || 0);

		this.super.renderUI.call(this);
	},
	
	fleshUI : function(number){
		var div, array = [], i, len,
			shape = this.shape[number];
		div = this.body.querySelectorAll('div');
		for(i=0,len=div.length; i < len; i++){
			array[i] = div[i];
		}
		array.splice(2,1);
		array.splice(5,1);
		array.each(function(i, v, a){
			v.style.visibility = shape[i] ? 'visible' : 'hidden';
		});
	},
	
	set : function(n){
		if(n > 9) 
			return;
		if(n !== this.getNumber()){
			this.fleshUI(n);
			this.setNumber(n);
			this.fire('change', this.getNumber(), this);
			if(n === 0)
				this.fire('carry', this);
		}
	},
	
	add : function(){
		var n = this.getNumber() + 1;
		if(n > this.maxbit) n = 0;
		this.fleshUI(n);
		this.set(n);
	},
	
	minus : function(){
		var n = this.getNumber() - 1;
		if(n < 0) n = this.maxbit;
		this.fleshUI(n);
		this.set(n);
	}
});