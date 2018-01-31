var KPainter = function(initSetting){
	var kPainter = this;

	initSetting = initSetting || {};
	var isSupportTouch;
	if("mouse" == initSetting.gesturer){
		isSupportTouch = false;
	}else if("touch" == initSetting.gesturer){
		isSupportTouch = true;
	}else{
		isSupportTouch = "ontouchend" in document ? true : false;
	}
	
	var isMobileSafari = (/iPhone/i.test(navigator.platform) || /iPod/i.test(navigator.platform) || /iPad/i.test(navigator.userAgent)) && !!navigator.appVersion.match(/(?:Version\/)([\w\._]+)/); 
	var isSupportDrawImageWithObjectUrl = false;//FF53 not support, FF56 support 

	(function(){
		// can use a very small base64-img, convert to blob, to test if support canvas drawImage using objectUrl
		try{
			var testBmpB64 = "Qk06AAAAAAAAADYAAAAoAAAAAQAAAAEAAAABABgAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAA////AA==";
			var blob = kUtil.convertBase64ToBlob(testBmpB64, "image/bmp");
			var img = new Image();
			var objUrl;
			img.onload = function(){
				img.onload = null;
				URL.revokeObjectURL(objUrl);
				try{
					var tCvs = document.createElement("canvas");
					tCvs.width = 1;
					tCvs.height = 1;
					var ctx = tCvs.getContext("2d");
					ctx.drawImage(img,0,0);
					tCvs.toDataURL();
					// warning: because async set true, sync add img immdiately, may get the value false and use FileReader Api
					isSupportDrawImageWithObjectUrl = true;
				}catch(ex){}
			};
			objUrl = URL.createObjectURL(blob);
			img.src = objUrl;
		}catch(ex){}
	})();
	var cvsToBlob = function(cvs, callback, mimeType, quality){
		if(cvs.toBlob){
			cvs.toBlob(callback, mimeType, quality);
		}else{
			(function(cvs, callback, mimeType, quality){
				var b64str = cvs.toDataURL(mimeType, quality);
				var blob = kUtil.convertBase64ToBlob(b64str.substring(b64str.indexOf(",")+1), mimeType);
				callback(blob);
			})(cvs, callback, mimeType, quality);
		}
	};

	var containerDiv = $([
		'<div style="width:800px;height:600px;border:1px solid #ccc;">',
			'<div class="kPainterBox">',
				'<div class="kPainterImgsDiv">',
					'<canvas class="kPainterCanvas" style="display:none;left:0;top:0;"></canvas>',
				'</div',
				'><div class="kPainterCroper" style="width:50px;height:50px;display:none;">',
					'<div class="kPainterCells">',
						'<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>',
					'</div',
					'><div class="kPainterBigMover" data-orient="0,0" style="display:none"></div',
					'><div class="kPainterEdges">',
						'<div data-orient="-1,0"></div',
						'><div data-orient="0,-1"></div',
						'><div data-orient="1,0"></div',
						'><div data-orient="0,1"></div>',
					'</div',
					'><div class="kPainterCorners">',
						'<div data-orient="-1,-1"><i></i></div',
						'><div data-orient="1,-1"><i></i></div',
						'><div data-orient="1,1"><i></i></div',
						'><div data-orient="-1,1"><i></i></div>',
					'</div',
					'><div class="kPainterMover" data-orient="0,0">',
						'<div></div>',
						'<svg width="20" height="20" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1792 896q0 26-19 45l-256 256q-19 19-45 19t-45-19-19-45v-128h-384v384h128q26 0 45 19t19 45-19 45l-256 256q-19 19-45 19t-45-19l-256-256q-19-19-19-45t19-45 45-19h128v-384h-384v128q0 26-19 45t-45 19-45-19l-256-256q-19-19-19-45t19-45l256-256q19-19 45-19t45 19 19 45v128h384v-384h-128q-26 0-45-19t-19-45 19-45l256-256q19-19 45-19t45 19l256 256q19 19 19 45t-19 45-45 19h-128v384h384v-128q0-26 19-45t45-19 45 19l256 256q19 19 19 45z" fill="#fff"/></svg>',
					'</div>',
				'</div',
				'><div class="kPainterPerspect" style="display:none;">',
					'<canvas class="kPainterPerspectCvs"></canvas',
					'><div class="kPainterPerspectCorner" data-index="0">rt</div',
					'><div class="kPainterPerspectCorner" data-index="1">rb</div',
					'><div class="kPainterPerspectCorner" data-index="2">lb</div',
					'><div class="kPainterPerspectCorner" data-index="3">lt</div>',
				'</div',
				'><div class="kPainterGesturePanel"></div>',
			'</div>',
		'</div>'
	].join(''))[0];
	var mainBox = $(containerDiv).children(); 

	kPainter.getHtmlElement = function(){
		return containerDiv;
	};

	var curIndex = -1;
	var imgArr = [];
	var gestureStatus = null;
	var isEditing = false;

	kPainter.getCurIndex = function(){ return curIndex; };
	kPainter.getCount = function(){ return imgArr.length; };
	kPainter.isEditing = function(){
		return isEditing;
	};
	kPainter.getImage = function(isClone, index){
		if(arguments.length < 1){
			isClone = true;
		}
		if(arguments.length < 2){
			index = curIndex;
		}
		if(isNaN(index)){ return; }
		index = Math.round(index);
		if(index < 0 || index >= imgArr.length){ return; }
		return isClone ? $(imgArr[index]).clone()[0] : imgArr[index];
	};

	var onStartLoading = null, onFinishLoading = null;
	var onStartLoadingNoBreak = function(){
		if(onStartLoading){
			try{
				onStartLoading();
			}catch(ex){
				(function(ex){
					setTimeout(function(){
						throw(ex);
					},0);
				})(ex);
			}
		}
	};
	var onFinishLoadingNoBreak = function(){
		if(onFinishLoading){
			try{
				onFinishLoading();
			}catch(ex){
				(function(ex){
					setTimeout(function(){
						throw(ex);
					},0);
				})(ex);
			}
		}
	};
	kPainter.setOnLoading = function(onstart, onfinish){
		onStartLoading = onstart;
		onFinishLoading = onfinish;
	};


	var imgStorer = new function(){

		var imgStorer = this;

		var hideFileIpt = $('<input type="file" accept="image/bmp,image/gif,image/jpeg,image/png" multiple style="display:none">');
		$(hideFileIpt).change(function(){
			for(var i=0; i<this.files.length; ++i){
				addImageAsync(this.files[i]); // have queued inner, so not recur
			}
			$(this).val('');
		});

		kPainter.setHideFileIpt = function(inputEl){
			if(arguments.length >= 1){
				hideFileIpt = inputEl;
			}
			return hideFileIpt;
		};
		kPainter.showFileChooseWindow = function(){
			if(isEditing){ return; }
			hideFileIpt.click();
			return hideFileIpt;
		};

		var loadImgTaskQueue = new TaskQueue();
		var addImageAsync = kPainter.addImageAsync = function(imgData, callback, isClone){
			if(isEditing){ return; }
			if(imgData instanceof HTMLImageElement){
				if(isClone){
					imgData = $(imgData).clone()[0];
				}
			}else if(imgData instanceof Blob){
			}else{
				return;
			}
			onStartLoadingNoBreak();
			(function(callback){
				loadImgTaskQueue.push(
					addImageTask, 
					null, 
					[imgData, function(isSuccess){ 
						if(callback && typeof(callback)=='function'){ setTimeout(function(){ callback(isSuccess); }, 0); }
						loadImgTaskQueue.next();
						if(!loadImgTaskQueue.isWorking){
							onFinishLoadingNoBreak();
						}
					}]
				);
			})(callback);
		};

	    var getTransform = function(blob, callback){
	    	// only jpeg has exif
	    	if("image/jpeg" != blob.type){
	    		callback(null);
	    		return;
	    	}
			EXIF.getData(blob, function(){
				// img from ios may have orientation
				var orient = EXIF.getTag(this, 'Orientation');//,
					//pxX = EXIF.getTag(this, 'PixelXDimension'),
					//pxY = EXIF.getTag(this, 'PixelYDimension');
				var tsf = null;
				switch(orient){
					case 6: tsf = new kUtil.Matrix(0,1,-1,0,1,0); break;
					case 3: tsf = new kUtil.Matrix(-1,0,0,-1,1,1); break;
					case 8: tsf = new kUtil.Matrix(0,-1,1,0,0,1); break;
					default: break;
				}
				callback(tsf);
			});
	    };

	    var isPNGTransparent = function(blob, callback){
    		var hBlob = blob.slice(25,26);
    		var fileReader = new FileReader();
    		fileReader.onload = function(){
    			var hBinaryStr = fileReader.result;
	    		var sign = hBinaryStr.charCodeAt(0);
	    		callback(4 == (sign & 4));
    		}
    		fileReader.readAsBinaryString(hBlob);
	    };
	    var setImgTransparent = function(img, callback){


	    	var type = img.kPainterBlob.type;
	    	// todo: detect if webp transparent
			if(type.indexOf("webp")!=-1 || type.indexOf("gif")!=-1 || type.indexOf("svg")!=-1){
				img.kPainterMightHasTransparent = true;
				callback();
			}else if(type.indexOf("png")!=-1){
				isPNGTransparent(img.kPainterBlob, function(isTransparent){
					img.kPainterMightHasTransparent = isTransparent;
					callback();
				});
			}else{ // like jpeg
				img.kPainterMightHasTransparent = false;
				callback();
			}
	    };

		var addImageTask = function(imgData, callback){

			var afterGetImgAndBlob = function(img){
				setImgTransparent(img, function(){
					getTransform(img.kPainterBlob, function(tsf){
						fixImgOrient(img, tsf, function(){
							addImage(img);
							//img.kPainterBlob = null;
							if(callback){ callback(true); }
						});
					});
				});
			};

			if(imgData instanceof Blob){
				var blob = imgData;
				var img = new Image();
				img.kPainterBlob = blob;
				var objUrl;
				img.onload = img.onerror = function(){
					img.onload = img.onerror = null;
					if(isSupportDrawImageWithObjectUrl){
						URL.revokeObjectURL(objUrl);
					}
					afterGetImgAndBlob(img);
				};
				if(isSupportDrawImageWithObjectUrl){
					objUrl = URL.createObjectURL(blob);
					img.src = objUrl;
				}else{
					var fileReader = new FileReader();
					fileReader.onload = function(){
						img.src = fileReader.result;
					};
					fileReader.readAsDataURL(blob);
				}
			}else{//imgData instanceof HTMLImageElement
				var img = imgData;
				var src = img.src;
				if("data:" == src.substring(0, 5)){
					var mimeType = "";
					if("image/" == src.substring(5, 11)){
						mimeType = src.substring(5, src.indexOf(";", 11));
					}
					img.kPainterBlob = kUtil.convertBase64ToBlob(src.substring(src.indexOf("base64,")+7), mimeType);
					afterGetImgAndBlob(img);
				}else{ // src is link, such as 'https://....'
					kUtil.convertURLToBlob(src, function(blob){
						// url not available
						if(null == blob){
							if(callback){ callback(false); }
						}
						img.kPainterBlob = blob;
						afterGetImgAndBlob(img);
					});
				}
			}
		};

		var fixImgOrient = function(img, tsf, callback){
			if(tsf){
				// fix img from ios
				var tCvs = document.createElement('canvas');
				if(0 != tsf.a*tsf.d && 0 == tsf.b*tsf.c){
					tCvs.width = img.naturalWidth;
					tCvs.height = img.naturalHeight;
				}else{
					tCvs.width = img.naturalHeight;
					tCvs.height = img.naturalWidth;
				}
				var ctx = tCvs.getContext('2d');
				ctx.setTransform(tsf.a, tsf.b, tsf.c, tsf.d, tsf.e*tCvs.width, tsf.f*tCvs.height);
				ctx.drawImage(img, 0, 0);
				var objUrl;
				img.onload = img.onerror = function(){
					img.onload = img.onerror = null;
					if(isSupportDrawImageWithObjectUrl){
						URL.revokeObjectURL(objUrl);
					}
					if(callback){ callback(); }
				};
				if(isSupportDrawImageWithObjectUrl){
					cvsToBlob(tCvs, function(blob){
						img.kPainterBlob = blob;
						objUrl = URL.createObjectURL(blob);
						img.src = objUrl;
					}, (img.kPainterMightHasTransparent ? "image/png" : "image/jpeg"));
				}else{
					img.src = img.kPainterMightHasTransparent ? tCvs.toDataURL() : tCvs.toDataURL("image/jpeg");
				}
			}else{
				if(callback){ callback(); }
			}
		};

		kPainter.isShowNewImgWhenAdd = true;
		var addImage = function(img){
			img.kPainterOriImg = img;
			mainBox.children('.kPainterImgsDiv').append(img);
			$(img).hide();
			imgArr.push(img);
			if(kPainter.isShowNewImgWhenAdd || -1 == curIndex){
				showImg(imgArr.length - 1);
			}
		};

		kPainter.absoluteMD = 100000;
		var setImgStyleNoRatateFit = function(){
			var img = imgArr[curIndex];
			var box = mainBox;
			var pbr = box.paddingBoxRect();
			var cbr = box.contentBoxRect();
			var zoom = img.kPainterZoom = Math.min(cbr.width/img.naturalWidth,cbr.height/img.naturalHeight);
			//img.style.transform = "";
			img.style.width = (Math.round(img.naturalWidth * zoom) || 1) + "px"; 
			img.style.height = (Math.round(img.naturalHeight * zoom) || 1) + "px"; 
			img.style.left = img.style.right = img.style.top = img.style.bottom = -kPainter.absoluteMD+"px";

			if(imgArr.length >= 2){
				var pImg = imgArr[(imgArr.length + curIndex - 1) % imgArr.length];
				zoom = Math.min(cbr.width/pImg.naturalWidth,cbr.height/pImg.naturalHeight);
				pImg.style.width = (Math.round(pImg.naturalWidth * zoom) || 1) + "px"; 
				pImg.style.height = (Math.round(pImg.naturalHeight * zoom) || 1) + "px"; 
				pImg.style.right = kPainter.absoluteMD+"px";
				pImg.style.left = pImg.style.top = pImg.style.bottom = -kPainter.absoluteMD+"px";
			}
			if(imgArr.length >= 3){
				var nImg = imgArr[(imgArr.length + curIndex + 1) % imgArr.length];
				zoom = Math.min(cbr.width/nImg.naturalWidth,cbr.height/nImg.naturalHeight);
				nImg.style.width = (Math.round(nImg.naturalWidth * zoom) || 1) + "px"; 
				nImg.style.height = (Math.round(nImg.naturalHeight * zoom) || 1) + "px"; 
				nImg.style.left = kPainter.absoluteMD+"px";
				nImg.style.right = nImg.style.top = pImg.style.bottom = -kPainter.absoluteMD+"px";
			}
		};

		var resizeTaskId = null;
		var resizeTimeout = 500;
		var isWaitingResize = false;
		var beforeTimeoutIsEditing;
		kPainter.updateUIOnResize = function(isLazy){
			if(null != resizeTaskId){
				clearTimeout(resizeTaskId);
				resizeTaskId = null;
			}
			if(isLazy){
				beforeTimeoutIsEditing = isEditing;
				resizeTaskId = setTimeout(function(){
					if(curIndex != -1 && beforeTimeoutIsEditing == isEditing){
						if(isEditing){
							gesturer.setImgStyleFit();
						}else{
							setImgStyleNoRatateFit();
						}
					}
					resizeTaskId = null;
				}, resizeTimeout);
			}else{
				if(curIndex != -1){
					if(isEditing){
						gesturer.setImgStyleFit();
					}else{
						setImgStyleNoRatateFit();
					}
				}
			}
		};

		var showImg = imgStorer.showImg = function(index){
			var img = imgArr[index];
			$(img).siblings().hide();
			curIndex = index;
			$(img).show();
			if(imgArr.length >= 2){
				if(index > 0 || kPainter.allowedTouchMoveSwitchImgOverBoundary){
					var pImg = imgArr[(imgArr.length + index - 1) % imgArr.length];
					$(pImg).show();
				}
			}
			if(imgArr.length >= 3){
				if(index < imgArr.length - 1 || kPainter.allowedTouchMoveSwitchImgOverBoundary){
					var nImg = imgArr[(imgArr.length + index + 1) % imgArr.length];
					$(nImg).show();
				}
			}
			setImgStyleNoRatateFit();
			updateNumUI();
		};

		var onNumChange = null;
		kPainter.setOnNumChange = function(fun){
			onNumChange = fun;
		};
		var updateNumUI = function(){
			if(onNumChange && typeof(onNumChange)=='function'){try{onNumChange(curIndex, imgArr.length);}catch(ex){}}
		}; 

		/* cmd possible value "f", "p", "n", "l", or a number. 
		 * means first, pre, next, last...
		 */
		kPainter.changePage = function(cmd){
			if(isEditing){ return; }
			var index;
			switch(cmd){
				case "f": index = 0; break;
				case "p": index = curIndex - 1; break;
				case "n": index = curIndex + 1; break;
				case "l": index = imgArr.length - 1; break;
				default: 
					if(arguments.length < 1 || isNaN(cmd)){
						return;
					}else{
						index = Math.round(cmd);
					};
			}
			if(index < 0 || index >= imgArr.length || index == curIndex){ return; }
			showImg(index);
		};

		kPainter.del = function(index){
			if(isEditing){ return; }
			if(arguments.length < 1){
				index = curIndex;
			}
			if(isNaN(index)){ return; }
			index = Math.round(index);
			if(index < 0 || index >= imgArr.length){ return; }
			$(imgArr[index]).remove();
			imgArr.splice(index, 1);
			if(index == curIndex){
				if(curIndex == imgArr.length){
					--curIndex;
				}
				if(curIndex >= 0){
					showImg(curIndex);
				}else{
					updateNumUI();
				}
			}
		};

		kPainter.download = function(filename, index){
			if(isEditing){ return; }
			if(arguments.length < 2){
				index = curIndex;
			}
			if(isNaN(index)){ return; }
			index = Math.round(index);
			if(index < 0 || index >= imgArr.length){ return; }
			var a = document.createElement('a');
			filename = filename || (new Date()).getTime();
			a.target='_blank';
			a.download = filename;
			var img = imgArr[index];
			var objUrl = null;
			if(isSupportDrawImageWithObjectUrl){
				objUrl = URL.createObjectURL(img.kPainterBlob);
				a.href = objUrl;
			}else{
				a.href = img.src;
			}
			var ev = new MouseEvent('click',{
			    "view": window,
			    "bubbles": true,
			    "cancelable": false
			});
			a.dispatchEvent(ev);
			//a.click();
			if(objUrl){
				(function(objUrl){
					setTimeout(function(){
						URL.revokeObjectURL(objUrl);
					}, 10000);
				})(objUrl);
			}
			return filename;
		};

	};

	var gesturer = new function(){
		var gesturer = this;

		var clickTime = Number.NEGATIVE_INFINITY;
		var dblClickInterval = 1000;
		var maxMoveRegardAsDblClick = 8;
		var clickButtons;
		var zoomInRate = 2;
		var zoomOutRate = 0.5;
		var clickDownX, clickDownY, clickUpX, clickUpY;

		var x0, y0, cx, cy, x1, y1, length,
			bpbr, bcbr, bpl, bpt, 
			img, imgTsf, imgW, imgH, 
			left, top, zoom, minZoom, maxZoom = 4;

		var moveTouchId;
		var onTouchNumChange = function(jqEvent){
			jqEvent.preventDefault();// avoid select
			if(-1==curIndex){return;}
			var oEvent = jqEvent.originalEvent;
			var touchs = oEvent.targetTouches;
			var curButtons;
			if(!touchs){
				touchs = [{
					pageX: oEvent.clientX,
					pageY: oEvent.clientY
				}];
				curButtons = oEvent.buttons;
			}
			if(1 == touchs.length){
				x0 = clickDownX = touchs[0].pageX;
				y0 = clickDownY = touchs[0].pageY;
				getImgInfo();

				// if dbl click zoom
				var _clickTime = clickTime;
				clickTime = (new Date()).getTime();
				var _clickButtons = clickButtons;
				clickButtons = curButtons || ((Math.abs(zoom - minZoom) / minZoom < 1e-2) ? 1 : 2);
				if(clickTime - _clickTime < dblClickInterval && 
					clickButtons == _clickButtons && 
					(1 == clickButtons || 2 == clickButtons) &&
					Math.abs(touchs[0].pageX - clickUpX) < maxMoveRegardAsDblClick && 
					Math.abs(touchs[0].pageY - clickUpY) < maxMoveRegardAsDblClick)
				{
					clickTime = Number.NEGATIVE_INFINITY;
					// zoom
					var _cx = x0, _cy = y0, _zoom = zoom;
					var rate = ((1 == clickButtons) ? zoomInRate : zoomOutRate);
					zoom *= rate;
					if(zoom>maxZoom){
						zoom = maxZoom;
						rate = maxZoom / _zoom;
					}
					if(zoom<minZoom){
						zoom = minZoom;
						rate = minZoom / _zoom;
					}
					var imgCx = left + bpbr.pageX0 + bpbr.width / 2,
						imgCy = top + bpbr.pageY0 + bpbr.height / 2;
					left -= (rate-1)*(_cx-imgCx);
					top -= (rate-1)*(_cy-imgCy);
					correctPosZoom();
				}
				
				// move start
				if(null == gestureStatus){
					gestureStatus = 'posZoom';
				}else{ 
					/* avoid touching from cropRect to touchPanel invoke dlclick */
					return; 
				}
				mainBox.find('> .kPainterCroper > .kPainterEdges').children().css('z-index','unset');
				mainBox.find('> .kPainterCroper > .kPainterCorners').children().css('z-index','unset');
				mainBox.find('> .kPainterCroper > .kPainterMover').css('z-index','unset');
				mainBox.find('> .kPainterCroper > .kPainterBigMover').css('z-index','unset');
				moveTouchId = touchs[0].identifier;
			}else if(2 == touchs.length){
				// zoom start
				x0 = clickDownX = touchs[0].pageX;
				y0 = clickDownY = touchs[0].pageY;
				if(null == gestureStatus){
					gestureStatus = 'posZoom';
				}
				if('posZoom' != gestureStatus){
					return;
				}
				getImgInfo();
				mainBox.find('> .kPainterCroper > .kPainterEdges').children().css('z-index','unset');
				mainBox.find('> .kPainterCroper > .kPainterCorners').children().css('z-index','unset');
				mainBox.find('> .kPainterCroper > .kPainterMover').css('z-index','unset');
				mainBox.find('> .kPainterCroper > .kPainterBigMover').css('z-index','unset');
				x1 = touchs[1].pageX;
				y1 = touchs[1].pageY;
				cx = (x0+x1)/2;
				cy = (y0+y1)/2;
				length = Math.sqrt(Math.pow(x0-x1, 2) + Math.pow(y0-y1, 2));
			}else{
				clickUpX = x0, clickUpY = y0;
				onMouseUpOrTouchToZero();
			}
		};
		var maxSpdSwitchRate = 1.2, minSwitchMovLen = 50, minSwitchMovSpd = 200;
		kPainter.allowedTouchMoveSwitchImgOverBoundary = true;
		var onMouseUpOrTouchToZero = function(){
			if(-1==curIndex){return;}
			if('posZoom' == gestureStatus){
				gestureStatus = null;
				mainBox.find('> .kPainterCroper > .kPainterEdges').children().css('z-index', 1);
				mainBox.find('> .kPainterCroper > .kPainterCorners').children().css('z-index', 1);
				mainBox.find('> .kPainterCroper > .kPainterMover').css('z-index', 1);
				mainBox.find('> .kPainterCroper > .kPainterBigMover').css('z-index', 1);
				if(!isEditing && 1!=imgArr.length){
					var rate = zoom / minZoom, spdSwitchAble = false,
						horMovLen, horMovSpd;
					if(rate < maxSpdSwitchRate){
						spdSwitchAble = true;
						horMovLen = x0 - clickDownX;
						horMovSpd = horMovLen / (((new Date()).getTime() - clickTime) / 1000);
					}
					if(left < -(Math.round(imgW*zoom) || 1)/2 || (spdSwitchAble && horMovLen < -minSwitchMovLen && horMovSpd < -minSwitchMovSpd)){
						if(curIndex + 1 < imgArr.length || kPainter.allowedTouchMoveSwitchImgOverBoundary){
							imgStorer.showImg((imgArr.length + curIndex + 1) % imgArr.length);
							return;
						}
					}else if(left > (Math.round(imgW*zoom) || 1)/2 || (spdSwitchAble && horMovLen > minSwitchMovLen && horMovSpd > minSwitchMovSpd)){
						if(curIndex - 1 >= 0 || kPainter.allowedTouchMoveSwitchImgOverBoundary){
							imgStorer.showImg((imgArr.length + curIndex - 1) % imgArr.length);
							return;
						}
					}
				}
				correctPosZoom();
				updateImgPosZoom();
			}
		};

		var getImgInfo = function(isIgnoreCrop){
			var box = mainBox;
			if(isEditing){
				img = box.find('> .kPainterImgsDiv > .kPainterCanvas');
				imgW = img[0].width;
				imgH = img[0].height;
			}else{
				img = $(imgArr[curIndex]);
				imgW = img[0].naturalWidth;
				imgH = img[0].naturalHeight;
			}
			left = parseFloat(img[0].style.left) + kPainter.absoluteMD;
			top = parseFloat(img[0].style.top) + kPainter.absoluteMD;
			imgTsf = img.getTransform();
			if(0 != imgTsf.a*imgTsf.d && 0 == imgTsf.b*imgTsf.c){
			}else{
				var temp = imgW;
				imgW = imgH, imgH = temp;
			}
			zoom = img[0].kPainterZoom || 1;
			bpbr = box.paddingBoxRect();
			bcbr = box.contentBoxRect();
			minZoom = Math.min(bcbr.width / imgW, bcbr.height / imgH);
			if(isEditing && cropGesturer.isCropRectShowing && !isIgnoreCrop){
				var nRect = cropGesturer.getNeededRect();
				minZoom = Math.max(
					Math.max(nRect.width, imgW * minZoom) / imgW,
					Math.max(nRect.height, imgH * minZoom) / imgH
				);
			}
		};

		var updateImgPosZoom = function(){
			//correctPosZoom();
			img[0].style.left = left-kPainter.absoluteMD+'px', img[0].style.right = -left-kPainter.absoluteMD+'px';
			img[0].style.top = top-kPainter.absoluteMD+'px', img[0].style.bottom = -top-kPainter.absoluteMD+'px';
			img[0].kPainterZoom = zoom;
			if(0 != imgTsf.a*imgTsf.d && 0 == imgTsf.b*imgTsf.c){
				img[0].style.width = (Math.round(imgW * zoom) || 1) + "px"; 
				img[0].style.height = (Math.round(imgH * zoom) || 1) + "px"; 
			}else{
				img[0].style.height = (Math.round(imgW * zoom) || 1) + "px"; 
				img[0].style.width = (Math.round(imgH * zoom) || 1) + "px"; 
			}
			if(!isEditing && 1!=imgArr.length){
				var boundaryPaddingD = Math.max(0, ((Math.round(imgW*zoom) || 1) - bpbr.width) / 2);
				if(imgArr.length > 2 || left > boundaryPaddingD){
					var pImg = imgArr[(imgArr.length + curIndex - 1) % imgArr.length];
					pImg.style.left = left - boundaryPaddingD - bpbr.width + 'px';
					pImg.style.right = -left + boundaryPaddingD + bpbr.width + 'px';
				}
				if(imgArr.length > 2 || left <= -boundaryPaddingD){
					var nImg = imgArr[(imgArr.length + curIndex + 1) % imgArr.length];
					nImg.style.left = left + boundaryPaddingD + bpbr.width + 'px';
					nImg.style.right = -left - boundaryPaddingD - bpbr.width + 'px';
				}
			}
		};

		var correctPosZoom = function(bIgnoreHor, bIgnoreVer){
			if(zoom>maxZoom){
				zoom = maxZoom;
			}
			if(zoom<minZoom){
				zoom = minZoom;
			}
			if(!bIgnoreHor){
				var imgVW = (Math.round(imgW*zoom) || 1);
				if(bcbr.width>imgVW){
					left = 0;
				}else{
					var addW = (imgVW - bcbr.width) / 2;
					if(left < - addW){
						left = -addW;
					}else if(left > addW){
						left = addW;
					}
				}
			}
			if(!bIgnoreVer){
				var imgVH = (Math.round(imgH*zoom) || 1);
				if(bcbr.height>imgVH){
					top = 0;
				}else{
					var addH = (imgVH - bcbr.height) / 2;
					if(top < - addH){
						top = -addH;
					}else if(top > addH){
						top = addH;
					}
				}
			}
		};

		gesturer.setImgStyleFit = function(){
			getImgInfo(true);
			zoom = minZoom;
			correctPosZoom();
			updateImgPosZoom();
			cropGesturer.setCropAll();
		};

		mainBox.on((isSupportTouch?'touchstart touchcancel touchend':'mousedown'), onTouchNumChange);//.children(".kPainterGesturePanel")
		if(!isSupportTouch){
			mainBox.on('mouseup', function(jqEvent){
				var oEvent = jqEvent.originalEvent;
				clickUpX = oEvent.clientX, clickUpY = oEvent.clientY;
				onMouseUpOrTouchToZero();
			});
			mainBox.on('mouseleave', function(jqEvent){
				var oEvent = jqEvent.originalEvent;
				if(!oEvent.buttons){return;}// mouse not pressing
				clickUpX = x0, clickUpY = y0;
				onMouseUpOrTouchToZero();
			});
		}
		mainBox.on('contextmenu', function(jqEvent){
			jqEvent.preventDefault();
			//jqEvent.stopPropagation();
		});
		mainBox.on((isSupportTouch?'touchmove':'mousemove'), function(jqEvent){
			jqEvent.preventDefault();// avoid select
			var touchs = jqEvent.originalEvent.targetTouches;
			if(!touchs){
				touchs = [{
					pageX: jqEvent.originalEvent.clientX,
					pageY: jqEvent.originalEvent.clientY
				}];
			}
			if(1 == touchs.length){
				// move
				if('posZoom' != gestureStatus || moveTouchId != touchs[0].identifier){
					// or touch is not same
					return;
				}
				var _x0 = x0, _y0 = y0;
				x0 = touchs[0].pageX;
				y0 = touchs[0].pageY;
				left += x0-_x0;
				top += y0-_y0;
				correctPosZoom(!isEditing);
				updateImgPosZoom();
			}else if(2 == touchs.length){
				// zoom
				if('posZoom' != gestureStatus){
					return;
				}
				var _cx = cx, _cy = cy, _length = length, _zoom = zoom;
				x0 = touchs[0].pageX;
				y0 = touchs[0].pageY;
				x1 = touchs[1].pageX;
				y1 = touchs[1].pageY;
				cx = (x0+x1)/2;
				cy = (y0+y1)/2;
				length = Math.sqrt(Math.pow(x0-x1, 2) + Math.pow(y0-y1, 2));
				//var ibbr = img.borderBoxRect();
				var rate = length/_length;
				zoom *= rate;
				if(zoom>maxZoom){
					zoom = maxZoom;
					rate = maxZoom / _zoom;
				}
				if(zoom<minZoom){
					zoom = minZoom;
					rate = minZoom / _zoom;
				}
				var imgCx = left + bpbr.pageX0 + bpbr.width / 2,
					imgCy = top + bpbr.pageY0 + bpbr.height / 2;
				left -= (rate-1)*(_cx-imgCx);
				top -= (rate-1)*(_cy-imgCy);
				correctPosZoom();
				updateImgPosZoom();
			}
		});

	};

	var editor = new function(){
		var editor = this;

		var curStep;
		/* step/process element like {crop:{left:,top:,width:,height:},transform:,srcImg:} */
		var stack = [];

		var pushStack = editor.pushStack = function(step){
			stack.length = curStep + 1;
			if(!step.srcImg){
				var _process = stack[curStep], 
					_crop = _process.crop,
					sTsf = step.transform, sCrop = step.crop,
					tsf, crop = {};
				if(sTsf){
					tsf = sTsf;
				}else{
					tsf = _process.transform;
				}
				crop.left = _crop.left,
				crop.top = _crop.top,
				crop.width = _crop.width,
				crop.height = _crop.height;
				if(0 != tsf.a*tsf.d && 0 == tsf.b*tsf.c){
					if(sTsf){
						tsf = new kUtil.Matrix(Math.sign(sTsf.a), 0, 0, Math.sign(sTsf.d), 0, 0);
					}
					if(sCrop){
						if(1 == tsf.a){
							crop.left += sCrop.left * _crop.width;
						}else{
							crop.left += (1 - sCrop.left - sCrop.width) * _crop.width;
						}
						if(1 == tsf.d){
							crop.top += sCrop.top * _crop.height;
						}else{
							crop.top += (1 - sCrop.top - sCrop.height) * _crop.height;
						}
						crop.width *= sCrop.width;
						crop.height *= sCrop.height;
					}
				}else{
					if(sTsf){
						tsf = new kUtil.Matrix(0, Math.sign(sTsf.b), Math.sign(sTsf.c), 0, 0, 0);
					}
					if(sCrop){
						if(1 == tsf.b){
							crop.left += sCrop.top * _crop.width;
						}else{
							crop.left += (1 - sCrop.top - sCrop.height) * _crop.width;
						}
						if(1 == tsf.c){
							crop.top += sCrop.left * _crop.height;
						}else{
							crop.top += (1 - sCrop.left - sCrop.width) * _crop.height;
						}
						crop.width *= sCrop.height;
						crop.height *= sCrop.width;
					}
				}
				// set proper accuracy
				var img = imgArr[curIndex];
				var accuracy = Math.pow(10, Math.ceil(Math.max(img.naturalWidth, img.naturalHeight)).toString().length+2);
				crop.left = Math.round(crop.left*accuracy)/accuracy;
				crop.top = Math.round(crop.top*accuracy)/accuracy;
				crop.width = Math.round(crop.width*accuracy)/accuracy;
				crop.height = Math.round(crop.height*accuracy)/accuracy;

				var process = {
					crop: crop,
					transform: tsf,
					srcImg: _process.srcImg
				};
				stack.push(process);
				++curStep;
				updateCvs();
			}else{
				var process = {
					crop: {
						left: 0,
						top: 0,
						width: 1,
						height: 1
					},
					transform: new kUtil.Matrix(1,0,0,1,0,0),
					srcImg: step.srcImg
				};
				stack.push(process);
				++curStep;
			}
		};

		kPainter.undo = function(){
			if(!isEditing){ return; }
			if(curStep > 0){
				fromToStep(curStep, curStep - 1);
			}
		};
		kPainter.redo = function(){
			if(!isEditing){ return; }
			if(curStep < stack.length - 1){
				fromToStep(curStep, curStep + 1);
			}
		};
		kPainter.getStepCount = function(){
			return stack.length;
		};
		kPainter.getCurStep = function(){
			return curStep;
		};
		kPainter.setCurStep = function(index){
			if(arguments.length < 1 || isNaN(index)){
				return;
			}
			index = Math.round(index);
			if(index < 0 || index >= stack.length){ return; }
			fromToStep(curStep, index);
		}

		var canvas = mainBox.find("> .kPainterImgsDiv > .kPainterCanvas")[0];

		var fromToStep = function(fromStep, toStep){
			curStep = toStep;
			var _crop = stack[fromStep].crop;
			var crop = stack[curStep].crop;
			if(_crop.left == crop.left && 
				_crop.top == crop.top && 
				_crop.width == crop.width && 
				_crop.height == crop.bottom
			){
				// case only do transform, don't redraw canvas
				$(canvas).setTransform(stack[curStep].transform);
				gesturer.setImgStyleFit();
			}else{
				updateCvs();
			}
		};

		var showCvs = function(){
			$(canvas).siblings().hide();
			updateCvs();
			if(kPainter.isAutoShowCropUI){ cropGesturer.showCropRect(); }
		};

		var maxEditingCvsWH;
		(function(){
			var dpr = devicePixelRatio;
			var w = screen.width, h = screen.height;
			maxEditingCvsWH = Math.min(w,h)*dpr;
		})();
		var updateCvs = editor.updateCvs = function(bTrueTransform, bNotShow){
			$(canvas).hide();
			var process = stack[curStep];
			var img = process.srcImg || imgArr[curIndex].kPainterOriImg;
			{
				// walk around for ios safari bug
				kPainter._noAnyUseButForIosSafariBug0 = img.naturalWidth;
				kPainter._noAnyUseButForIosSafariBug1 = img.naturalHeight;
			}
			var imgOW = img.naturalWidth;
			var imgOH = img.naturalHeight;
			var crop = process.crop;
			var tsf = process.transform;
			var context2d = canvas.getContext("2d");

			var sWidth = Math.round(imgOW * crop.width) || 1,
				sHeight = Math.round(imgOH * crop.height) || 1;
			var isSwitchedWH = false;
			canvas.hasCompressed = false;
			if(bTrueTransform){
				var cvsW, cvsH;
				if(0 != tsf.a*tsf.d && 0 == tsf.b*tsf.c){
					cvsW = sWidth;
					cvsH = sHeight;
				}else{
					cvsW = sHeight;
					cvsH = sWidth;
					isSwitchedWH = true;
				}
				canvas.width = cvsW;
				canvas.height = cvsH;
				var drawE = cvsW/2 * (1 - tsf.a - tsf.c),
					drawF = cvsH/2 * (1 - tsf.b - tsf.d);
				context2d.setTransform(tsf.a, tsf.b, tsf.c, tsf.d, drawE, drawF);
			}
			// else if(isMobileSafari && (sWidth > 1024 || sHeight > 1024)){
			// 	var rate = 1024 / Math.max(sWidth, sHeight);
			// 	canvas.width = Math.round(sWidth * rate) || 1;
			// 	canvas.height = Math.round(sHeight * rate) || 1;
			// 	canvas.hasCompressed = true;
			// }
			else if(sWidth > maxEditingCvsWH || sHeight > maxEditingCvsWH){
				var rate = maxEditingCvsWH / Math.max(sWidth, sHeight);
				canvas.width = Math.round(sWidth * rate) || 1;
				canvas.height = Math.round(sHeight * rate) || 1;
				canvas.hasCompressed = true;
			}else{
				canvas.width = sWidth;
				canvas.height = sHeight;
			}
			var sx = Math.round(imgOW*crop.left), 
				sy = Math.round(imgOH*crop.top);
			if(sx == imgOW){ --sx; }
			if(sy == imgOH){ --sy; }
			var dWidth, dHeight;
			if(!isSwitchedWH){
				dWidth = canvas.width;
				dHeight = canvas.height;
			}else{
				dWidth = canvas.height;
				dHeight = canvas.width;
			}
			if(sWidth/dWidth <= 2){
				context2d.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight);
			}else{
				var tempCvs = document.createElement('canvas');
				tempCvs.width = Math.round(sWidth/2);
				tempCvs.height = Math.round(sHeight/2);
				var tempCtx = tempCvs.getContext('2d');
				var _sWidth, _sHeight, _dWidth = Math.round(sWidth/2), _dHeight = Math.round(sHeight/2);
				tempCtx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, _dWidth, _dHeight);
				for(;;){
					_sWidth = _dWidth, _sHeight = _dHeight, _dWidth = Math.round(_sWidth/2), _dHeight = Math.round(_sHeight/2);
					if(_dWidth <= dWidth || _dHeight <= dHeight){break;}
					tempCtx.drawImage(tempCvs, 0, 0, _sWidth, _sHeight, 0, 0, _dWidth, _dHeight);
				}
				context2d.drawImage(tempCvs, 0, 0, _sWidth, _sHeight, 0, 0, dWidth, dHeight);
			}
			if(bTrueTransform){
				$(canvas).setTransform(new kUtil.Matrix(1,0,0,1,0,0));
			}else{
				$(canvas).setTransform(tsf);
			}
			if(!bNotShow){
				gesturer.setImgStyleFit();
				$(canvas).show();
			}
		};

		var hideCvs = function(){
			mainBox.find("> .kPainterImgsDiv > .kPainterCanvas").hide();
			cropGesturer.hideCropRect();
		};

		kPainter.enterEdit = function(){
			if(isEditing || -1 == curIndex){return;}
			onStartLoadingNoBreak();
			isEditing = true;

			stack.length = 0;
			var process = imgArr[curIndex].kPainterProcess || {
				crop: {
					left: 0,
					top: 0,
					width: 1,
					height: 1
				},
				transform: new kUtil.Matrix(1,0,0,1,0,0),
				srcImg: null
			};
			stack.push(process);
			curStep = 0;

			showCvs();
			onFinishLoadingNoBreak();
		};

		var quitEdit = kPainter.cancelEdit = function(){
			if(!isEditing){return;}
			isEditing = false;
			imgStorer.showImg(curIndex);
			hideCvs();
		};

		var saveEditedCvsAsync = function(callback, isCover){
			var crop = stack[curStep].crop,
				tsf = stack[curStep].transform,
				srcImg = stack[curStep].srcImg,
				_crop = stack[0].crop,
				_tsf = stack[0].transform,
				_srcImg = stack[0].srcImg;
			var oImg = imgArr[curIndex].kPainterOriImg;
			if(_srcImg != srcImg || _tsf.a != tsf.a || _tsf.b != tsf.b || _tsf.c != tsf.c || _tsf.d != tsf.d ||
				Math.round(oImg.width * crop.left) != Math.round(oImg.width * _crop.left) ||
				Math.round(oImg.height * crop.top) != Math.round(oImg.height * _crop.top) ||
				Math.round(oImg.width * (crop.left + crop.width)) != Math.round(oImg.width * (_crop.left + _crop.width)) ||
				Math.round(oImg.height * (crop.top + crop.height)) != Math.round(oImg.height * (_crop.top + _crop.height)) )
			{
				var img = new Image(); //imgArr[curIndex];
				if(canvas.hasCompressed || tsf.a!=1 || tsf.b!=0 || tsf.c!=0 || tsf.d!=1 || tsf.e!=0 || tsf.f!=0){
					mainBox.find('> .kPainterImgsDiv > .kPainterCanvas').hide();
					updateCvs(true, true);
				}
				img.kPainterOriImg = oImg;
				img.kPainterProcess = stack[curStep];
				var objUrl;
				img.onload = img.onerror = function(){
					img.onload = img.onerror = null;
					if(isSupportDrawImageWithObjectUrl){
						URL.revokeObjectURL(objUrl);
					}
					if(isCover){
						$(imgArr[curIndex]).remove();
						imgArr.splice(curIndex, 1, img);
					}else{
						imgArr.splice(++curIndex, 0, img);
					}
					mainBox.children('.kPainterImgsDiv').append(img);
					callback();
				};
				if(isSupportDrawImageWithObjectUrl){
					cvsToBlob(canvas, function(blob){
						img.kPainterBlob = blob;
						objUrl = URL.createObjectURL(blob);
						img.src = objUrl;
					}, (oImg.kPainterMightHasTransparent ? "image/png" : "image/jpeg"));
				}else{
					img.src = oImg.kPainterMightHasTransparent ? canvas.toDataURL() : canvas.toDataURL("image/jpeg");
				}
			}else{
				callback();
			}
		};

		var isSavingEdit = false;
		kPainter.saveEditAsync = function(callback, isCover){
			if(!isEditing || isSavingEdit){return;}
			isSavingEdit = true;
			onStartLoadingNoBreak();
			setTimeout(function(){
				saveEditedCvsAsync(function(){
					quitEdit();
					onFinishLoadingNoBreak();
					if(callback && typeof(callback)=='function'){ setTimeout(callback, 0); }
					isSavingEdit = false;
				}, isCover);
			},100);
		};

		kPainter.rotateRight = function(){
			if(!isEditing){ return; }
			var transformOri = $(canvas).getTransform();
			var transformNew = kUtil.Matrix.dot(new kUtil.Matrix(0,1,-1,0,0,0), transformOri);
			$(canvas).setTransform(transformNew);
			pushStack({
				transform: transformNew
			});
		};
		kPainter.rotateLeft = function(){
			if(!isEditing){ return; }
			var transformOri = $(canvas).getTransform();
			var transformNew = kUtil.Matrix.dot(new kUtil.Matrix(0,-1,1,0,0,0), transformOri);
			$(canvas).setTransform(transformNew);
			pushStack({
				transform: transformNew
			});
		};
		kPainter.mirror = function(){
			if(!isEditing){ return; }
			var transformOri = $(canvas).getTransform();
			var transformNew = kUtil.Matrix.dot(new kUtil.Matrix(-1,0,0,1,0,0), transformOri);
			$(canvas).setTransform(transformNew);
			pushStack({
				transform: transformNew
			});
		};
	};

	var cropGesturer = new function(){

		var cropGesturer = this;

		kPainter.isAutoShowCropUI = true;
		var kPainterCroper = mainBox.children('.kPainterCroper');
		cropGesturer.isCropRectShowing = false;
		kPainter.showCropRect = cropGesturer.showCropRect = function(){
			if(!isEditing){ return; }
			cropGesturer.isCropRectShowing = true;
			setCropAll();
			kPainterCroper.show();
		}
		kPainter.hideCropRect = cropGesturer.hideCropRect = function(){
			cropGesturer.isCropRectShowing = false;
			kPainterCroper.hide();
		}

		kPainterCroper.css({
			"border-left-width":kPainter.absoluteMD+"px",
			"border-top-width":kPainter.absoluteMD+"px",
			"border-right-width":kPainter.absoluteMD+"px",
			"border-bottom-width":kPainter.absoluteMD+"px",
			"left":-kPainter.absoluteMD+"px",
			"top":-kPainter.absoluteMD+"px",
			"right":-kPainter.absoluteMD+"px",
			"bottom":-kPainter.absoluteMD+"px"});
		
		var x0, y0, moveTouchId, orientX, orientY, bpbr, bcbr, 
			cvs = mainBox.find('> .kPainterImgsDiv > .kPainterCanvas'),
			cvsLeft, cvsTop, cvsRight, cvsBottom, cvsW, cvsH,
			left, top, width, height,
			minW = 50, minH = 50, minLeft, minTop, maxRight, maxBottom;
		var onTouchChange = function(jqEvent){
			jqEvent.preventDefault();// avoid select
			var touchs = jqEvent.originalEvent.targetTouches;
			if(!touchs){
				touchs = [{
					pageX: jqEvent.originalEvent.clientX,
					pageY: jqEvent.originalEvent.clientY
				}];
			}
			if(1 == touchs.length){
				if(null == gestureStatus){
					gestureStatus = 'crop';
				}else{ 
					/* avoid like touching from left-top to top make orient change */ 
					return; 
				}
				// if('crop' != gestureStatus){
				// 	return;
				// }
				moveTouchId = touchs[0].identifier;
				x0 = touchs[0].pageX;
				y0 = touchs[0].pageY;
				var arr = $(this).attr('data-orient').split(',');
				orientX = arr[0];
				orientY = arr[1];
				getInfo();
			}else{
				if('crop' == gestureStatus){
					gestureStatus = null;
				}
			}
		};

		var onMouseCancel = function(){
			if('crop' == gestureStatus){
				gestureStatus = null;
			}
		};
		var getInfo = function(){
			var box = mainBox;
			bpbr = box.paddingBoxRect();
			bcbr = box.contentBoxRect();
			getCvsInfo();
			width = parseFloat(kPainterCroper[0].style.width);
			height = parseFloat(kPainterCroper[0].style.height);
			left = parseFloat(kPainterCroper[0].style.left)-width/2+kPainter.absoluteMD;
			top = parseFloat(kPainterCroper[0].style.top)-height/2+kPainter.absoluteMD;
			minLeft = Math.max(-bcbr.width/2, cvsLeft);
			minTop = Math.max(-bcbr.height/2, cvsTop);
			maxRight = Math.min(bcbr.width/2, cvsRight);
			maxBottom = Math.min(bcbr.height/2, cvsBottom);
		};
		var getCvsInfo = function(){
			var tsf = cvs.getTransform();
			var zoom = cvs[0].kPainterZoom;
			var cx = parseFloat(cvs[0].style.left)+kPainter.absoluteMD;
			var cy = parseFloat(cvs[0].style.top)+kPainter.absoluteMD;
			if(0 != tsf.a*tsf.d && 0 == tsf.b*tsf.c){
				cvsW = parseFloat(cvs[0].style.width), cvsH = parseFloat(cvs[0].style.height);
			}else{
				cvsW = parseFloat(cvs[0].style.height), cvsH = parseFloat(cvs[0].style.width);
			}
			var hzCvsW = cvsW/2, hzCvsH = cvsH/2;
			cvsLeft = cx - hzCvsW;
			cvsTop = cy - hzCvsH;
			cvsRight = cx + hzCvsW;
			cvsBottom = cy + hzCvsH;
		};
		mainBox.find('> .kPainterCroper > .kPainterEdges > div, > .kPainterCroper > .kPainterCorners > div, > .kPainterCroper > .kPainterMover, > .kPainterCroper > .kPainterBigMover')
			.on((isSupportTouch?'touchstart touchcancel touchend':'mousedown'), onTouchChange);
		if(!isSupportTouch){
			//mainBox.on('mouseup mouseleave', onMouseCancel);
			mainBox.on('mouseup', function(jqEvent){
				onMouseCancel();
			});
			mainBox.on('mouseleave', function(jqEvent){
				var oEvent = jqEvent.originalEvent;
				if(!oEvent.buttons){return;}// mouse not pressing
				onMouseCancel();
			});
		}

		var setCropBox = function(){
			kPainterCroper[0].style.left = (left+width/2-kPainter.absoluteMD)+'px';
			kPainterCroper[0].style.right = (-left-width/2-kPainter.absoluteMD)+'px';
			kPainterCroper[0].style.top = (top+height/2-kPainter.absoluteMD)+'px';
			kPainterCroper[0].style.bottom = (-top-height/2-kPainter.absoluteMD)+'px';
			kPainterCroper[0].style.width = width+'px';
			kPainterCroper[0].style.height = height+'px';
		};

		mainBox.on((isSupportTouch?'touchmove':'mousemove'), function(jqEvent){
			jqEvent.preventDefault();// avoid select
			var touchs = jqEvent.originalEvent.targetTouches;
			if(!touchs){
				touchs = [{
					pageX: jqEvent.originalEvent.clientX,
					pageY: jqEvent.originalEvent.clientY
				}];
			}
			if(1 == touchs.length){
				if('crop' != gestureStatus || moveTouchId != touchs[0].identifier){
					// or touch is not same
					return;
				}
				var _x0 = x0, _y0 = y0;
				x0 = touchs[0].pageX;
				y0 = touchs[0].pageY;
				var dx0 = x0-_x0, dy0 = y0-_y0;
				if(-1 == orientX){
					if(width-dx0<minW){
						dx0 = width - minW;
					}
					if(left+dx0<minLeft){
						dx0 = minLeft-left;
					}
					width -= dx0;
					left += dx0;
				}else if(1 == orientX){
					if(width+dx0<minW){
						dx0 = -width + minW;
					}
					if(left+width+dx0>maxRight){
						dx0=maxRight-width-left;
					}
					width += dx0;
				}
				if(-1 == orientY){
					if(height-dy0<minH){
						dy0 = height - minH;
					}
					if(top+dy0<minTop){
						dy0 = minTop-top;
					}
					height -= dy0;
					top += dy0;
				}else if(1 == orientY){
					if(height+dy0<minH){
						dy0 = -height + minH;
					}
					if(top+height+dy0>maxBottom){
						dy0 = maxBottom-height-top;
					}
					height += dy0;
				}
				if(0 == orientX && 0 == orientY){
					if(left+dx0<minLeft){
						dx0 = minLeft-left;
					}else if(left+width+dx0>maxRight){
						dx0=maxRight-width-left;
					}
					if(top+dy0<minTop){
						dy0 = minTop-top;
					}else if(top+height+dy0>maxBottom){
						dy0 = maxBottom-height-top;
					}
					left += dx0;
					top += dy0;
				}
				setCropBox();
			}
		});

		var setCropAll = cropGesturer.setCropAll = function(){
			if(!cropGesturer.isCropRectShowing){ return; }
			getInfo();
			left = minLeft;
			top = minTop;
			width = maxRight-minLeft;
			height = maxBottom-minTop;
			setCropBox();
		};
		cropGesturer.getNeededRect = function(){
			getInfo();
			var rect = {};
			rect.width = 2 * Math.max(-left, left + width);
			rect.height = 2 * Math.max(-top, top + height);
			return rect;
		};

		kPainter.crop = function(l, t, w, h){
			if(!isEditing){ return; }
			getInfo();
			if(arguments.length >= 4){
			}else{
				if(!cropGesturer.isCropRectShowing){
					return;
				}
				l = (left - cvsLeft) / cvsW,
				t = (top - cvsTop) / cvsH,
				w = width / cvsW,
				h = height / cvsH;
			}
			if(l*cvs.width < 0.5 && (1-l-w)*cvs.width < 0.5 && t*cvs.height < 0.5 && (1-t-h)*cvs.height < 0.5){
				return;
			}
			editor.pushStack({
				crop: {
					left: l,
					top: t,
					width: w,
					height: h
				}
			});
		};
	};

	var opencv = new function(){
		var opencv = this;
		var cvHasLoaded = false;

		kPainter.loadCvScript = function(callback){
			onStartLoadingNoBreak();
			// CVModule for cv-wasm.js or cv.js
			window.CVModule = {
				cvFolder: 'js',
				preRun: [],
			    postRun: [],
			    isRuntimeInitialized: false,
				onRuntimeInitialized: function() {
					cvHasLoaded = true;
					console.log("Runtime is ready!");
					onFinishLoadingNoBreak();
					if(typeof callback == 'function'){setTimeout(callback, 0);}
				},
			    print: function(text) {
			      console.log(text);
			    },
			    printErr: function(text) {
			      console.log(text);
			    },
			    setStatus: function(text) {
			      console.log(text);
			    },
			    totalDependencies: 0
			};
			window.CVModule.setStatus('Downloading...');
			if(window.WebAssembly){
				//webassembly
				$.getScript("js/cv-wasm.js");
			}else{
				//asm js
				$.getScript("js/cv.js");
			}
		};

		(function(){
			var PS = {
				blurSize:5,
				cannyThreshold1: 8,
				cannyThreshold2Rt: 0.5,
				houghLineRho: 1,
				houghLineTheta: Math.PI / 180,
				houghLineThreshold: 8,
				houghLinesMinLength: 8,
				houghLinesMaxGap: 3,//5
				linesMaxRadDifToHV: Math.PI / 6,
				fitlineMaxDRange: 2,
				fitlineMaxRadRange: Math.PI / 18,
				cornerMinRad: Math.PI / 3
			};

			var canvas = mainBox.find("> .kPainterImgsDiv > .kPainterCanvas")[0];

			var getThumbImgData = function(maxwh) {
				var width = canvas.width,
					height = canvas.height,
					resizeRt = 1;
				if(width > height){
					if(width > maxwh){
						resizeRt = maxwh / width;
						width = maxwh;
						height = Math.round(height * resizeRt) || 1;
					}
				}else{
					if(height > maxwh){
						resizeRt = maxwh / height;
						height = maxwh;
						width = Math.round(width * resizeRt) || 1;
					}
				}
				var tsf = $(canvas).getTransform();
				var tsfW, tsfH;
				if(0 != tsf.a*tsf.d && 0 == tsf.b*tsf.c){
					tsfW = width, tsfH = height;
				}else{
					tsfW = height, tsfH = width;
				}
				var tempCvs = document.createElement("canvas");
				tempCvs.width = tsfW;
				tempCvs.height = tsfH;
				var ctx = tempCvs.getContext('2d');
				var drawE = tsfW/2 * (1 - tsf.a - tsf.c);
				var drawF = tsfH/2 * (1 - tsf.b - tsf.d);
				ctx.setTransform(tsf.a, tsf.b, tsf.c, tsf.d, drawE, drawF);
				ctx.drawImage(canvas, 0, 0, width, height);
				var imgData = ctx.getImageData(0,0,tsfW,tsfH);
				return imgData;
			};

			kPainter.documentDetect = function(callback){
				if(gestureStatus != 'perspect'){ return; }
				onStartLoadingNoBreak();

				setTimeout(function(){

					var src = new cv.matFromArray(getThumbImgData(256), cv.CV_8UC4);
					let srcW = src.cols, srcH = src.rows,
						whMin = Math.min(src.cols, src.rows);
					cv.cvtColor(src, src, cv.ColorConversionCodes.COLOR_RGBA2GRAY.value, 0);

					var blurred = new cv.Mat();
					var blurSize = PS.blurSize;
					cv.GaussianBlur(src, blurred, [blurSize, blurSize], 0, 0, cv.BORDER_DEFAULT);
					src.delete();

					var cannyed = new cv.Mat();//cannyedTemp = new cv.Mat(),
					cv.Canny(blurred, cannyed/*Temp*/, PS.cannyThreshold1, PS.cannyThreshold2Rt * whMin, 3/*canny_aperture_size*/, false);
					blurred.delete();

					var linesMat = new cv.Mat();//IntVectorVector();
					cv.HoughLinesP(cannyed, linesMat, PS.houghLineRho, PS.houghLineTheta, PS.houghLineThreshold, PS.houghLinesMinLength, PS.houghLinesMaxGap);
					cannyed.delete();
					var lineOriPxys = linesMat.data32s();

					var linePxys = [];
					var srcWh = srcW/2;
					var srcHh = srcH/2;
					for(let i=0;i<lineOriPxys.length;i+=2){
						linePxys.push(lineOriPxys[i]-srcWh);
						linePxys.push(lineOriPxys[i+1]-srcHh);
					}
					linesMat.delete();

					var linesAll = [];
					for(let i=0;i<linePxys.length;i+=4){
						let x0 = linePxys[i+0],
							y0 = linePxys[i+1],
							x1 = linePxys[i+2],
							y1 = linePxys[i+3];
						let a = y0 - y1,
							b = x1 - x0,
							c = x0 * y1 - x1 * y0;
						// when 0 == c, not calc the line
						if(0 == c){ continue; }
						let cOrisign = c < 0 ? -1 : 1 ;
						let r = Math.sqrt(a * a + b * b);
						a = a / r * cOrisign;
						b = b / r * cOrisign;
						c = c / r * cOrisign;
						let rad = Math.atan(a / b);
						// line should in horizontal or vertical
						{
							let ra = Math.abs(rad);
							if(ra > PS.linesMaxRadDifToHV && ra < Math.PI / 2 - PS.linesMaxRadDifToHV){
								continue;
							}
						}
						// rad anticlockwise, (-PI, PI]
						if(b < 0){
							if(0 == a){
								b = -1;
								rad = 0;
							}else{
								rad = -rad;
							}
						}else if(b > 0){
							if(a < 0){
								rad = -Math.PI - rad;
							}else if(a > 0){
								rad = Math.PI - rad;
							}else{// 0 == a
								b = 1;
								rad = Math.PI;
							}
						}else{// 0 == b
							if(a > 0){
								a = 1;
								rad = Math.PI / 2;
							}else{// a < 0
								a = -1;
								rad = -Math.PI / 2;
							}
						}
						let l = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
						linesAll.push([a, b, c, rad, l]);
					}

					var linePreFiteds = [];
					var lineFiteds = [];
					var fitlineMaxDRange = PS.fitlineMaxDRange;
					var fitlineMaxRadRange = PS.fitlineMaxRadRange;
					GetfitLine(linesAll, linePreFiteds, fitlineMaxDRange, fitlineMaxRadRange, whMin*0.7);
					GetfitLine(linePreFiteds, lineFiteds, fitlineMaxDRange, fitlineMaxRadRange, whMin*0.7);

					var lineFiltered = [null, null, null, null];
					for(let i = 0; i < lineFiteds.length; ++i){
						let line = lineFiteds[i];
						let rad = line[3];
						let pos = null;
						if(rad < -Math.PI * 3 / 4){
							pos = 0;
						}else if(rad < -Math.PI / 4){
							pos = 1;
						}else if(rad < Math.PI / 4){
							pos = 2;
						}else if(rad < Math.PI * 3 / 4){
							pos = 3;
						}else{
							pos = 0;
						}
						if(!lineFiltered[pos]){
							lineFiltered[pos] = line;
						}else{
							let _line = lineFiltered[pos];
							let _c = _line[2], _l = _line[4],
								c =  line[2], l = line[4];
							if(c * l > _c * _l){
								lineFiltered[pos] = line;
							}
						}
					}

					for(let i = 0; i < lineFiltered.length; ++i){
						let line = lineFiltered[i];
						if(null == line){
							// line not found, use border
							line = [];
							lineFiltered[i] = line;
							if(0 == i){
								line[2] = srcHh;
								line[3] = Math.PI;
							}else if(1 == i){
								line[2] = srcWh;
								line[3] = -Math.PI / 2;
							}else if(2 == i){
								line[2] = srcHh;
								line[3] = 0;
							}else if(3 == i){
								line[2] = srcWh;
								line[3] = Math.PI / 2;
							}
						}
						line[0] = Math.sin(line[3]);
						line[1] = -Math.cos(line[3]);
					}

					var cornerPoints = [];
					for(let i = 0; i < lineFiltered.length; ++i){
						let line1 = lineFiltered[i],
							line2 = lineFiltered[(i + 1) % lineFiltered.length];
						let a1 = line1[0],
							b1 = line1[1],
							c1 = line1[2],
							rad1 = line1[3];
							a2 = line2[0],
							b2 = line2[1],
							c2 = line2[2],
							rad2 = line2[3];
						let x0 = (b1 * c2 - b2 * c1) / (b2 * a1 - b1 * a2),
							y0 = (a1 * c2 - a2 * c1) / (a2 * b1 - a1 * b2);
						cornerPoints.push([x0 / srcW, y0 / srcH]);
					}

					setCornerPos(cornerPoints);
					onFinishLoadingNoBreak();
					if(typeof callback == "function"){callback();} 

				},100);
			};
			var GetfitLine = function(inputlines, outputlines, fitlineMaxDRange, fitlineMaxRadRange, maxLength){
				for(let i = 0; i < inputlines.length; ++i){
					let line = inputlines[i];
					let hasFited = false;
					for(let j = 0; j < outputlines.length; ++j){
						let fited = outputlines[j];
						let _rad = fited[3], rad = line[3];
						let radDifRaw = _rad - rad;//rad
						if(radDifRaw > Math.PI){
							rad += Math.PI * 2;
						}else if(radDifRaw < -Math.PI){
							rad -= Math.PI * 2;
						}
						let radDif = Math.abs(_rad - rad);
						let dDif = Math.abs(fited[2] - line[2]);//c
						if(radDif < fitlineMaxRadRange && dDif < fitlineMaxDRange){
							hasFited = true;
							let _l = fited[4], l = line[4];
							let sl = _l + l;
							fited[2] = (fited[2] * _l + line[2] * l) / sl;
							let nrad;
							nrad = (_rad * _l + rad * l) / sl;
							if(nrad > Math.PI){ nrad -= Math.PI * 2; }
							else if(nrad <= -Math.PI){ nrad += Math.PI * 2; }
							fited[3] = nrad;
							fited[4] = Math.min(sl, maxLength);
							break;
						}
					}
					if(!hasFited){
						outputlines.push([null,null,line[2],line[3], line[4]]);
					}
				}
			};
			var psptBox = mainBox.children(".kPainterPerspect");
			var psptBorderCvs = mainBox.find("> .kPainterPerspect > .kPainterPerspectCvs")[0];
			var setCornerPos = kPainter.setFreeTransformCornerPos = function(cornerPoints){
				var cvsZoom = canvas.kPainterZoom,
					tsf = $(canvas).getTransform();
				var cvsVW = canvas.width * cvsZoom,
					cvsVH = canvas.height * cvsZoom;
				if(0 != tsf.a*tsf.d && 0 == tsf.b*tsf.c){}else{
					var temp = cvsVW; cvsVW = cvsVH; cvsVH = temp;
				}
				var rect = mainBox.borderBoxRect();
				var mbwh = rect.width / 2,
					mbhh = rect.height / 2;
				for(var i = 0; i < cornerMovers.length; ++i){
					var cornerMover = cornerMovers[i];
					var index = $(cornerMover).attr('data-index');
					var p = cornerPoints[index];
					var l = cvsVW * p[0], t = cvsVH * p[1];
					if(l < -mbwh){
						l = -mbwh;
					}else if(l > mbwh){
						l = mbwh;
					}
					if(t < -mbhh){
						t = -mbhh;
					}else if(t > mbhh){
						t = mbhh;
					}
					cornerMover.style.left = l + 'px';
					cornerMover.style.right = -l + 'px';
					cornerMover.style.top = t + 'px';
					cornerMover.style.bottom = -t + 'px';
				}
				drawBorderLine();
				psptBox.show();
			};
			var drawBorderLine = function(){
				var rect = mainBox.borderBoxRect();
				psptBorderCvs.width = Math.round(rect.width);
				psptBorderCvs.height = Math.round(rect.height);
				var cornerPointLTs = [];
				for(var i = 0; i < cornerMovers.length; ++i){
					cornerPointLTs.push([
						Math.round(parseFloat(cornerMovers[i].style.left) + rect.width / 2),
						Math.round(parseFloat(cornerMovers[i].style.top) + rect.height / 2)
					]);
				}
				var ctx = psptBorderCvs.getContext('2d');
				ctx.strokeStyle = "#0F0";
				ctx.lineWidth = 3;
				ctx.setLineDash([10, 5]);
				ctx.beginPath();
				ctx.moveTo(cornerPointLTs[0][0], cornerPointLTs[0][1]);
				ctx.lineTo(cornerPointLTs[1][0], cornerPointLTs[1][1]);
				ctx.lineTo(cornerPointLTs[2][0], cornerPointLTs[2][1]);
				ctx.lineTo(cornerPointLTs[3][0], cornerPointLTs[3][1]);
				ctx.closePath();
				ctx.stroke();
			};

			var cornerMovers = mainBox.find("> .kPainterPerspect > .kPainterPerspectCorner");
			cornerMovers.css('left', '0');
			cornerMovers.css('top', '0');
			cornerMovers.css('right', '0');
			cornerMovers.css('bottom', '0');
			var moveTouchId = null, x0, y0, activedCorner;
			cornerMovers.on((isSupportTouch?'touchstart touchcancel touchend':'mousedown'), function(jqEvent){
				activedCorner = this;
				jqEvent.preventDefault();// avoid select
				var touchs = jqEvent.originalEvent.targetTouches;
				if(!touchs){
					touchs = [{
						pageX: jqEvent.originalEvent.clientX,
						pageY: jqEvent.originalEvent.clientY
					}];
				}
				if(1 == touchs.length){
					if('perspect' == gestureStatus){
						gestureStatus = 'perspectCornerMoving';
					}
					moveTouchId = touchs[0].identifier;
					x0 = touchs[0].pageX;
					y0 = touchs[0].pageY;
				}else if('perspectCornerMoving' == gestureStatus){
					gestureStatus = 'perspect';
				}
			});
			mainBox.on((isSupportTouch?'touchmove':'mousemove'), function(jqEvent){
				jqEvent.preventDefault();// avoid select
				var touchs = jqEvent.originalEvent.targetTouches;
				if(!touchs){
					touchs = [{
						pageX: jqEvent.originalEvent.clientX,
						pageY: jqEvent.originalEvent.clientY
					}];
				}
				if(1 == touchs.length){
					if('perspectCornerMoving' != gestureStatus || moveTouchId != touchs[0].identifier){
						// or touch is not same
						return;
					}
					var _x0 = x0, _y0 = y0;
					x0 = touchs[0].pageX;
					y0 = touchs[0].pageY;
					var dx0 = x0-_x0, dy0 = y0-_y0;
					var left = parseFloat(activedCorner.style.left) + dx0;
					var top = parseFloat(activedCorner.style.top) + dy0;
					activedCorner.style.left = left + 'px';
					activedCorner.style.right = -left + 'px';
					activedCorner.style.top = top + 'px';
					activedCorner.style.bottom = -top + 'px';
					drawBorderLine();
				}
			});
			if(!isSupportTouch){
				mainBox.on('mouseup', function(jqEvent){
					if('perspectCornerMoving' == gestureStatus){
						gestureStatus = 'perspect';
					}
				});
				mainBox.on('mouseleave', function(jqEvent){
					var oEvent = jqEvent.originalEvent;
					if(!oEvent.buttons){return;}// mouse not pressing
					if('perspectCornerMoving' == gestureStatus){
						gestureStatus = 'perspect';
					}
				});
			}
			kPainter.freeTransform = function(callback){
				if(gestureStatus != 'perspect'){ return; }
				onStartLoadingNoBreak();
				var cornerPoints = [];
				var cvsZoom = canvas.kPainterZoom,
					tsf = $(canvas).getTransform();
				var cvsVW = canvas.width * cvsZoom,
					cvsVH = canvas.height * cvsZoom;
				if(0 != tsf.a*tsf.d && 0 == tsf.b*tsf.c){}else{
					var temp = cvsVW; cvsVW = cvsVH; cvsVH = temp;
				}
				for(var i = 0; i < cornerMovers.length; ++i){
					var mover = cornerMovers[i];
					cornerPoints.push([parseFloat(mover.style.left) / cvsVW, parseFloat(mover.style.top) / cvsVH]);
				}
				var cps = cornerPoints;
				if(Math.abs(cps[0][0] - 0.5) < 0.005 &&
					Math.abs(cps[0][1] + 0.5) < 0.005 &&
					Math.abs(cps[1][0] - 0.5) < 0.005 &&
					Math.abs(cps[1][1] - 0.5) < 0.005 &&
					Math.abs(cps[2][0] + 0.5) < 0.005 &&
					Math.abs(cps[2][1] - 0.5) < 0.005 &&
					Math.abs(cps[3][0] + 0.5) < 0.005 &&
					Math.abs(cps[3][1] + 0.5) < 0.005){
					onFinishLoadingNoBreak();
					if(typeof callback == "function"){callback();}
					return;
				}
				setTimeout(function(){
					//editor.updateCvs(true, true);

					var src = new cv.matFromArray(getThumbImgData(2048), cv.CV_8UC4);
					cv.cvtColor(src, src, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);

					var fromCornerMat = new cv.Mat.zeros(4, 1, cv.CV_32FC2); //cv.Point2fVector();
					var fcd = fromCornerMat.data32f();
					for(let i = 0; i < cornerPoints.length; ++i){
						let p = cornerPoints[i];
						fcd[2 * i] = Math.round((p[0] + 0.5) * src.cols);
						fcd[2 * i + 1] = Math.round((p[1] + 0.5) * src.rows);
					}

					var x0 = fcd[0] - fcd[6],
						y0 = fcd[1] - fcd[7],
						x1 = fcd[0] - fcd[2],
						y1 = fcd[3] - fcd[1],
						x2 = fcd[2] - fcd[4],
						y2 = fcd[5] - fcd[3],
						x3 = fcd[6] - fcd[4],
						y3 = fcd[5] - fcd[7];
					var psptWidth = Math.round(Math.max(Math.sqrt(x0 * x0 + y0 * y0), Math.sqrt(x2 * x2 + y2 * y2))), 
						psptHeight = Math.round(Math.max(Math.sqrt(x1 * x1 + y1 * y1), Math.sqrt(x3 * x3 + y3 * y3)));
					var toCornerMat = new cv.Mat.zeros(4, 1, cv.CV_32FC2);//cv.Point2fVector();
					var toCornerData32f = toCornerMat.data32f();
					toCornerData32f[0] = psptWidth;
					toCornerData32f[2] = psptWidth;
					toCornerData32f[3] = psptHeight;
					toCornerData32f[5] = psptHeight;
					var tsfMat = cv.getPerspectiveTransform(fromCornerMat, toCornerMat);
					fromCornerMat.delete();
					toCornerMat.delete();

					var perspectTsfed = new cv.Mat.zeros(psptHeight, psptWidth, cv.CV_8UC3);
					var color = new cv.Scalar(0, 255, 0);
					cv.warpPerspective(src, perspectTsfed, tsfMat, [perspectTsfed.rows, perspectTsfed.cols], cv.InterpolationFlags.INTER_LINEAR.value, cv.BORDER_CONSTANT, color);
					//putResultImgCvs(perspectTsfed);
					src.delete();
					tsfMat.delete();
					color.delete();
					var imgData = new ImageData(psptWidth, psptHeight);
					var channels = perspectTsfed.channels();
					var data = perspectTsfed.data();
					for (let i = 0, j = 0; i < data.length; i += channels, j+=4) {
						imgData.data[j] = data[i];
						imgData.data[j + 1] = data[i+1%channels];
						imgData.data[j + 2] = data[i+2%channels];
						imgData.data[j + 3] = 255;
					}
					perspectTsfed.delete();

					canvas.width = psptWidth;
					canvas.height = psptHeight;
					var ctx = canvas.getContext('2d');
					//gesturer.setImgStyleFit();
					ctx.putImageData(imgData, 0, 0);
					gesturer.setImgStyleFit();

					var imgEl = new Image();
					
					imgEl.onload = function(){
						imgEl.onload = null;
						//psptBox.hide();
						editor.pushStack({
							srcImg: imgEl
						});
						setCornerPos([[0.5,-0.5],[0.5,0.5],[-0.5,0.5],[-0.5,-0.5]]);
						//if(kPainter.isAutoShowCropUI){ cropGesturer.showCropRect(); }
						//gestureStatus = null;

						onFinishLoadingNoBreak();

						if(typeof callback == "function"){callback();} 
					}

					if(isSupportDrawImageWithObjectUrl){
						cvsToBlob(canvas, function(blob){
							objUrl = URL.createObjectURL(blob);
							imgEl.src = objUrl;
						}, "image/png");
					}else{
						imgEl.src = canvas.toDataURL();
					}

				}, 0);
			};
			kPainter.enterFreeTransformMode = function(callback){
				if(!isEditing || !cvHasLoaded){ return; }
				gestureStatus = 'perspect';
				onStartLoadingNoBreak();
				setTimeout(function(){
					cropGesturer.hideCropRect();
					editor.updateCvs(true);
					setCornerPos([[0.5,-0.5],[0.5,0.5],[-0.5,0.5],[-0.5,-0.5]]);
					psptBox.show();
					onFinishLoadingNoBreak();
					if(typeof callback == 'function'){callback();}
				}, 0);
			};
			kPainter.exitFreeTransformMode = function(){
				if(gestureStatus != 'perspect'){ return; }
				psptBox.hide();
				editor.updateCvs();
				if(kPainter.isAutoShowCropUI){ cropGesturer.showCropRect(); }
				gestureStatus = null;
			};
		})();
	};
};
