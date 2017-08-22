var KPainter = function(){
	var kPainter = this;

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
					'</div>',
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
	kPainter.getImage = function(index){
		if(arguments.length < 1){
			index = curIndex;
		}
		if(isNaN(index) || 0 > index || index > imgArr.length - 1){ return; }
		index = Math.round(index);
		return $(imgArr[index]).clone()[0];
	};

	var onStartLoading = null, onFinishLoading = null;
	kPainter.setOnLoading = function(onstart, onfinish){
		onStartLoading = onstart;
		onFinishLoading = onfinish;
	};


	var imgStorer = new function(){

		var imgStorer = this;

		var hideFileIpt = $('<input type="file" accept="image/bmp,image/gif,image/jpeg,image/png" multiple style="display:none">');
		$(hideFileIpt).change(function(){
			for(var i=0; i<this.files.length; ++i){
				addBlobImageAsync(this.files[i]); // have queued inner, so not recur
			}
			$(this).val('');
		});

		var loadImgTaskQueue = new TaskQueue();
		var addBlobImageAsync = kPainter.addBlobImageAsync = function(blob, callback){
			if(isEditing){ return; }
			if(blob instanceof Blob){
				if(onStartLoading && typeof(onStartLoading)=='function'){try{onStartLoading();}catch(ex){}}
				(function(callback){
					loadImgTaskQueue.push(
						loadNewImgAsync, 
						null, 
						[blob, function(){ 
							if(callback && typeof(callback)=='function'){ callback(); }
							loadImgTaskQueue.next();
							if(!loadImgTaskQueue.isWorking){
								if(onFinishLoading && typeof(onFinishLoading)=='function'){try{onFinishLoading();}catch(ex){}}
							}
						}]
					);
				})(callback);
			}
		};
		var addImage = kPainter.addImage = function(img, isClone){
			if(isEditing){ return; }
			if(img instanceof HTMLImageElement){	
				if(isClone){
					img = $(img).clone()[0];
				}
				img.kPainterOriImg = img;
				mainBox.children('.kPainterImgsDiv').append(img);
				imgArr.push(img);
				showImg(imgArr.length - 1);
			}
		};

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

		var loadNewImgAsync = function(blob, callback){
			var fileReader = new FileReader();
			fileReader.onload = function(){
				var fileReader = this;
				var img = new Image();
				img.onload = img.onerror = function(){
					img.onload = img.onerror = null;
					addImage(img);
					if(callback && typeof(callback)=='function'){ callback(); }
				};
				img.src = fileReader.result;
			};
			fileReader.readAsDataURL(blob);
		};

		var setImgStyleNoRatateFit = function(){
			var img = imgArr[curIndex];
			var box = mainBox;
			var pbr = box.paddingBoxRect();
			var cbr = box.contentBoxRect();
			//var img = box.find(".kPainterImgsDiv > .kPainterCanvas:visible,.kPainterImgsDiv>img:visible")[0];
			var zoom = Math.min(cbr.width/img.width,cbr.height/img.height);
			$(img).css("transform", "scale("+zoom+")");
			$(img).css("top", (pbr.height-img.height)/2+"px");
			$(img).css("left", (pbr.width-img.width)/2+"px");
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
							cropGesturer.setCropAll();
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
						cropGesturer.setCropAll();
					}else{
						setImgStyleNoRatateFit();
					}
				}
			}
		};

		var showImg = imgStorer.showImg = function(index){
			var img = imgArr[index];
			$(img).siblings().hide();
			$(img).show();
			curIndex = index;
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
			if(index < 0 || index > imgArr.length - 1 || index == curIndex){ return; }
			showImg(index);
		};

		kPainter.delete = function(index){
			if(isEditing){ return; }
			if(arguments.length < 1){
				index = curIndex;
			}
			if(isNaN(index) || 0 > index || index > imgArr.length - 1){ return; }
			index = Math.round(index);
			$(imgArr[index]).remove();
			imgArr.splice(index, 1);
			if(index == curIndex){
				if(curIndex == imgArr.length){
					--curIndex;
					if(-1 == curIndex){
						updateNumUI();
						return;
					}
				}
				showImg(curIndex);
			}
		};

		kPainter.download = function(filename, index){
			if(isEditing){ return; }
			if(arguments.length < 2){
				index = curIndex;
			}
			if(isNaN(index) || 0 > index || index > imgArr.length - 1){ return; }
			index = Math.round(index);
			var a = document.createElement('a');
			filename = filename || (new Date()).getTime();
			a.target='_blank';
			a.download = filename;
			a.href = imgArr[index].src;
			var ev = new MouseEvent('click',{
			    "view": window,
			    "bubbles": true,
			    "cancelable": false
			});
			a.dispatchEvent(ev);
			//a.click();
			return filename;
		};

	};

	var gesturer = new function(){
		var gesturer = this;

		var clickTime = Number.NEGATIVE_INFINITY;
		var dblClickInterval = 1000;
		var maxMoveRegardAsDblClick = 10;
		var clickButtons;
		var zoomInRate = 2;
		var zoomOutRate = 0.5;
		var clickUpX, clickUpY;

		var x0, y0, cx, cy, x1, y1, length,
			bpbr, bcbr, bpl, bpt, 
			img, imgTsf, imgW, imgH, imgTW, imgTH,
			left, top, zoom, minZoom, maxZoom = 4;

		var onTouchNumChange = function(jqEvent){
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
				// move start
				if(-1==curIndex){return;}
				if(null == gestureStatus){
					gestureStatus = 'posZoom';
				}else{ return; }
				//if('posZoom' != gestureStatus){
				//	return;
				//}
				mainBox.find('> .kPainterCroper > .kPainterEdges').children().css('z-index','unset');
				mainBox.find('> .kPainterCroper > .kPainterCorners').children().css('z-index','unset');
				jqEvent.preventDefault();
				jqEvent.stopPropagation();
				x0 = touchs[0].pageX;
				y0 = touchs[0].pageY;
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
					var imgCx = left+bpbr.pageX0+imgW/2,
						imgCy = top+bpbr.pageY0+imgH/2;
					left -= (rate-1)*(_cx-imgCx);
					top -= (rate-1)*(_cy-imgCy);
					updateImgPosZoom();
				}
			}else if(2 == touchs.length){
				// zoom start
				if(-1==curIndex){return;}
				if(null == gestureStatus){
					gestureStatus = 'posZoom';
				}
				if('posZoom' != gestureStatus){
					return;
				}
				mainBox.find('> .kPainterCroper > .kPainterEdges').children().css('z-index','unset');
				mainBox.find('> .kPainterCroper > .kPainterCorners').children().css('z-index','unset');
				jqEvent.preventDefault();
				jqEvent.stopPropagation();
				x0 = touchs[0].pageX;
				y0 = touchs[0].pageY;
				x1 = touchs[1].pageX;
				y1 = touchs[1].pageY;
				cx = (x0+x1)/2;
				cy = (y0+y1)/2;
				length = Math.sqrt(Math.pow(x0-x1, 2) + Math.pow(y0-y1, 2));
				getImgInfo();
			}else{
				clickUpX = x0, clickUpY = y0;
				if('posZoom' == gestureStatus){
					gestureStatus = null;
					mainBox.find('> .kPainterCroper > .kPainterEdges').children().css('z-index', 1);
					mainBox.find('> .kPainterCroper > .kPainterCorners').children().css('z-index', 1);
				}
			}
		};

		var onMouseCancel = function(jqEvent){
			var oEvent = jqEvent.originalEvent;
			clickUpX = oEvent.clientX, clickUpY = oEvent.clientY;
			if('posZoom' == gestureStatus){
				gestureStatus = null;
				mainBox.find('> .kPainterCroper > .kPainterEdges').children().css('z-index', 1);
				mainBox.find('> .kPainterCroper > .kPainterCorners').children().css('z-index', 1);
			}
		};

		var getImgInfo = function(isIgnoreCrop){
			var box = mainBox;
			if(isEditing){
				img = box.find('> .kPainterImgsDiv > .kPainterCanvas');
			}else{
				img = box.find("> .kPainterImgsDiv > img:visible");
			}
			imgW = img[0].width;
			imgH = img[0].height;
			left = parseFloat(img[0].style.left);
			top = parseFloat(img[0].style.top);
			imgTsf = img.getTransform();
			if(Math.pow(imgTsf.a,2)+Math.pow(imgTsf.d,2)>Math.pow(imgTsf.b,2)+Math.pow(imgTsf.c,2)){
				imgTW = imgW, imgTH = imgH;
			}else{
				imgTW = imgH, imgTH = imgW;
			}
			zoom = Math.sqrt(Math.pow(imgTsf.a,2)+Math.pow(imgTsf.b,2));
			bpbr = box.paddingBoxRect();
			bcbr = box.contentBoxRect();
			bpl = bcbr.pageX0-bpbr.pageX0;
			bpt = bcbr.pageY0-bpbr.pageY0;
			minZoom = Math.min(bcbr.width/imgTW,bcbr.height/imgTH);
			if(isEditing && !isIgnoreCrop){
				var nRect = cropGesturer.getNeededRect();
				minZoom = Math.max(
					Math.max(nRect.width,imgTW*minZoom)/imgTW,
					Math.max(nRect.height,imgTH*minZoom)/imgTH
				);
			}
		};

		var updateImgPosZoom = function(){
			correctPosZoom();
			img[0].style.left = left+'px';
			img[0].style.top = top+'px';
			var _zoom = Math.sqrt(Math.pow(imgTsf.a,2)+Math.pow(imgTsf.b,2));
			var rate = zoom/_zoom;
			imgTsf.a *= rate;
			imgTsf.b *= rate;
			imgTsf.c *= rate;
			imgTsf.d *= rate;
			img.setTransform(imgTsf);
		};

		var correctPosZoom = function(){
			if(zoom>maxZoom){
				zoom = maxZoom;
			}
			if(zoom<minZoom){
				zoom = minZoom;
			}
			var addW = 0, addH = 0;
			// abs(bcbr.width-imgW) or abs(bcbr.height-imgH) sometimes very small but exist, so calulate both
			if(bcbr.width>imgTW*zoom){
				addW = (bcbr.width-imgTW*zoom)/2;
			}
			if(bcbr.height>imgTH*zoom){
				addH = (bcbr.height-imgTH*zoom)/2;
			}
			//log(addW+" "+addH);
			//log("["+bpbr.pageX0+" "+left+" "+imgW+" "+bcbr.pageX1+"]");
			if(left-bpl+imgW/2-imgTW*zoom/2-addW>0){
				left = addW-imgW/2+imgTW*zoom/2+bpl;
			}else if(bpbr.pageX0+left+imgW/2+imgTW*zoom/2+addW<bcbr.pageX1){
				left = bcbr.pageX1-bpbr.pageX0-imgW/2-imgTW*zoom/2-addW;
			}
			if(top-bpt+imgH/2-imgTH*zoom/2-addH>0){
				top = addH-imgH/2+imgTH*zoom/2+bpt;
			}else if(bpbr.pageY0+top+imgH/2+imgTH*zoom/2+addH<bcbr.pageY1){
				top = bcbr.pageY1-bpbr.pageY0-imgH/2-imgTH*zoom/2-addH;
			}
		};

		gesturer.setImgStyleFit = function(){
			getImgInfo(true);
			zoom = minZoom;
			updateImgPosZoom();
		};

		mainBox.children(".kPainterGesturePanel").on('touchstart touchcancel touchend mousedown', onTouchNumChange);
		mainBox.on('mouseup mouseleave', onMouseCancel);
		mainBox.on('contextmenu', function(jqEvent){
			jqEvent.preventDefault();
			jqEvent.stopPropagation();
		});
		mainBox.on('touchmove mousemove', function(jqEvent){
			var touchs = jqEvent.originalEvent.targetTouches;
			if(!touchs){
				touchs = [{
					pageX: jqEvent.originalEvent.clientX,
					pageY: jqEvent.originalEvent.clientY
				}];
			}
			if(1 == touchs.length){
				// move
				if('posZoom' != gestureStatus){
					return;
				}
				jqEvent.preventDefault();
				jqEvent.stopPropagation();
				var _x0 = x0, _y0 = y0;
				x0 = touchs[0].pageX;
				y0 = touchs[0].pageY;
				left += x0-_x0;
				top += y0-_y0;
				updateImgPosZoom();
			}else if(2 == touchs.length){
				// zoom
				if('posZoom' != gestureStatus){
					return;
				}
				jqEvent.preventDefault();
				jqEvent.stopPropagation();
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
				var imgCx = left+bpbr.pageX0+imgW/2,
					imgCy = top+bpbr.pageY0+imgH/2;
				left -= (rate-1)*(_cx-imgCx);
				top -= (rate-1)*(_cy-imgCy);
				updateImgPosZoom();
			}
		});

	};

	var editor = new function(){
		var editor = this;

		var curStep;
		/* step/process element like {crop:{left:,top:,width:,height:},transform:} */
		var stack = [];

		var pushStack = editor.pushStack = function(step){
			stack.length = curStep + 1;
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
			if(Math.pow(tsf.a,2)+Math.pow(tsf.d,2)>Math.pow(tsf.b,2)+Math.pow(tsf.c,2)){
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
			var accuracy = Math.pow(10, Math.ceil(Math.max(img.width, img.height)).toString().length+2);
			crop.left = Math.round(crop.left*accuracy)/accuracy;
			crop.top = Math.round(crop.top*accuracy)/accuracy;
			crop.width = Math.round(crop.width*accuracy)/accuracy;
			crop.height = Math.round(crop.height*accuracy)/accuracy;

			var process = {
				crop: crop,
				transform: tsf
			};
			stack.push(process);
			++curStep;
			updateCvs();
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

		var canvas = mainBox.find("> .kPainterImgsDiv > .kPainterCanvas")[0];

		var fromToStep = function(fromStep, toStep){
			curStep = toStep;
			var _crop = stack[fromStep].crop;
			var crop = stack[curStep].crop;
			if(_crop.left == crop.left && 
				_crop.top == crop.top && 
				_crop.right == crop.right && 
				_crop.bottom == crop.bottom
			){
				// case only do transform, don't redraw canvas
				$(canvas).setTransform(stack[curStep].transform);
				gesturer.setImgStyleFit();
				cropGesturer.setCropAll();
			}else{
				updateCvs();
			}
		};

		var showCvs = function(){
			$(canvas).siblings().hide();
			$(canvas).show();
			updateCvs();
		};

		var updateCvs = function(bTrueTransform){
			var img = imgArr[curIndex].kPainterOriImg;
			var process = stack[curStep];
			var crop = process.crop;
			var tsf = process.transform;
			var context2d = canvas.getContext("2d");
			var cropW = Math.round(img.width * crop.width),
				cropH = Math.round(img.height * crop.height);
			if(bTrueTransform){
				var cvsW, cvsH;
				if(Math.pow(tsf.a,2)+Math.pow(tsf.d,2)>Math.pow(tsf.b,2)+Math.pow(tsf.c,2)){
					cvsW = cropW;
					cvsH = cropH;
				}else{
					cvsW = cropH;
					cvsH = cropW;
				}
				canvas.width = cvsW;
				canvas.height = cvsH;
				//var x0 = -1, y0 = -1;
				//var x1 = tsf.a*x0 + tsf.c*y0,
				//	y1 = tsf.b*x0 + tsf.d*y0;
				//var mE = x1 - x0,
				//	mF = y1 - y0;
				var drawE = cvsW/2 * (1 - tsf.a - tsf.c),//cvsW/2 * mE,
					drawF = cvsH/2 * (1 - tsf.b - tsf.d);//cvsH/2 * mF;
				context2d.save();
				context2d.setTransform(tsf.a, tsf.b, tsf.c, tsf.d, drawE, drawF);
			}else{
				canvas.width = cropW;
				canvas.height = cropH;
			}
			if(0!=canvas.width && 0!=canvas.height){
				context2d.drawImage(img, 
					Math.round(img.width*crop.left), Math.round(img.height*crop.top), 
					cropW, cropH, 0, 0, cropW, cropH);
			}else{
				canvas.width = 300;
				canvas.height = 150;
			}
			if(bTrueTransform){
				context2d.restore();
			}else{
				$(canvas).setTransform(tsf);
			}
			gesturer.setImgStyleFit();
			cropGesturer.setCropAll();
		};

		var hideCvs = function(){
			mainBox.find("> .kPainterImgsDiv > .kPainterCanvas").hide();
			mainBox.children('.kPainterCroper').hide();
		};

		kPainter.enterEdit = function(){
			if(isEditing){return;}
			if(onStartLoading && typeof(onStartLoading)=='function'){try{onStartLoading();}catch(ex){}}
			isEditing = true;

			stack.length = 0;
			var process = imgArr[curIndex].kPainterProcess || {
				crop: {
					left: 0,
					top: 0,
					width: 1,
					height: 1
				},
				transform: new kUtil.Matrix(1,0,0,1,0,0)
			};
			stack.push(process);
			curStep = 0;

			showCvs();
			mainBox.children('.kPainterCroper').show();
			if(onFinishLoading && typeof(onFinishLoading)=='function'){try{onFinishLoading();}catch(ex){}}
		};

		var quitEdit = kPainter.cancelEdit = function(){
			if(!isEditing){return;}
			isEditing = false;
			imgStorer.showImg(curIndex);
			hideCvs();
		};

		var saveEditedCvsAsync = function(callback){
			var img = new Image(); //imgArr[curIndex];
			var tsf = stack[curStep].transform;
			if(tsf.a!=1 || tsf.b!=0 || tsf.c!=0 || tsf.d!=1 || tsf.e!=0 || tsf.f!=0){
				mainBox.find('> .kPainterImgsDiv > .kPainterCanvas').hide();
				updateCvs(true);
			}
			img.kPainterOriImg = imgArr[curIndex].kPainterOriImg;
			img.kPainterProcess = stack[stack.length - 1];
			imgArr.splice(++curIndex, 0, img);
			img.onload = img.onerror = function(){
				img.onload = img.onerror = null;
				mainBox.children('.kPainterImgsDiv').append(img);
				callback();
			};
			img.src = canvas.toDataURL();
		};

		kPainter.saveEditAsync = function(callback){
			if(!isEditing){return;}
			if(onStartLoading && typeof(onStartLoading)=='function'){try{onStartLoading();}catch(ex){}}
			setTimeout(function(){
				saveEditedCvsAsync(function(){
					quitEdit();
					if(onFinishLoading && typeof(onFinishLoading)=='function'){try{onFinishLoading();}catch(ex){}}
					if(callback && typeof(callback)=='function'){ callback(); }
				});
			},0);
		};

		kPainter.rotateRight = function(){
			if(!isEditing){ return; }
			var transformOri = $(canvas).getTransform();
			var transformNew = kUtil.Matrix.dot(new kUtil.Matrix(0,1,-1,0,0,0), transformOri);
			$(canvas).setTransform(transformNew);
			gesturer.setImgStyleFit();
			cropGesturer.setCropAll();
			pushStack({
				transform: transformNew
			});
		};
		kPainter.rotateLeft = function(){
			if(!isEditing){ return; }
			var transformOri = $(canvas).getTransform();
			var transformNew = kUtil.Matrix.dot(new kUtil.Matrix(0,-1,1,0,0,0), transformOri);
			$(canvas).setTransform(transformNew);
			gesturer.setImgStyleFit();
			cropGesturer.setCropAll();
			pushStack({
				transform: transformNew
			});
		};
		kPainter.mirror = function(){
			if(!isEditing){ return; }
			var transformOri = $(canvas).getTransform();
			var transformNew = kUtil.Matrix.dot(new kUtil.Matrix(-1,0,0,1,0,0), transformOri);
			$(canvas).setTransform(transformNew);
			gesturer.setImgStyleFit();
			cropGesturer.setCropAll();
			pushStack({
				transform: transformNew
			});
		};
	};

	var cropGesturer = new function(){

		var cropGesturer = this;

		var fogBorderWidth = 10000;
		var kPainterCroper = mainBox.children('.kPainterCroper');
		kPainterCroper.css({"border-left-width":fogBorderWidth+"px","border-top-width":fogBorderWidth+"px","left":"-"+fogBorderWidth+"px","top":"-"+fogBorderWidth+"px"});
		
		var x0, y0, orientX, orientY, bpbr, bcbr, cvs = mainBox.find('> .kPainterImgsDiv > .kPainterCanvas'),
			cvsLeft, cvsTop, cvsRight, cvsBottom,
			left, top, width, height,
			minW = 50, minH = 50, minLeft, minTop, maxRight, maxBottom;
		var onTouchChange = function(jqEvent){
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
				}else{ return; }
				//if('crop' != gestureStatus){
				//	return;
				//}
				jqEvent.preventDefault();
				jqEvent.stopPropagation();
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
			left = parseFloat(kPainterCroper[0].style.left)+fogBorderWidth;
			top = parseFloat(kPainterCroper[0].style.top)+fogBorderWidth;
			width = parseFloat(kPainterCroper[0].style.width);
			height = parseFloat(kPainterCroper[0].style.height);
			minLeft = Math.max(0, cvsLeft);
			minTop = Math.max(0, cvsTop);
			maxRight = bcbr.width - minLeft;
			maxBottom = bcbr.height - minTop;
		};
		var getCvsInfo = function(){
			var tsf = cvs.getTransform();
			var zoom = Math.sqrt(Math.pow(tsf.a,2)+Math.pow(tsf.b,2));
			var bpl = bcbr.pageX0-bpbr.pageX0;
			var bpt = bcbr.pageY0-bpbr.pageY0;
			var cx = parseFloat(cvs[0].style.left) - bpl + cvs[0].width/2;
			var cy = parseFloat(cvs[0].style.top) - bpl + cvs[0].height/2;
			var cvsTW, cvsTH;
			if(Math.pow(tsf.a,2)+Math.pow(tsf.d,2)>Math.pow(tsf.b,2)+Math.pow(tsf.c,2)){
				cvsTW = cvs[0].width, cvsTH = cvs[0].height;
			}else{
				cvsTW = cvs[0].height, cvsTH = cvs[0].width;
			}
			var hzCvsTW = cvsTW*zoom/2, hzCvsTH = cvsTH*zoom/2;
			cvsLeft = cx - hzCvsTW;
			cvsTop = cy - hzCvsTH;
			cvsRight = cx + hzCvsTW;
			cvsBottom = cy + hzCvsTH;
		};
		mainBox.find('> .kPainterCroper > .kPainterEdges > div, > .kPainterCroper > .kPainterCorners > div').on('touchstart touchcancel touchend mousedown', onTouchChange);
		mainBox.on('mouseup mouseleave', onMouseCancel);

		var setCropBox = function(){
			kPainterCroper[0].style.left = (left-fogBorderWidth)+'px';
			kPainterCroper[0].style.top = (top-fogBorderWidth)+'px';
			kPainterCroper[0].style.width = width+'px';
			kPainterCroper[0].style.height = height+'px';
		};

		mainBox.on('touchmove mousemove', function(jqEvent){
			var touchs = jqEvent.originalEvent.targetTouches;
			if(!touchs){
				touchs = [{
					pageX: jqEvent.originalEvent.clientX,
					pageY: jqEvent.originalEvent.clientY
				}];
			}
			if(1 == touchs.length){
				if('crop' != gestureStatus){
					return;
				}
				jqEvent.preventDefault();
				jqEvent.stopPropagation();
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
				setCropBox();
			}
		});

		cropGesturer.setCropAll = function(){
			getInfo();
			left = minLeft;
			top = minTop;
			width = maxRight-minLeft;
			height = maxBottom-minTop;
			setCropBox();
		};
		cropGesturer.getNeededRect = function(){
			getInfo();
			var cx = (minLeft+maxRight)/2;
			var cy = (minTop+maxBottom)/2;
			var rect = {};
			rect.width = 2*Math.max(cx-left, left+width-cx);
			rect.height = 2*Math.max(cy-top, top+height-cy);
			return rect;
		};

		kPainter.crop = function(l, t, w, h){
			if(!isEditing){ return; }
			getInfo();
			if(arguments.length >= 4){
				editor.pushStack({
					crop: {
						left: l,
						top: t,
						width: w,
						height: h
					}
				});
			}else{
				var cvsW = cvsRight - cvsLeft,
					cvsH = cvsBottom - cvsTop;
				editor.pushStack({
					crop: {
						left: (left - cvsLeft) / cvsW,
						top: (top - cvsTop) / cvsH,
						width: width / cvsW,
						height: height / cvsH
					}
				});
			}
		};
	};
};
