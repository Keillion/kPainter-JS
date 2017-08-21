var painter = new KPainter();
painter.setOnLoading(
	function(){ $("#grayFog").show(); },
	function(){ $("#grayFog").hide(); }
);
painter.setOnNumChange(function(curIndex, length){
	$("#pageNum").html((curIndex+1)+"/"+length);
});
var painterDOM = painter.getHtmlElement();
painterDOM.style.width = '100%';
painterDOM.style.height = '100%';
painterDOM.style.backgroundColor = 'rgba(0,0,0,0.3)';
$("#imgShowMdl").append(painterDOM);
$(window).resize(function(){
	painter.updateUIOnResize(true);
});

//debug
var sampleImgs = $('.sampleImg');
var loadedCount = 0;
for(var i=0; i<sampleImgs.length; ++i){
	var sampleImg = sampleImgs[i];
	if(sampleImg.complete){
		painter.addImage(sampleImg);
		if(++loadedCount == sampleImgs.length){
			$("#grayFog").hide();
		}
	}else{
		(function(sampleImg){
			sampleImg.onload = function(){
				painter.addImage(sampleImg);
				if(++loadedCount == sampleImgs.length){
					$("#grayFog").hide();
				}
			};
		})(sampleImg);
	}
}
