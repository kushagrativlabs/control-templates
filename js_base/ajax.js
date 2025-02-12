/**
 * Ajax wrapper.<br>
 *
 * Usage:
 * Form post: zsrv.post(
 *					'#FilterFrmId',					// FORM
 *					'/exam/p_search_exam.json',		// URL
 *					ajaxDisplayItems,				// Call back fnc
 *					true							//doNotCache
 *		);
 * GET:	zsrv.get(url, fnc, doNotCache); 
 * Files:
 * var UploadParms = function () {
    return {
		AcceptedTypes: {
			'json':		true,
		},
		SizeLimit:		{LocMaxSize},
    };
}();
	var formData = {};
	$.each($("#EditFrmId").serializeArray(), function(_, kv) {
		formData[kv.name] = encodeURIComponent(kv.value);
	});

	var filesObj = zsrv.getFilesObject("#EditFrmId", UploadParms);

	if (!filesObj.error) {
		zsrv.postFormData(formData, '/localization/p_save_localization.html', filesObj.files, {
				success: 		ajaxSave
				//fail:			{},
				//uploadProgress:	{}
			}
		);
	}
 *
 */

function ZipAjax(prop) {
	if (prop) {
		if (prop.UICallStatusId) {
			this.UICallStatusId = prop.UICallStatusId;
		}
	}
}

ZipAjax.prototype = {
	constructor: 	ZipAjax,
	UICallStatusId:	'ajaxLoad',
	callCount: 		0,
	cacheUrls:		{},
	cachePostValues:{},
	cachePostObj:	{},

	ajaxGetResp: function (msg) {
		zsrv.procResp(msg);
	},
	preRespond: function () {
		if (this.callCount < 0)
			this.callCount = 0;

		var obj = byid(this.UICallStatusId);
		if (obj) {
			var sp = getScrollPosition();
			//obj.style.top = ''+(sp.y+1)+'px';
			obj.style.left= ''+(sp.x + $(window).width() - 132)+'px';
			if (this.callCount > 0) {
				obj.style.display = 'block';
			}
		}

		this.callCount++;
	},
	postRespond: function () {
		this.callCount--;
		var obj = byid(this.UICallStatusId);
		if (this.callCount <= 0 && obj) {
			obj.style.display = 'none';
		}
	},
	addUserInfo: function (type, msg, suppressjGrowl) {
		if ('error' == type) {
			alertError(msg, suppressjGrowl);
		} else if ('warning' == type) {
			alertWarning(msg, suppressjGrowl);
		} else {
			alertMessage(msg, suppressjGrowl);
		}
		return true;
	},
	procResp: function (r) {
		if(r != null) {

		} else {
			r = {};
		}
		r.getValue 		= this.getValueTpl;
		r.getValueObj 	= this.getValueObjTpl;
		r.getValueArr 	= this.getValueArrTpl;
		r[status]	= (('1' == this.getValue(r, 'status')) ? true : false);
		if(r.status && !r['__ProcResp__']) {
			r['__ProcResp__'] 	= true;
			r['status']			= true;
			this.postRespond();
			var msg 	= r;
			var error	= this.getValue(r, 'error');
			var action	= this.getValue(r, 'action');
			var message	= this.getValue(r, 'message');
			var warning	= this.getValue(r, 'warning');
			var sjGlow	= this.getValue(r, 'SuppressjGrowl');

			if (message) {
				this.addUserInfo('message', message, sjGlow);
			}
			if (warning) {
				this.addUserInfo('warning', warning, sjGlow);
			}
			if (error) {
				this.addUserInfo('error', error, sjGlow);
			}

			var location		= this.getValue(r, 'location');
			var RelocateDelay	= this.getValue(r, 'RelocateDelay');
			if (!RelocateDelay) {
				RelocateDelay	= 0;
			}

			if (location) {
				setTimeout('document.location.href = "'+location+'";', RelocateDelay*1000);
			}
			var RefreshPage = this.getValue(r, 'RefreshPage');
			if (RefreshPage) {
				setTimeout('window.location.reload();', RelocateDelay*1000);
			}

			if (action) {
				eval(action);
			}
		}
		return r['status'];
	},

	isFunction: function (fnc) {
		var getType = {};
		return fnc && getType.toString.call(fnc) === '[object Function]';
	},

	getFileExt: function (fileName) {
		return fileName.split('.').pop();
	},

	postFormDataFiles: function (formIdent, url, uploadParms, ajaxFnc) {
		var filesObj = this.getFilesObject(formIdent, uploadParms);

		if (!filesObj.error) {
			var $formObj	= $(formIdent);
			var formData 	= this.serializeFormObject($formObj);
			this.postFormData(formData, url, filesObj.files, {
					success: 		ajaxFnc
					//fail:			{},
					//uploadProgress:	{}
				}
			);
		}
	},

	getFilesObject: function (formIdent, uploadParms) {
		if (uploadParms == null) {
			// Example of uploadParms
			uploadParms = function () {
						    return {
								AcceptedTypes: {
									'image/png':	true,	// or file size for this type of media
									'image/jpeg':	true,
									'image/gif':	true
								},
								SizeLimit:			1024*1024*2
								/*ErrorFncFileType: function () {
								},
								ErrorFncSizeLimit: function () {
								}*/
						    };
						}();
		}
		var $formObj	= $(formIdent);
		var files		= [];
		var error		= false;
		var $fileInput;

		if ($formObj) {
			$fileInput = $formObj.find(":file");
		}

		if ($fileInput.length) {
			for (var i = 0; i < $fileInput.length; i++) {
				if (!$fileInput[i].files.length) {
					continue;
				}
				var fileInp		= $fileInput[i].files[0];
				var fileType 	= fileInp.type;
				var fileExt		= this.getFileExt(fileInp.name);
				var accValue	= false;
				if (uploadParms.AcceptedTypes[fileType]) {
					accValue = uploadParms.AcceptedTypes[fileType];
				}
				if (uploadParms.AcceptedTypes[fileExt]) {
					accValue = uploadParms.AcceptedTypes[fileExt];
				}
				if (accValue === true || (typeof accValue) === 'number') {
					fileInp.inputName = $fileInput[0].name;
					var sizeLimit = uploadParms.SizeLimit;

					if ((typeof accValue) === 'number') {
						sizeLimit = accValue;
					}
					if (!sizeLimit || fileInp.size <= sizeLimit) {
						files.push(fileInp);
					} else {
						error = true;
						if (uploadParms.ErrorFncSizeLimit) {
							uploadParms.ErrorFncSizeLimit(fileInp, sizeLimit);
						} else {
							this.errorSizeLimit(fileInp, sizeLimit);
						}
					}
				} else {
					error = true;
					var callStandard = true;
					if (uploadParms.ErrorFncFileType) {
						callStandard = uploadParms.ErrorFncFileType(fileInp, uploadParms);
					}
					if (callStandard) {
						this.errorFileType(fileInp, uploadParms);
					}
				}
			}
		}

		return {'error': error, 'files': files};
	},

	errorFileType: function (file, uploadParms) {
		var accepted 		= uploadParms.AcceptedTypes;
		var tp;
		var acceptedTypes	= '';
		for (tp in accepted) {
			var n = tp.indexOf("/");
			if (n > 0) {
				tp = tp.substring(n+1);
			}
			acceptedTypes += ((acceptedTypes) ? ', ' : '') + tp;
		}
		// TODO: lang
		var fileType = file.type;
		if (!fileType) {
			fileType = file.name.split('.').pop().toLowerCase();
		}
		var msg = file.name + ': file type ('+fileType+') is not supported.<br>Supported files types: '+acceptedTypes;
		if (this.isFunction(alertError)) {
			alertError(msg);
		}
	},
	errorSizeLimit: function (file, sizeLimit) {
		// TODO: lang
		var msg = 'File size limit is ' + this.sizeMb(sizeLimit) +' Mb. ' + file.name + ' size is ' + this.sizeMb(file.size) + ' Mb.';
		if (this.isFunction(alertError)) {
			alertError(msg);
		}
	},
	sizeMb: function (size) {
		return Math.round((size / 1024 / 1024));
	},

	/*
	 ajaxFnc = {
	 	success:		null,
	 	fail:			null,
	 	progress:		null,
	 	uploadProgress:	null,
	 }
	 or direct link to success function
	Use to send files.
	 */
	postFormData: function (formIdent, url, files, ajaxFnc) {
		var formData 			= new FormData();

		if (!formIdent) {
		} else if ('string' == typeof(formIdent)) {
			var formElement = document.getElementById(formIdent.substr(1));
			if (files.length) {
				var formDt	= this.serializeFormObject($(formIdent));
				formData	= this.formDataAppendObject(formData, formDt);
			} else {
				// For some reason it doubles size of content-length in case of using standatd form initialization. If we add all fields through object and then content length will be as expected
				formData = new FormData(formElement);
			}
		} else if ('object' == typeof(formIdent)) {
			formData = this.formDataAppendObject(formData, formIdent);
		}

		for (var i = 0; i < files.length; i++) {
			formData.append(files[i].inputName, files[i]);
		}

		if (this.isFunction(ajaxFnc)) {
			ajaxFnc				= {success: ajaxFnc};
		}
		this.setAjaxRequestNew('POST', url, formData, ajaxFnc, true);
	},

	post: function (formIdent, url, ajaxFunction, noCache, ajaxFailFunction) {
		if ('string' == typeof(formIdent)) {
			var formData	= $(formIdent).serialize();
		} else if ('object' == typeof(formIdent)) {
			formData = this.serializeObject(formIdent);
		}
		var cached		= false;
		if (!ajaxFunction) {
			ajaxFunction = this.ajaxGetResp;
		}
		if (!noCache && this.cachePostValues[url]) {
			var pos = this.cachePostValues[url].InArrayPos(formData);
			if (false !== pos) {
				cached = true;
				if ('object' == typeof(ajaxFunction)) {
					for (var a = 0; a < ajaxFunction.length; a++) {
						ajaxFunction[a](this.cachePostObj[url][pos]);
					}
				} else {
					ajaxFunction(this.cachePostObj[url][pos]);
				}
			}
		}
		if (!cached) {
			this.setAjaxRequest('POST', url, ajaxFunction, formData, noCache, ajaxFailFunction);
		}
	},
	get: function (url, ajaxFunction, noCache, ajaxFailFunction) {
		if (!ajaxFunction) {
			ajaxFunction = this.ajaxGetResp;
		}
		if (!noCache && this.cacheUrls[url]) {
			if ('object' == typeof(ajaxFunction)) {
				for (var a = 0; a < ajaxFunction.length; a++) {

					ajaxFunction[a](this.cacheUrls[url]);
				}
			} else {
				ajaxFunction(this.cacheUrls[url]);
			}
		} else {
			this.setAjaxRequest('GET', url, ajaxFunction, false, noCache, ajaxFailFunction);
		}
	},
	/*
	 ajaxFnc = {
	 	success:		null,
	 	fail:			null,
	 	progress:		null,
	 	uploadProgress:	null,
	 }
	 or direct link to success function
	 */
	setAjaxRequestNew: function (reqType, url, data, ajaxFnc, noCache) {
		this.ajaxFnc = null;
		var r = {
			type:		reqType,
			url:		url,
			dataType:	'json',
			data:		data,
			cache:		false,
			processData:false,
			contentType:false
		};
		if (ajaxFnc.progress || ajaxFnc.uploadProgress) {
			this.ajaxFnc = ajaxFnc;
			//r.beforeSend = ApplyContext(this.ajaxRequestBeforeSend, this);
			r.xhr = ApplyContext(this.ajaxXhrInit, this);
		}
		r.noCache = noCache;
		var j = $.ajax(r);
		if (ajaxFnc.success) {
			if ('array' == typeof(ajaxFnc.success)) {
				for (var a = 0; a < ajaxFnc.success.length; a++) {
					j.done(ajaxFnc.success[a]);
				}
			} else {
				j.done(ajaxFnc.success);
			}
			r.doneFnc = ajaxFnc.success;
		}
		if (ajaxFnc.fail) {
			j.fail(ajaxFnc.fail);
		} else {
			j.fail(this.ajaxFail);
		}
		//j.progress(ajaxFnc.uploadProgress);
		j.ZOpt 		= r;
		if (typeof j.always === "function") {
			j.always(ApplyContext(this.ajaxComplete, this));
		} else {
			j.complete(ApplyContext(this.ajaxCompleteOld, this));
		}
	},

	ajaxXhrInit: function () {
		//http://stackoverflow.com/questions/15410265/file-upload-progress-bar-with-jquery
		//http://stackoverflow.com/questions/166221/how-can-i-upload-files-asynchronously
		var xhr = $.ajaxSettings.xhr();

		if (this.isFunction(this.ajaxFnc.uploadProgress) && xhr.upload) {
			xhr.upload.addEventListener("progress", this.ajaxFnc.uploadProgress, false);
		}

		if (this.isFunction(this.ajaxFnc.progress)) {
			xhr.addEventListener("progress", this.ajaxFnc.progress, false);
		}
		/*
			if (evt.lengthComputable) {
				var percentComplete = evt.loaded / evt.total;
				//Do something with upload progress
			}
		*/
		return xhr;
	},

	ajaxRequestBeforeSend: function (XMLHttpRequest) {
		//http://www.dave-bond.com/blog/2010/01/JQuery-ajax-progress-HMTL5/
		//Upload progress
		if (this.isFunction(this.ajaxFnc.progress)) {
			XMLHttpRequest.addEventListener("progress", this.ajaxFnc.progress, false);
		}
		//Download progress
		//console.log(this.ajaxFnc);
		//console.log(XMLHttpRequest);
		if (this.isFunction(this.ajaxFnc.uploadProgress)) {
			XMLHttpRequest.upload.addEventListener("progress", this.ajaxFnc.uploadProgress, false);
		}
		/*
			if (evt.lengthComputable) {
				var percentComplete = evt.loaded / evt.total;
				//Do something with upload progress
			}
		*/
	},

	setAjaxRequest: function (reqType, url, ajaxFunction, data, noCache, ajaxFailFunction) {
		var r = {
		  type:		reqType,
		  url:		url,
		  dataType:	'json',
		  cache:	false
		};
		if (data) {
			r.data = data;
		}
		r.noCache = noCache;
		var j = $.ajax(r);
		if (ajaxFunction) {
			if ('array' == typeof(ajaxFunction)) {
				for (var a = 0; a < ajaxFunction.length; a++) {
					j.done(ajaxFunction[a]);
				}
			} else {
				j.done(ajaxFunction);
			}
			r.doneFnc = ajaxFunction;
		}
		if (ajaxFailFunction) {
			j.fail(ajaxFailFunction);
		} else {
			j.fail(this.ajaxFail);
		}
		j.ZOpt 		= r;
		if (typeof j.always === "function") {
			j.always(ApplyContext(this.ajaxComplete, this));
		} else {
			j.complete(ApplyContext(this.ajaxCompleteOld, this));
		}
	},
	ajaxCompleteOld: function(j, status) {
		if ("success" == status && !j.ZOpt.noCache) {
			var tmpMsg = JSON.parse(j.responseText);
			this.ajaxComplete(tmpMsg, status, j);
		}
	},
	ajaxComplete: function(jsonData, status, j) {
		if ("success" == status && !j.ZOpt.noCache) {
			if ('GET' == j.ZOpt.type) {
				this.cacheUrls[j.ZOpt.url] = jsonData;
			} else if ('POST' == j.ZOpt.type) {
				if (!this.cachePostValues[j.ZOpt.url]) {
					this.cachePostValues[j.ZOpt.url]	= new Array();
					this.cachePostObj[j.ZOpt.url]		= new Array();
				}
				var len = this.cachePostValues[j.ZOpt.url].push(j.ZOpt.data);
				this.cachePostObj[j.ZOpt.url][len-1] = jsonData;
			}
		}
	},
	ajaxFail: function (jqXHR, textStatus) {
		var text;

		if ('503' == jqXHR.status) {
			text = 'Service is currently undergoing scheduled maintenance. It should be back shortly. Sorry for the inconvenience!';
		} else {
			text = "Request failed: " + textStatus;;
		}

		if (alertError) {
			alertError(text);
		} else {
			alert(text);
		}
	},
	getValue: function (r, key) {
		return r[key];
	},
	getValueObj: function (r, key) {
		var tmpStr	= r[key];
		var tmp		= false;
		if (tmpStr) {
			eval('tmp = '+tmpStr);
		}
		return tmp;
	},
	getValueObjTpl: function (key) {
		var tmpStr	= this[key];
		var tmp		= false;
		if (tmpStr) {
			eval('tmp = '+tmpStr);
		}
		return tmp;
	},
	getValueArr: function (r, key) {
		var tmpStr	= r[key];
		var tmp		= false;
		if (tmpStr) {
			eval('tmp = '+tmpStr);
		}
		return tmp;
	},
	getValueArrTpl: function (key) {
		var tmpStr	= this[key];
		var tmp		= false;
		if (tmpStr) {
			eval('tmp = '+tmpStr);
		}
		return tmp;
	},
	getValueTpl: function (key) {
		return this[key];
	},
	serializeObject: function (obj, prefix) {
		formData	= '';
		prefix		= ((prefix) ? prefix : '');
		for (key in obj) {
            if ('function' == typeof(obj[key])) {
                continue;
            }
			formData += ((formData) ? '&' : '');
			if ('object' == typeof(obj[key])) {
				formData += this.serializeObject(obj[key], prefix + ((prefix) ? '[' + key + ']' : key));
			} else if ('serialized_form_data' != key) {
				if (prefix) {
					formData += prefix + '[' + key + ']=' + obj[key];
				} else {
					formData += key + '=' + obj[key];
				}
			} else {
				formData += obj[key];
			}
		}
		return formData;
	},
	serializeFormObject: function(formObjJq) {
		var o = {};
		var a = formObjJq.serializeArray();
		$.each(a, function() {
			if (o[this.name] !== undefined) {
				if (!o[this.name].push) {
					o[this.name] = [o[this.name]];
				}
				o[this.name].push(this.value || '');
			} else {
				o[this.name] = this.value || '';
			}
		});
		return o;
	},
	formDataAppendObject: function (formData, obj, prefix) {
		prefix		= ((prefix) ? prefix : '');
		for (key in obj) {
			//formData += ((formData) ? '&' : '');
			if ('object' == typeof(obj[key])) {
				formData = this.formDataAppendObject(formData, obj[key], prefix + ((prefix) ? '[' + key + ']' : key));
			} else {
				var	name;
				if (prefix) {
					name = prefix + '[' + key + ']';
				} else {
					name = key;
				}
				formData.append(name, obj[key]);
			}
		}
		return formData;
	}
	/*getValue: function (r, key, i) {
		var k = key;
		if (!i)
			i = 0;
		else
			k = key + i;

		var obj = response.getElementsByTagName(k)[0];
		if (obj && obj.firstChild) {
			// FF может оперировать только блоками по 4096 байт, поэтому специально для него разбиваем по примерно 2000 байта
			var str = obj.firstChild.data;

			if (str.length >= 1000) {
				return str + this.getValue(response, key, i + 1);
			} else {
				return str;
			}
		}
		return '';
	}*/
};
var zsrv = new ZipAjax({});