/*!
 * HL JS Library
 * Copyright(c) 2011 huang long.
 */

/**
 * Grid表格 UI控件类
 */
HL.ui.Grid = HL.Class( HL.ui.Base, {
	
	body : {},
	
	data : {},
	
	currentHead : {},
	
	currentRow : {},
	
	currentCell : {},
	
	init : function(config){
		var thCls = 'thClass',
			rowCls = 'rowClass',
			cellCls = 'cellClass',
			hoverCls = 'hover',
			contextCls = 'contextClass',
			selectCls = 'selected',
			tableCls = 'tableClass',
			tpl;

		this.getThCls = function(){
			return thCls;
		};
		this.getRowCls = function(){
			return rowCls;
		};
		this.getCellCls = function(){
			return cellCls;
		};
		this.getContextCls = function(){
			return contextCls;
		};
		this.getHoverCls = function(){
			return hoverCls;
		};
		this.getSelectCls = function(){
			return selectCls;
		};
		this.getTableCls = function(){
			return tableCls;
		};

		this.super.init.call(this, config);
	},
	
	renderUI : function(){
		var id = this.id, cm = this.cm,
			i, len, record, c, 
			body = ['<table class=' + this.getTableCls() + '><thead><tr>'];
		
		for(i = 0, len = cm.length; i < len; i++){
			body.push('<th' + (this.getThCls() ? ' class=' + this.getThCls() : '') + '><div>');
			body.push(cm[i]);
			body.push('</div></th>');
		}
		body.push('</tr></thead>');
		
		body.push('<tbody>');
		for(i = 0, len = this.ds.data.length; i < len; i++){
			
			body.push('<tr' + (this.getRowCls() ? ' class=' + this.getRowCls() : '') + '>');
			record = this.ds.data[i];
			
			for(c = 0; c < record.length; c++ ){
				body.push('<td' + (this.getCellCls() ? ' class=' + this.getCellCls() : '') + '>');
				body.push('<div' + (this.getContextCls() ? ' class=' + this.getContextCls() : '') + '><span>');
				body.push(record[c]);
				body.push('</span></div></td>');
			}
			body.push('</tr>');
		}
		body.push('</tbody></table>');
		
		this.body = document.createElement('div');
		this.body.id = id;
		body = body.join('');
		this.body.innerHTML = body;
		
		this.container.appendChild(this.body);
		
		this.super.renderUI.call(this);
	},
	
	initEvent : function(){

		HL.on(this.body, 'mousedown', this.onMouseDown, this);
		HL.on(this.body, 'click', this.onClick, this);
		HL.on(this.body, 'keydown', this.onKeyDown, this);
		HL.on(this.body, 'mousemove', this.onMouseMove, this);
		HL.on(this.body, 'mouseover', this.onMouseOver, this);
		HL.on(this.body, 'mouseout', this.onMouseOut, this);
		
		this.on('cellclick', function(r, e){
			if(this.selected !== this.currentCell){
				if(this.selected){
					HL.dom.removeClass(this.selected, this.getSelectCls());
				}
				this.selected = this.currentCell;
				HL.dom.addClass(this.currentCell, this.getSelectCls());
			}
		});
		this.on('rowmouseover', function(r, e){
			HL.dom.addClass(this.currentRow, this.getHoverCls());
		});
		this.on('rowmouseout', function(r, e){
			this.clearHoverCls();
		});
		this.super.initEvent.call(this);
	},

	/**
	 * 清除鼠标滑过的效果样式
	 */
	clearHoverCls : function(){
		var rows = this.getRow(),
			ths = HL.q(this.body, 'tr th', true),
			cls = this.getHoverCls();
		rows.each(function(i, v, a){
			HL.dom.removeClass(v, cls);
		});
		ths.each(function(i, v, a){
			HL.dom.removeClass(v, cls);
		});
	},

	/**
	 * 事件代理模式执行函数
	 * @param eventName
	 * @param e
	 */
	processHandler : function(eventName, e){
		var row, cell, 
			t = e.getTarget(),
			head = this.getHeadIndex(t);
		this.currentEl = t;
		if(head !== false){
			this.fire( 'head' + eventName, head, e);
		} else {
			row = this.getRowIndex(t);
			if(row !== false){
				this.fire( 'row' + eventName, row, e);
				cell = this.getCellIndex(t, row);
				if(cell !== false){
					this.fire( 'cell' + eventName, row, cell, e);
				}
			}
		}
	},

	/**
	 * 查询出DOM元素在Grid标题上的相应位置
	 * @param t
	 * @returns
	 */
	getHeadIndex : function(t){
		var i, len,
			h = HL.dom.findParent(t, 'th'),
			th = HL.q(this.body, 'tr th', true);
		
		for(i = 0, len = th.length; i < len; i++){
			if(th[i] === h) {
				this.currentHead = h;
				return i;
			}
		}
		this.currentHead = {};
		return false;
	},

	/**
	 * 取得Grid所有行
	 */
	getRow : function(){
		return HL.q(this.body, 'tbody tr.' + this.getRowCls(), true);
	},

	/**
	 * 查询出DOM元素在Grid列上的相应位置
	 * @param t
	 * @returns
	 */
	getRowIndex : function(t){
		var i, len,
			row = HL.dom.findParent(t, 'tr.' + this.getRowCls()),
			tr = this.getRow();
		
		for(i = 0, len = tr.length; i < len; i++){
			if(tr[i] === row){
				this.currentRow = row;
				return i;
			}
		}
		this.currentRow = {};
		return false;
	},

	/**
	 * 查询出单元格的相应位置
	 * @param t
	 * @param r
	 * @returns
	 */
	getCellIndex : function(t, r){
		var i, len,
			cell = HL.dom.findParent(t, 'td.' + this.getCellCls()),
			tr = this.getRow(),
			td = HL.q(tr[r], 'td.' + this.getCellCls(), true);
		
		for(i = 0, len = td.length; i < len; i++){
			if(td[i] === cell){
				this.currentCell = cell;
				return i;
			}
		}
		this.currentCell = {};
		return false;
	},

	onMouseDown : function(e){
		this.processHandler('mousedown', e);
		if(e.button == 2){
			this.processHandler('contextmenu', e);
		}
	},
	
	onClick : function(e){
		this.processHandler('click', e);
	},
	
	onKeyDown : function(e){
		this.processHandler('keydown', e);
	},
	
	onMouseMove : function(e){
		this.processHandler('mousemove', e);
	},
	
	onMouseOver : function(e){
		this.processHandler('mouseover', e);
	},
	
	onMouseOut : function(e){
		this.processHandler('mouseout', e);
	}
});
