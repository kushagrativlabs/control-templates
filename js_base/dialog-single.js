function DialogWindows(ajax, prop) {
	this.ajax				= ajax;
	this.dialogId			= prop.dialogId;
	this.dialogCntId		= prop.dialogCntId;
}

DialogWindows.prototype = {
	constructor: 		DialogWindows,
	ajax:				{},
	dialogId:			'',
	dialogCntId:		'',
	postCnt:			false,
	resizeEvent:		false,
	width:				'',
	height:				'',
	actionBeforeHtml:	'',
	actionOnClose:		'',
	closeActSet:		false,

	confirm: function (title, html, callBack) {
		var dHtml = '';
		if (title) {
/*
				<div class="modal-header">
				    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
				    <h4 class="modal-title" id="myModalLabel4">'+title+'</h4>
				</div>
*/
			dHtml = '<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h4 class="modal-title" id="myModalLabel4">'+title+'</h4></div>';
		}
/*
			<div class="modal-body">
			    <div class="row" style="margin: 10px;">
			' + html + '
			    </div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-secondary" onclick="dialog.confirmOk();">Ok</button>
			    <button type="button" class="btn btn-default" data-dismiss="modal" onclick="dialog.close();">Cancel</button>
			</div>
*/
		// TODO: lang
		dHtml += '<div class="modal-body"><div class="row" style="margin: 10px;">' + html + '</div></div><div class="modal-footer"><button type="button" class="btn btn-secondary" onclick="dialog.confirmOk();">Ok</button><button type="button" class="btn btn-default" data-dismiss="modal" onclick="dialog.close();">Cancel</button></div>';
		this.applyTabCnt(dHtml);
		this.confirmCallBack = callBack;
	},
	confirmOk: function () {
		this.close();
		if (this.confirmCallBack) {
			this.confirmCallBack();
		}
	},
	showTab: function (url, doNotCache, userFnc) {
		var fnc = new Array();
		fnc.push(ApplyContext(this.ajaxShowTab, this));
		if (userFnc) {
			fnc.push(userFnc);
		}
		if (this.postCnt) {
			this.ajax.post(this.postCnt, url, fnc, doNotCache);
			this.postCnt = false;
		} else {
			this.ajax.get(url, fnc, doNotCache);
		}
	},
	ajaxShowTab: function (msg) {
		if (this.ajax.procResp(msg)) {
			var width	= msg.getValue('width');
			var height	= msg.getValue('height');
			var cnt		= msg.getValue('dialogCnt');
			var js 		= msg.getValue('js');
			this.applyTabCnt(cnt, width, js);
		}
	},
	applyTabCnt: function (html, width, dialogJs) {
		var cntObj	= byid(this.dialogCntId);
		var dObj	= byid(this.dialogId);
		var $dObj	= $("#"+this.dialogId);

		if (!width) {
			width = 560;
		}
		/*if (height) {
			dObj.style.height = height+'px';
		} else {
			dObj.style.height = '';
		}
		this.width 	= width;
		this.height	= ((height) ? height : 560);

		dObj.style.margin = "-"+Math.round( this.height/2 )+"px 0 0 -"+Math.round( this.width/2 )+"px";
		this.controlDialogMargin();
		*/

		if (this.actionBeforeHtml) {
			eval(this.actionBeforeHtml);
		}

		cntObj.innerHTML	= html;
		if (width) {
			cntObj.style.width	= width+'px';
		}

		if (initUniform) {
			initUniform('.modal-dialog');
		}
		if (initPlaceholder) {
			initPlaceholder();
		}

		$('#'+this.dialogId).modal('show');

		if (!this.closeActSet) {
			$('#'+dialog.dialogId).on('hide', ApplyContext(this.onClose, this));
			this.closeActSet = true;
		}

		if (dialogJs) {
			eval(dialogJs);
		}

		if (!this.resizeEvent) {
			//this.resizeEvent = true;
			//$(window).resize(ApplyContext(this.controlDialogMargin, this));
		}
	},
	onClose: function () {
		if (this.actionOnClose) {
			eval(this.actionOnClose);
		}
	},
	setPostData: function (post) {
		this.postCnt = post;
	},
	controlDialogMargin: function () {
		var dObj		= byid(this.dialogId);
		var windowSize	= $('body').height();
		var neg			= windowSize/2 - (this.height/2);
		if (neg < 0) {
			dObj.style.margin = "-"+Math.round( this.height/2 + neg )+"px 0 0 -"+Math.round( this.width/2 )+"px";
		}
	},
	setActionBeforeHtml: function (action) {
		this.actionBeforeHtml = action;
	},
	setActionOnClose: function (action) {
		this.actionOnClose = action;
	},
	close: function () {
		$('#'+this.dialogId).modal('hide');
	},
};

var dialog = new DialogWindows(zsrv, {
	dialogId:			'modalDlgId',
	dialogCntId:		'modalDlgCntId'
});

function CloseDialog() {
	$('#'+dialog.dialogId).modal('hide');
}