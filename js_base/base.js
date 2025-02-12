var sAgent	= navigator.userAgent.toLowerCase();
var IE		= false;
var IE6		= false;
var FF 		= false;
var OP 		= false;
var NC 		= (document.layers); // Netscape?

if ( document.all && document.getElementById && !window.opera ) {
	IE = true;
}

if ( !document.all && document.getElementById && !window.opera ) {
	FF = true;
}

if ( window.opera && document.getElementById) {
	OP = true;
}

if ( sAgent.indexOf("msie 6.") != -1 && sAgent.indexOf("mac") == -1 && sAgent.indexOf("opera") == -1 ) {
	IE6 = true;
}
// http://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
window.mobilecheck = function() {
	var check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
};
window.isMobile = window.mobilecheck();

/* PROTO */
Array.prototype.InArray = function(value) {
	return (false === this.InArrayPos(value)) ? false :  true;
};
Array.prototype.InArrayPos = function(value) {
	var l = this.length;
	for (var i = 0; i < l; i++)
		if (this[i] === value) return i;
	return false;
};

String.prototype.replaceAll = function(str1, str2, caseInsensitive) {
	return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(caseInsensitive?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
};
String.prototype.trim = function () {
	if (this) {
		s = this.replace(/^(\s)*/, '');
		s = s.replace(/(\s)*$/, '');
	} else {
		s = this;
	}
	return s;
};
/* END PROTO */

/* GENERAL */
function byid(id){return document.getElementById(id);}
function bytag(obj,tag){return obj.getElementsByTagName(tag);}
function dn() { }

function ApplyContext(Func, Context) {
	return function() {
		return Func.apply(Context, arguments);
	}
};

function preLoadImg(src) {
	imageObj		= new Image();
	imageObj.src	= src;
}

function trim(str) {
	if (str) {
		s = str.toString();
		s = s.replace(/^(\s)*/, '');
		s = s.replace(/(\s)*$/, '');
	} else { s = str; }
	return s;
}

function initChosen(selector, containerSelector) {
	if (!selector) {
		selector = '.chzn-select';
	}
	if (containerSelector) {
		selector = containerSelector + ' ' + selector;
	}
	$(selector).not('[data-no-chzn="true"]').chosen({
    	disable_search_threshold: 10
  	});
}
function updateChosen(selector, containerSelector) {
	if (!selector) {
		selector = '.chzn-select';
	}
	if (containerSelector) {
		selector = containerSelector + ' ' + selector;
	}
	$(selector).not('[data-no-chzn="true"]').trigger("liszt:updated").trigger("chosen:updated");

}
function initUniform(selector) {
	var containerSelector = selector;
	if (selector) {
		selector = selector + " input:checkbox, " + selector + " input:radio, " + selector + " input:file";
	} else {
		selector = "input:checkbox, input:radio, input:file";
	}
	$(selector).not('[data-no-uniform="true"],#uniform-is-ajax,input[type="file"]').uniform();

	initChosen('', containerSelector);
}
function resizeChosen(selector) {
	if (selector) {
		selector = selector + ' .chzn-select-100';
	} else {
		selector = '.chzn-select-100';
	}
	$(selector).not('[data-no-chzn="true"]').each(function() {
		var parent	= $(this).parent();
		var width	= parent.innerWidth();
		if (width) {
			width -= parseInt(parent.css("border-left-width"), 10);
			width -= parseInt(parent.css("border-right-width"), 10);
			width -= parseInt(parent.css("padding-right"), 10);
			width -= parseInt(parent.css("padding-left"), 10);
			$(this).next().css("width", width);
		}
	});
}
function updateUniform(selector) {
	if (selector) {
		selector = selector + " input:checkbox, " + selector + " input:radio, " + selector + " input:file";
		$.uniform.update(selector);
	} else {
		$.uniform.update();
	}
}
function initPlaceholder() {
	$.support.placeholder = false;
	var test = document.createElement('input');
	if('placeholder' in test) {
		$.support.placeholder = true;
	}

	if (!$.support.placeholder) {
		$('.placeholder-hidden').show();
	}
}
/* END GENERAL */
/* ALERTS */
function alertError(msg, suppressjGrowl) {
	if (!suppressjGrowl) {
		$.jGrowl(msg, {
			msgType: 'error'
		});
	}
	displayMessage('alert-danger', msg);
}

function alertWarning(msg, suppressjGrowl) {
	if (!suppressjGrowl) {
		$.jGrowl(msg, {
			msgType: 'warning'
		});
	}
	displayMessage('alert-warning', msg);
}

function alertMessage(msg, suppressjGrowl) {
	if (!suppressjGrowl) {
		$.jGrowl(msg, {
			msgType: 'message'
		});
	}
	displayMessage('alert-success', msg);
}

function displayMessage(type, msg) {
	var cntObj = byid('CntMessageId');
	if (cntObj) {
		cntObj.className 					= 'alert' + ((type) ? ' '+type : '');
		//byid('CntMessageIdText').innerHTML	= msg;
		cntObj.innerHTML					= msg;
		cntObj.style.display				= 'block';
	}
}
function closeMessageTimer(timer) {
	if (!timer) {
		timer = 5000;
	}
	setTimeout(closeMessage, timer);
}
function closeMessage(timer) {
	var cntObj = byid('CntMessageId');
	if (cntObj) {
		cntObj.style.display				= 'none';
	}
}
/* END ALERTS */

/* PopOver */
var PopOverState = {};
function hidePopOver(id) {
	if (PopOverState[id]) {
		$("#"+id).popover('hide');
	}
}
function showPopOver(id, elmId) {
	zsrv.get('/help/pop/'+id+'/'+elmId+'.html', ajaxPopOver);
}
function ajaxPopOver(msg) {
	if(zsrv.procResp(msg)) {
		var h	= msg.getValue('help');
		var t	= msg.getValue('title');
		var id	= msg.getValue('elmId');
		var p	= msg.getValue('placement');
		if (!p) {
			p = 'bottom';
		}
		PopOverState[id] = true;

		if (h) {
			$("#"+id).popover({
				title:		t,
				content:	h,
				trigger:	'click',
				placement:	p
			}).popover('show');
		}
	}
}
/* END PopOver */

/* FORMS */
function CheckAllCheckBoxes(form /*айдиха формы*/, value /*this.checked на чекбоксе на ивенте onchange*/, tpl /* только имя по шаблону*/) {
	var FormObj		= byid(form);
	var ElmObj;
	for (var a = 0; a < FormObj.elements.length; a++) {
		ElmObj = FormObj.elements[a];
		if ('checkbox' == ElmObj.type.toLowerCase()) {
			if (!tpl || (tpl && -1 != ElmObj.name.search(tpl))) {
				ElmObj.checked = value;
			}
		}
	}
	updateUniform();
}

function IsCheckBoxSelected(form /*айдиха формы*/, tpl /* только имя по шаблону*/) {
	var FormObj		= byid(form);
	var ElmObj;
	for (var a = 0; a < FormObj.elements.length; a++) {
		ElmObj = FormObj.elements[a];
		if ('checkbox' == ElmObj.type.toLowerCase()) {
			if (!tpl || (tpl && -1 != ElmObj.name.search(tpl))) {
				if (ElmObj.checked) {
					return true;
				}
			}
		}
	}
	return false;
}

function GetFormValue(form, element) {
	return  document.forms[form].elements[element].value;
}

function SetFormValue(form, element, value) {
	var obj = document.forms[form].elements[element];
	if (obj) {
		if (!obj.type) {
			for (a = 0; a < obj.length; a++) {
				if (value == obj[a].value) {
					obj[a].checked = true;
					if (obj[a].onclick) {
						obj[a].click();
					}
				} else {
					obj[a].checked = false;
				}
			}
		} else if ('text' == obj.type || 'select' == obj.type || 'select-one' == obj.type || 'hidden' == obj.type || 'textarea' == obj.type) {
			obj.value = value;
			if (obj.onchange) {
				obj.onchange();
			}
		} else if ('checkbox' == obj.type) {
			obj.checked = ((value) ? true : false);
		}
	}
}

function GetRadioValue(obj) {
	var a;
	for (a = 0; a < obj.length; a++) {
		if ((!obj[a].style.visible || 'visible' == obj[a].style.visible) && (!obj[a].style.display || 'block' == obj[a].style.display) && obj[a].checked) {
			return obj[a].value
		}
	}
	return 0;
}

function ChangeSelectElements(objId, elmArr, append) {
	var obj = byid(objId);
	if (obj) {
		if (!append) {
			obj.options.length = 0;
		}
		for (var a = 0; a < elmArr.length; a++) {
			var value		= elmArr[a][0];
			var uiValue		= elmArr[a][1];
			var selected	= ((elmArr[a][2]) ? true : false);
			var defSelected	= ((elmArr[a][3]) ? true : false);

			obj.options[obj.options.length] = new Option(uiValue, value, defSelected, selected);
		}
		// update choosen
		if (window.jQuery && 'chosen' == $(obj).attr('data-rel')) {
			$(obj).trigger("chosen:updated");
			//$(obj).trigger("liszt:updated");
		}
	}
}
/* END FORMS */

/* ELEMENTS */
function AllSelects(type) {
	var action = ((type) ? '' : 'hidden');
	if (IE) {
		var FormCount = document.forms.length;
		var ElmCount  = 0, a = 0, b = 0;
		var obj;
		for (a = 0; a < FormCount; a++) {
			ElmCount = document.forms[a].elements.length;
			for (b = 0; b < ElmCount; b++) {
				obj = document.forms[a].elements[b];
				if ('select' == obj.type || 'select-one' == obj.type) {
					obj.style.visibility = action;
				}
			}
		}
	}
	var ObjectsArr	= bytag(document, 'embed');
	var ObjectsCount= ObjectsArr.length;
	var obj;
	for (a = 0; a < ObjectsCount; a++) {
		obj = ObjectsArr[a];
		if (obj) {
			obj.style.visibility = action;
		}
	}
}

function getElementPosition(elem) {
	var w = elem.offsetWidth;
	var h = elem.offsetHeight;
	var l = 0;
	var t = 0;

	while (elem) {
	    l += elem.offsetLeft;
	    t += elem.offsetTop;
	    elem = elem.offsetParent;
	}

	return {"left":l, "top":t, "width": w, "height":h};
}

function getElementPositionRelative(elem, elem2) {
	var pos = getElementPosition(elem);
	var pos2= getElementPosition(elem2);

	var w = elem.offsetWidth;
	var h = elem.offsetHeight;

	return {"left": (pos.left - pos2.left), "top": (pos.top - pos2.top), "width": w, "height":h};
}
/* END ELEMENTS */

/* WINDOW */
var SocialPopUp;
function socialPopup(url, width, heigth) {
	SocialPopUp = popItUp(url, width, heigth);
}
function successSocialEnter() {
	// TODO cur
	setTimeout('SocialPopUp.close();/*window.location.reload();*/window.location.href="/exam.html";', 1000);
}
function popItUp(url, width, heigth) {
	if (!heigth) {
		heigth = 400;
	}
	if (!width) {
		width = 500;
	}
	newwindow = window.open(url, 'social', 'height='+heigth+',width='+width);
	if (window.focus) {newwindow.focus()}

	return newwindow;
}
function getScrollPosition() {
	var scrollTop, scrollLeft;

	if (IE || OP) {
		if (document.documentElement.scrollTop) {
			scrollTop	= document.documentElement.scrollTop;
			scrollLeft	= document.documentElement.scrollLeft;
		} else {
			scrollTop	= document.body.scrollTop;
			scrollLeft	= document.body.scrollLeft;
		}
	}

	if (FF) {
		scrollTop	= window.pageYOffset;
		scrollLeft	= window.pageXOffset;
	}

	return { 'x' : scrollLeft, 'y' : scrollTop };
}

function setScrollPosition(y, x) {
	var sp = getScrollPosition();

	if (!y)
		y = sp.y;
	if (!x)
		x = sp.x;
	window.scrollTo(x, y);
}

function getMousePosition(e, with_scroll) {
	var scrollTop, scrollLeft, scroll;

	if (with_scroll) {
		scroll = getScrollPosition();
	} else {
		scroll = { 'x' : 0, 'y' : 0 };
	}

	var evt	= IE ? window.event : e;
	var mX	= scroll.x + evt.clientX;
	var mY	= scroll.y + evt.clientY;

	return { 'x' : mX, 'y' : mY };
}

function GetWindowSize() {
	var w = ((window.innerWidth) ? window.innerWidth : ((document.documentElement.clientWidth) ? document.documentElement.clientWidth : 0) );
	var h = ((window.innerHeight) ? window.innerHeight : ((document.documentElement.clientHeight) ? document.documentElement.clientHeight : 0) );

	if (!w && !h) {
		var oCanvas = document.getElementsByTagName(
			(document.compatMode && document.compatMode == "CSS1Compat") ? "HTML" : "BODY")[0];

		w = window.innerWidth ? window.innerWidth + window.pageXOffset : oCanvas.clientWidth + oCanvas.scrollLeft;
		h = window.innerHeight ? window.innerHeight + window.pageYOffset : oCanvas.clientHeight + oCanvas.scrollTop;
	}
	return {'w': w, 'h' : h};
}
/* END WINDOW */