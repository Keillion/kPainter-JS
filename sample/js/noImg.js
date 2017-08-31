var isMobileSafari = (/iPhone/i.test(navigator.platform) || /iPod/i.test(navigator.platform) || /iPad/i.test(navigator.userAgent)) && !!navigator.appVersion.match(/(?:Version\/)([\w\._]+)/); 
if(isMobileSafari){
	/* In safari at ios, 
	 * when open this page by '_blank' mode,
	 * and run the script in every pages which this page can link to, 
	 * can disable ios safari swipe back and forward.
	 */
	window.history.replaceState(null, null, "#");
}
$("body").on("touchmove", function(ev){
	ev.preventDefault();
	ev.stopPropagation();
});

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
$(window).on("resize orientationchange", function(){
	painter.updateUIOnResize(true);
});

$("#grayFog").hide();
