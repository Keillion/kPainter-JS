var kUtil = kUtil || {};
//Array.prototype.getRemove = function(index){
//	//this.slice(0,index).concat(this.slice(index+1,this.length));
//};
kUtil.Matrix = function(a,b,c,d,e,f){
	this.a=a,
	this.b=b,
	this.c=c,
	this.d=d,
	this.e=e,
	this.f=f;
};
kUtil.Matrix.dot = function(matrixA, matrixB){
	var A=matrixA, B=matrixB;
	return new kUtil.Matrix(
		A.a*B.a+A.c*B.b,
		A.b*B.a+A.d*B.b,
		A.a*B.c+A.c*B.d,
		A.b*B.c+A.d*B.d,
		A.a*B.e+A.c*B.f+A.e,
		A.b*B.e+A.d*B.f+A.f
	);
};
kUtil.convertURLToBlob = function(url, callback) {
    var http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.responseType = "blob";
    http.onload = function(e) {
        if (this.status == 200 || this.status === 0) {
            callback(this.response);
        }
    };
    http.send();
};
kUtil.convertBase64ToBlob = function(base64Str, mimeType){
	var byteCharacters = atob(base64Str);
	var byteNumArr = new Array(byteCharacters.length);
	for(var i=0; i < byteCharacters.length; ++i){
		byteNumArr[i] = byteCharacters.charCodeAt(i);
	}
	var uint8Arr = new Uint8Array(byteNumArr);
	return new Blob([uint8Arr], {type: mimeType});
};
(function($){
	$.fn.borderWidth = function(){
		var cs = window.getComputedStyle(this[0]);
		var info = {};
		info.left = parseFloat(cs.getPropertyValue("border-left-width"));
		info.top = parseFloat(cs.getPropertyValue("border-top-width"));
		info.right = parseFloat(cs.getPropertyValue("border-right-width"));
		info.bottom = parseFloat(cs.getPropertyValue("border-bottom-width"));
		return info;
	};
	$.fn.padding = function(){
		var cs = window.getComputedStyle(this[0]);
		var info = {};
		info.left = parseFloat(cs.getPropertyValue("padding-left"));
		info.top = parseFloat(cs.getPropertyValue("padding-top"));
		info.right = parseFloat(cs.getPropertyValue("padding-right"));
		info.bottom = parseFloat(cs.getPropertyValue("padding-bottom"));
		return info;
	};
	$.fn.borderBoxRect = function(){
		var cs = window.getComputedStyle(this[0]);
		var offset = this.offset();
		var info = {};
		/*info.zoom = 1;
		 tudo:matrix
		var strTransform = this.css('transform');
		if('none'!=strTransform){
			var partStr = 'matrix(';
			var matrixIndex = strTransform.indexOf(partStr) + partStr.length;
			if(-1 != matrixIndex){
				var matrixArr = strTransform.substring(matrixIndex, strTransform.indexOf(')', matrixIndex)).split(',');
				info.zoom = parseFloat(matrixArr[0]);
			}
		}*/
		info.pageX0 = offset.left;
		info.pageY0 = offset.top;
		info.width = parseFloat(cs.width);//*info.zoom;
		info.height = parseFloat(cs.height);//*info.zoom;
		info.pageX1 = info.pageX0 + info.width;
		info.pageY1 = info.pageY0 + info.height;
		//tudo: client\screen
		return info;
	};
	$.fn.paddingBoxRect = function(){
		var borderBoxRect = this.borderBoxRect();
		var borderWidth = this.borderWidth();
		var info = {};
		//info.zoom = borderBoxRect.zoom;
		info.pageX0 = borderBoxRect.pageX0 + borderWidth.left;//*info.zoom;
		info.pageY0 = borderBoxRect.pageY0 + borderWidth.top;//*info.zoom;
		info.width = borderBoxRect.width - (borderWidth.left + borderWidth.right);//*info.zoom;
		info.height = borderBoxRect.height - (borderWidth.top + borderWidth.bottom);//*info.zoom;
		info.pageX1 = borderBoxRect.pageX1 - borderWidth.right;//*info.zoom;
		info.pageY1 = borderBoxRect.pageY1 - borderWidth.bottom;//*info.zoom;
		//tudo: client\screen
		return info;
	};
	$.fn.contentBoxRect = function(){
		var paddingBoxRect = this.paddingBoxRect();
		var padding = this.padding();
		var info = {};
		//info.zoom = paddingBoxRect.zoom;
		info.pageX0 = paddingBoxRect.pageX0 + padding.left;//*info.zoom;
		info.pageY0 = paddingBoxRect.pageY0 + padding.top;//*info.zoom;
		info.width = paddingBoxRect.width - (padding.left + padding.right);//*info.zoom;
		info.height = paddingBoxRect.height - (padding.top + padding.bottom);//*info.zoom;
		info.pageX1 = paddingBoxRect.pageX1 - padding.right;//*info.zoom;
		info.pageY1 = paddingBoxRect.pageY1 - padding.bottom;//*info.zoom;
		//tudo: client\screen
		return info;
	};
	$.fn.getTransform = function(){
		var strTransform = this.css('transform');
		if('none' == strTransform){
			//jq bug, transform might not get latest, I only resolve the situation when set matrix(...)
			strTransform = this[0].style.transform;
		}
		var partStr = 'matrix(';
		var matrixIndex = strTransform.indexOf(partStr);
		if(-1 != matrixIndex){
			matrixIndex += partStr.length;
			var arr = strTransform.substring(matrixIndex, strTransform.indexOf(')', matrixIndex)).split(',');
			for(var i=0; i<arr.length; ++i){
				arr[i] = parseFloat(arr[i]);
			}
			return new kUtil.Matrix(arr[0],arr[1],arr[2],arr[3],arr[4],arr[5]);//.apply(kUtil.Matrix, matrixArr);
		}
		partStr = 'scale(';
		var scaleIndex = strTransform.indexOf(partStr);
		if(-1 != scaleIndex){
			scaleIndex += partStr.length;
			var zoom = parseFloat(strTransform.substring(scaleIndex));
			return new kUtil.Matrix(zoom,0,0,zoom,0,0);
		}
		return new kUtil.Matrix(1,0,0,1,0,0);
	};
	$.fn.setTransform = function(matrix){
		var m = matrix;
		var str = 'matrix('+[m.a,m.b,m.c,m.d,m.e,m.f].join(',')+')';
		this.css('transform', str);
	};
})(jQuery);
