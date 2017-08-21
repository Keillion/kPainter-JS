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

$("#grayFog").hide();
