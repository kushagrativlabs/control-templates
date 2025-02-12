function closePopoverShare() {
	var post = {};
	zsrv.post(post, '/exam/p_share_close.html', null, true, dn);
}
function showPopOverM(id, title, content, placement) {
	if (!placement) {
		placement = 'top';
	}
	$("#"+id).popover({
		animation: true,
		title:		title,
		content:	content,
		trigger:	'click',
		placement:	placement,
		trigger: 	'focus',
		html:		true
	}).popover('show');
}

function shb(st, pt, tid, resid) {
	var post = {
			'tid': 	tid,	// TestId
			'rid': 	resid,	// ResultId
			'pt':	pt,		// Page type
			'st':	st		// Social button type
	};
	zsrv.post(post, '/exam/p_share.html', null, true, dn);
}

$(document).ready(function() {
	initUniform();
	initPlaceholder();
	initCheckBoxes();
	updateDates();
    if ($.fn.tooltip) { $('.ui-tooltip').tooltip ({ container: 'body' }) }
    if ($.fn.popover) { $('.ui-popover').popover ({ container: 'body' }) }
});

function updateDates() {
	var list = document.querySelectorAll('[dt-uts]');
	var obj, time, i, format, options, uts;
	for (i = 0; i < list.length; i++) {
		obj	= list[i];
		uts	= parseInt(obj.getAttribute('dt-uts'), 10);
		if (uts) {
			time			= new Date(uts * 1000);
			options			= getDateFormat(obj.getAttribute('dt-format'));
			obj.innerHTML	= time.toLocaleString(false, options);
		}
	}
}

function getDateFormat(formatStr) {
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
	// default: date time
	options = { year: 'numeric', month: 'numeric', day: 'numeric', hourCycle: 'h24', hour: 'numeric', minute: 'numeric' };		
	
	if ('date' == formatStr) {
		// date
		options = { year: 'numeric', month: 'numeric', day: 'numeric'};
	}
	
	return options;
}

var PricingPlanId;
function purchaseProduct(type) {
	if (UserId) {
		PricingPlanId = type;
		zsrv.post({}, '/profile/p_order.html', ajaxPurchaseProduct, true);
	} else {
		PageReg();
	}
}

function ajaxPurchaseProduct(msg) {
	if (zsrv.procResp(msg)) {
		var OrderId = msg.getValue('OrderId');
		var inp = byid('OrderId');
		if (inp) {
			inp.value = OrderId;
		}
	}
	// submit anyway
	var form = document.forms['sell'];
	var a;
	var reg 		= /^\S+(\[\d+\])(\[\S+\])?$/
	var PaymentType	= GetRadioValue(form.elements['PaymentType']);
	var productId;
	if (1 == PaymentType) {
		productId	= PricingPlan[PricingPlanId]['mcids']['subscription'][PriceType];
	} else {
		productId	= PricingPlan[PricingPlanId]['mcids']['onetime'][PriceType];
	}
	for (a = 0; a < form.elements.length; a++) {
		var inp = form.elements[a];
		var m	= inp.name.match(reg);
		if (m) {
			inp.name = inp.name.replaceAll(m[1], '['+productId+']')
		}
	}
	form.elements['productid'].value = productId;
    var actionUrl = form.action;
    actionUrl += '?'+$(form).serialize();
    //form.action = actionUrl;
    //console.log(actionUrl);
	//form.submit();
    document.location.href=actionUrl;
}

function PageContactUs() {
	if (window.isMobile) {
		document.location.href = '/contacts/contact-us.html';
	} else {
		dialog.showTab('/contacts/d_contact_us.html');
	}
}

function PageReg() {
	if (window.isMobile) {
		document.location.href = '/profile/registration.html';
	} else {
		dialog.showTab('/profile/d_registration.html');
	}
}
function PageLogin() {
	if (window.isMobile) {
		document.location.href = '/profile/login.html';
	} else {
		dialog.showTab('/profile/d_login.html');
	}
}
function PageForgot() {
	if (window.isMobile) {
		document.location.href = '/profile/forgot.html';
	} else {
		dialog.showTab('/profile/d_forgot.html');
	}
}
function PageContactUs() {
	if (window.isMobile) {
		document.location.href = '/contacts/contact-us.html';
	} else {
		dialog.showTab('/contacts/d_contact_us.html');
	}
}
function ActivateNavMenu(id) {
	$('#TopNavbar li').removeClass("active");
	if (id) {
		$('#'+id).addClass("active");
	}
}

function getChBxInp(el) {
	var obj = $(el).find('input');
	if (!obj.length) {
		obj = $(el).parent().find('input');
	}
	return obj;
}
function changePlanValues(type) {
	var PricinPlanId = 0;
	$(".ExamCount").each(function( index ) {
		PricinPlanId++;
		var obj 		= $(this);
		var examCount	= PricingPlan[PricinPlanId]['exams'];
		switch (type) {
			case 3:
				examCount	+= Math.floor(examCount/2);
				break;
			case 12:
				examCount	+= examCount;
				break;
		}
		obj.html(examCount);
	});

	PricinPlanId = 0;
	$(".ExamAvailability").each(function( index ) {
		PricinPlanId++;
		var obj 		= $(this);
		var examAvail	= PricingPlan[PricinPlanId]['exam_avail_month'];
		switch (type) {
			case 3:
				examAvail	+= 3;
				break;
			case 12:
				examAvail	+= 6;
				break;
		}
		obj.html(examAvail);
	});
}
var PriceType = 0;
function applyPrice(element, index, array) {
	var obj 	= byid(element);
	var value	= Price[element];
	var disc	= 0;

	switch (PriceType) {
		case 3:
			disc = 0.15;
			break;
		case 12:
			disc = 0.3;
			break;
	}

	value = value - value * disc;
	value = Math.round(value*100)/100;

	byid(element).innerHTML = getTxtPrice(value);
}

function shSection(id) {
	var cnt = $("#"+id),
		head= $("#"+id+"_head");
	if (cnt) {
		if (cnt.is(":hidden")) {
			head.addClass('active');
			cnt.slideDown();
		} else {
			cnt.slideUp(null, function () { head.removeClass('active'); } );
		}
	}
}

var minImgWidth		= 450;
var resizeTestImgSet= false;
function resizeTestImg() {
	if (!resizeTestImgSet) {
		resizeTestImgSet = true;
		$(window).resize(function() {
			resizeTestImg();
		});
	}
	var imgs 		= $(".qa-page img");

	for (var a = 0; a < imgs.length; a++) {
		var $img = $(imgs[a]);
		if (!$img.data('processed')) {
			$img.data('processed', '1');

			$(imgs[a]).on('load', function() {
				rImg(this);
			});
			if (!$img.attr('nozoom')) {
				$(imgs[a]).on('click', function() {
					cImg(this);
				});
			}
		}
		// image might be already loaded, or resize event fired
		rImg(imgs[a]);
	}
}
function cImg(img) {
	var $img		= $(img);
	var origWidth	= $img.data('orig-width');
	var zoomState	= $img.data('zoom');
	if (origWidth && img.width < origWidth && !zoomState) {
		$img.data('zoom', '1');
		img.width = origWidth;
		img.style.maxWidth = "none";
	} else {
		$img.data('zoom', '');
		rImg(img);
		img.style.maxWidth = "100%";
	}
}

function rImg(img) {
	var parent		= img.parentNode;
	var maxWidth	= parent.offsetWidth;
	var $img		= $(img);
	var origWidth	= $img.data('orig-width');
	var zoomState	= $img.data('zoom');

	if (!img.width) {
		return 0;
	}
	if (!origWidth && img.width) {
		$img.data('orig-width', img.width);
		origWidth = img.width;
	}
	if (img.naturalWidth && (!origWidth || origWidth < img.naturalWidth)) {
		$img.data('orig-width', img.naturalWidth);
		origWidth = img.naturalWidth;
	}
	maxWidth		-= parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-left'));
	maxWidth		-= parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-right'));

	if (!zoomState) {
		if (img.width && img.width > maxWidth) {
			var width 			= maxWidth;
			img.style.maxWidth	= 'none';

			if (width >= minImgWidth) {
				img.width			= width;
			} else {
				img.width			= minImgWidth;
			}
		} else if (img.width && img.width < maxWidth && img.width < origWidth && origWidth) {
			var newWidth = (origWidth > maxWidth) ? maxWidth : origWidth;
			img.width = newWidth;
		}
	}

	if (img.width && img.width < origWidth && !$img.attr('nozoom')) {
		if (!$img.hasClass('hand')) {
			$img.addClass('hand');
		}
	} else {
		$img.removeClass('hand');
	}
}
function ReorderOptionalAnswersChanged(obj) {
	var OptionalAnswersState = obj.checked;
	$('.item-answers input').each(function(){
		this.readonly = !OptionalAnswersState;
		if (!OptionalAnswersState) {
			this.checked = true;
			$(this).next().addClass('active');
		}
	});
}
var isDragging = false;
var isEditMode = false;
function changeAnswerState(id) {
	var obj = byid(id);
	if (obj && !isDragging && !obj.disabled && !obj.readonly) {
		var type = obj.type.toLowerCase();
		if ('radio' == type) {
			$('[name="'+obj.name+'"]').each(function( index ) {
				$(this).prop('checked', false);
				$(this).next().removeClass('active');
			});
			$("#"+id).prop('checked', true).next().addClass('active');
		} else if ('checkbox' == type) {
			var jCh = $("#"+id);
			if (obj.checked) {
				obj.checked = false;
				jCh.next().removeClass('active');
			} else {
				obj.checked = true;
				jCh.next().addClass('active');
			}
		}
	} else {
		if (!isDragging && obj && obj.readonly && isEditMode) {
			// TODO: lang
			alertWarning('To make answer optional tick the "Optional answers" checkbox in the parameters.');
		}
	}
}
function initCheckBoxes() {
	$('.sim-checker,.sim-checkbox,.sim-radio').each(function(){
		if (!$(this).attr('chinit')) {
			var obj = getChBxInp(this);
			if (!$(this).prop('disabled')) {
				$(this).attr('chinit', true);
				// handled by changeAnswerState() function
				/*$(this).click(function() {
					var obj = getChBxInp(this);
					if( obj.is(':checked') ) {
						$(this).removeClass('active');
						//obj.removeAttr('checked');
						obj.prop('checked', false);
					} else {
						$(this).addClass('active');
						//obj.attr('checked', true);
						obj.prop('checked', true);
					}
					obj.change();
				});*/
			}
			if( obj.is(':checked') && $(this).attr('imgtype') != 'nobg' ) {
				$(this).addClass('active');
			}
		}
	});
}

var SimSecondsLeft, SimLeftTimer, SimInitTime, SimPageReloadTimer;
function SimulatorTimerInit() {
    var timerTag    = $('#TimeLeftId');
    SimSecondsLeft  = timerTag.attr('data-time-left');
    SimInitTime     = Math.floor(new Date().getTime()/1000);
    SimLeftTimer    = setTimeout("SimulatorWriteTimer();", 1000);
}

function SimulatorWriteTimer() {
    var timerTag    = $('#TimeLeftId');
    var time        = Math.floor(new Date().getTime()/1000);
    var secLeft     = SimSecondsLeft-(time-SimInitTime);
    if (secLeft < 0) {
        secLeft = 0;
    }
    timerTag.html(getUserTime(secLeft));

    if (secLeft > 0) {
        SimLeftTimer = setTimeout("SimulatorWriteTimer();", 1000);
    } else if (!SimPageReloadTimer) {
        // Test ended, refresh the page to trigger getting results
        SimPageReloadTimer = setTimeout("location.reload();", 3000);
    }
}

function getUserTime(sec) {
    var h	= Math.floor(sec / 3600);
    var m	= Math.floor((sec - h*3600)/60);
    var s	= sec - h*3600 - m*60;

    if (h < 10) {
        h = '0'+h;
    }
    if (m < 10) {
        m = '0'+m;
    }
    if (s < 10) {
        s = '0'+s;
    }

    return h+':'+m+':'+s;
}

var QuestionType = 0;
function SimulatorAnswer(direction, number) {
	var elm = document.forms['TesterFrm'].elements;
	elm['direction'].value	= direction;
	if (4 == direction && elm['ShowQuestion']) {
		elm['ShowQuestion'].value = number;
	}
	var formData = {};
	$.each($("#TesterFrm").serializeArray(), function(_, kv) {
		formData[kv.name] = kv.value;
	});
	if (_TESTER_QT_REORDER == QuestionType) {
		var seqArr = new Array();
		$.each($('ul.ui-ul-sortable li.ui-li-sortable'), function (key, val) {
			seqArr.push($(val).attr('answerid'));
		});
		formData['ItemOrder'] = seqArr.join();
	}
	ajaxDoNotCache = true;
	if (3 == direction) {
		dialog.confirm('Confirmation', 'Are you sure you want to end this Online Exam Simulation?', function(){
			zsrv.post(formData, '/simulator/data.html', null, true);
		});
	} else {
		zsrv.post(formData, '/simulator/data.html', null, true);
	}
}

/* COMMON PROGRESS */
var CPHolder = {};
function ShowCP(id, prop) {
	var obj = byid(id);
	var opts = {
		lines:		9, // The number of lines to draw
		length:		0, // The length of each line
		width:		4, // The line thickness
		radius:		6, // The radius of the inner circle
		scale:		1, // Scales overall size of the spinner
		corners:	1, // Corner roundness (0..1)
		color:		'#000', // #rgb or #rrggbb or array of colors
		opacity:	0.2, // Opacity of the lines
		rotate:		0, // The rotation offset
		direction:	1, // 1: clockwise, -1: counterclockwise
		speed:		1, // Rounds per second
		trail:		60, // Afterglow percentage
		fps:		20, // Frames per second when using setTimeout() as a fallback for CSS
		zIndex:		2e9, // The z-index (defaults to 2000000000)
		className:	'spinner', // The CSS class to assign to the spinner
		//top:		'50%', // Top position relative to parent
		//left:		'-15px', // Left position relative to parent
		top:		'10px', // Top position relative to parent
		left:		'-30px', // Left position relative to parent
		shadow:		false, // Whether to render a shadow
		hwaccel:	false, // Whether to use hardware acceleration
		//position:	'absolute' // Element positioning
		position:	'relative' // Element positioning
	};
	if (prop) {
		for (key in prop) {
			opts[key] = prop[key];
		}
	}
	if (obj) {
		if ('button' == obj.tagName.toLowerCase()) {
			obj.disabled = true;
		}
		if (!CPHolder[id]) {
			CPHolder[id] = new Spinner(opts);
		}
		CPHolder[id].spin(obj);
	}
}

function HideCP(id) {
	var obj = byid(id);
	if (CPHolder[id] && obj) {
		CPHolder[id].stop();
		if ('button' == obj.tagName.toLowerCase()) {
			obj.disabled = false;
		}
	}
}
/* END COMMON PROGRESS */