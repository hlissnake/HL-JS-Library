/**
 * 显示年份控件
 * 主调用函数: showYear(this,[object],showYear(this)，
 * 其中[object]是控件输出的控件名，举两个例子：
 * (1)<input name=txt><input type=button value=showYear onclick="showYear(this,txt)">
 * (2)<input onfocus="showYear(this)">
 *说明：
 * 默认返回的年份格式如：2011
 * create by Wang_xq
 */

var strFrame="";
//------------------ 整体的样式 ---------------------------//
var body_style = "position:absolute;margin:0px;z-index:9999;background-color:#FFFFFF;border:1.5px solid #666666;width:200px;height:150px;left:0;top:0";//body样式
var line_style = "border-bottom:1 solid #6699CC";                                                       //横线样式
var button_base = "position:absolute;height:20px;border: 1px solid #CCCCCC;background-color:#EFEFEF;";  //功能按钮基础样式
var button_style = "top:125px;width:50px;" + button_base;                                               //功能按钮的样式
var td_year_style = "width:50px;height:28px;background-color:#D8F0FC;font-size:10pt;";                  //显示年的td的样式
var year_turn_style = "border:0;width:100%;height:30px;";                                               //标题按钮区的样式
var prev_button_style = "top:5px;left:10px;width:20px;" + button_base;                                  //向上翻年的按钮样式
var line_button_style = "top:5px;left:90px;width:20px;" + button_base;																	//横线间隔的按钮样式
var next_button_style = "top:5px;left:169px;width:20px;" + button_base;																	//向下翻年的按钮样式
var year_head_start_style = "position:absolute;top:5px;left:35px;width:50px;text-align:center;";        //开始年份标题的样式
var year_head_end_style   = "position:absolute;top:5px;left:115px;width:50px;text-align:center;";       //结束年份标题的样式

document.writeln('<iframe id=endDateLayer frameborder=0 style="position: absolute; z-index: 9998; display: none"></iframe>');
strFrame+='<div id="divDate" style="' + body_style + '">';
//前进、后退按钮设置
strFrame+='<div align="center" id="divYearTurn" style="' + year_turn_style         + '">';
strFrame+='<input align="left"   type="button"  style="' + prev_button_style       + '" value="<" title="" onClick="parent.prevYear();">';
strFrame+='<input align="left"   type="text"    style="' + year_head_start_style   + '" id="yearHeadStart" readOnly>';
strFrame+='<input align="center" type="button"  style="' + line_button_style 		+ '" value="-">';
strFrame+='<input align="right"  type="text"    style="' + year_head_end_style   	+ '" id="yearHeadEnd"   readOnly>';
strFrame+='<input align="right"  type="button"  style="' + next_button_style 		+ '" value=">" title="" onClick="parent.nextYear();">';
strFrame+='</div>';
//年份选择区、输出年的选择
strFrame+='<div style="' + line_style + '"></div>';
strFrame+='<table width="100%" border=0 cellspacing=1 cellpadding=0  bgcolor=white onselectstart="return false">';
var n = 0;
for (var i=0;i<3;i++) {
strFrame+=' <tr align="center" id="trYear' + i + '" >';
 for (var j=0;j<4;j++){
strFrame+='<td  align="center" id="tdYear' + n + '" style="' + td_year_style + '"' +
  ' onClick="parent.onclickYear(this.innerText);" onMouseOver="parent.onOver(this);" onMouseOut="parent.onOut(this);">&nbsp;</td>';
  n++;
}
strFrame+=' </tr>';
}
strFrame+='</table>';
//功能按钮
strFrame+='<input align="left"   type="button"  style="' + button_style + ';left:15px;"  value="清空" title="" onClick="parent.clearSelect();" >';
strFrame+='<input align="center" type="button"  style="' + button_style + ';left:75px;"  value="今年" title="" onClick="parent.selectNow();">';
strFrame+='<input align="right"  type="button"  style="' + button_style + ';left:135px;" value="关闭" title="" onClick="parent.closeLayer();">';
strFrame+='</div>';

window.frames.endDateLayer.document.writeln(strFrame);
window.frames.endDateLayer.document.close();		//解决ie进度条不结束的问题

//------------------ 变量定义 ---------------------------//
var yearStart = 1000;                     	//可选择的开始年份
var yearEnd = 9999;                       	//可选择的结束年份
var nowYear = new Date();                   //当前年份
var initYear = nowYear.getFullYear();     	//定义年的变量的初始值
var tempYear = nowYear.getFullYear();
var arrYear=new Array(12);          				//定义写年份的数组
var outObject;    //外部对象
var outButton;		//点击的按钮
var odatelayer=window.frames.endDateLayer.document.all;		//存放年份对象
var odatelayer=window.endDateLayer.document.all;

//主调函数
function showYear(tt,obj)
{
	if (arguments.length >  2){alert("对不起！传入本控件的参数太多！");return;}
	if (arguments.length == 0){alert("对不起！您没有传回本控件任何参数！");return;}
	var dads  = document.all.endDateLayer.style;
	var th = tt;
	var ttop  = tt.offsetTop;     //TT控件的定位点高
	var thei  = tt.clientHeight;  //TT控件本身的高
	var tleft = tt.offsetLeft;    //TT控件的定位点宽
	var ttyp  = tt.type;          //TT控件的类型
	while (tt = tt.offsetParent){ttop+=tt.offsetTop; tleft+=tt.offsetLeft;}
	dads.top  = (ttyp=="image")? ttop+thei : ttop+thei+6;
	dads.left = tleft;
	outObject = (arguments.length == 1) ? th : obj;
	outButton = (arguments.length == 1) ? null : th;	//设定外部点击的按钮


	 //如果输入框中有值，则将日期初始化为当前值
	 var strValue = YearTrim(outObject.value);
	 if(strValue != "" && strValue.length == 4)
	 {
	 	nowYear.setFullYear(strValue,1,1);
	 	initYear = nowYear.getFullYear();
		tempYear = nowYear.getFullYear();
	 }
	 //防止出现2010-2010，直接前翻
	 if(((tempYear + "").substring(0,3) + "0") == yearEnd)
	 	tempYear = tempYear - 10;
	 setYear(tempYear);
	 writeHead(tempYear);

	dads.display = '';

	try
	{
		event.returnValue=false;
	}
	catch (e)
	{
		;
	}
	//----- 设定弹出框的高度和宽度 ---
	if (dads != null) {
        dads.width = '220px';
        dads.height = '180px';
    }
}

//取出空格
function YearTrim(str)
{
 	return str.replace(/(^\s*)|(\s*$)/g,"");
}

//向span标签中写入年数据
function writeHead(yy)
{
	var headStart = (yy+"").substring(0,3) + "0";
	var headEnd = (yy+"").substring(0,3) + "9";
	if(headStart < yearStart) headStart = yearStart;
	if(headEnd > yearEnd) headEnd = yearEnd;
	odatelayer.yearHeadStart.innerText = headStart;
	odatelayer.yearHeadEnd.innerText   = headEnd;
}

//设置显示年
function setYear(yy)
{
	 //将显示框的内容全部清空
	 for (var i = 0; i < 12; i++)
	 {
		arrYear[i]="";
	 }
	 for (var i = 0; i < 12; i++)
	 {
		var tempNum = Number((yy + "").substring(0,3) + "0")-1+i;
		if(tempNum > yearEnd || tempNum < yearStart) tempNum = "";
		arrYear[i] = tempNum;
	 }
	 for (var i = 0; i < 12; i++){
		var da = eval("odatelayer.tdYear"+i)
		if(i==0 || i ==11 )
			da.style.backgroundColor = "#fdffff";
		if(arrYear[i] != "")
		{
		 	da.innerHTML = arrYear[i];
		 	//如果是当前选择的年份，则改变颜色
		 	if(arrYear[i] == initYear )
		 	{
		  		da.style.backgroundColor = "#00cc33";
		 	}
		 	else if(i==0 || i ==11)
		 	{
				da.style.backgroundColor = "#F2F2F2";
			}
			else
			{
		   		da.style.backgroundColor = "#E0E0E0";
		  	}
		  	da.style.cursor = "hand";
		 }
		 else
		 {
		  	da.innerHTML="";da.style.backgroundColor="#F2F2F2";da.style.cursor="default"
		 }
	 }
}

//鼠标经过年份
function onOver(td)
{
	if(td.innerHTML != "") td.style.backgroundColor="#FFCC00";
}
//鼠标离开年份
function onOut(td)
{
	var id = td.getAttribute("id");
	if(td.innerHTML == initYear)
	{
		td.style.backgroundColor="#00cc33";
	}
	else if(id == "tdYear0" || id == "tdYear11" || td.innerHTML == "")
	{
		td.style.backgroundColor="#F2F2F2";
	}
	else
	{
		td.style.backgroundColor="#E0E0E0";
	}
}
//取出空格
function YearTrim(str)
{
 	return str.replace(/(^\s*)|(\s*$)/g,"");
}
//点击选择某个年份
function onclickYear(selectedValue)
{
	if(selectedValue == "") return;
	initYear = selectedValue;
	setValue(initYear);
	closeLayer();
}
//选择今年
function selectNow()
{
	setValue((new Date()).getFullYear());
 	closeLayer();
}
//清空
function clearSelect()
{
	 setValue("");
	 closeLayer();
}
//往前翻 Year
function prevYear()
{
	if(tempYear > 999 && tempYear < 10000)
	{
		tempYear = tempYear - 10;
	}
	else
	{
		tempYear = yearStart;
	}
	if(yearStart < ((tempYear + "").substring(0,3) + "9")) //最小年份必须小于前翻后的最大年份，才可以前翻
	{
		setYear(tempYear);
		writeHead(tempYear);
	}
	else
	{
		if(tempYear != yearStart) tempYear = tempYear + 10;
	}
}
//往后翻 Year
function nextYear()
{
	if(tempYear > 999 && tempYear <10000)
	{
		tempYear = tempYear + 10;
	}
	else
	{
		tempYear = yearEnd;
	}
	if(yearEnd > ((tempYear + "").substring(0,3) + "0")) //最大年份必须大于后翻后的最小年份，才可以后翻
	{
		setYear(tempYear);
		writeHead(tempYear);
	}
	else
	{
		if(tempYear != yearEnd) tempYear = tempYear - 10;
	}
}

//任意点击函数 任意点击时关闭该控件
function document.onclick()
{
  with(window.event){
  if (srcElement != outObject && srcElement != outButton)
    closeLayer();
  }
}

//Esc键函数
function document.onkeyup()		//按Esc键关闭，切换焦点关闭
  {
    if (window.event.keyCode==27){
		if(outObject)outObject.blur();
		closeLayer();
	}
	else if(document.activeElement)
		if(document.activeElement != outObject && document.activeElement != outButton)
		{
			closeLayer();
		}
  }

//层关闭
function closeLayer()
  {
	var o = document.getElementById("endDateLayer");
	if (o != null)
	{
		o.style.display="none";
	}
  }

//层展现
function showLayer()
  {
    document.all.endDateLayer.style.display="";
  }

//设置返回的年份
function setValue(selectYearValue)
{
	 outObject.value = selectYearValue;
}