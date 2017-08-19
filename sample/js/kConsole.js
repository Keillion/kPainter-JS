$('body').append($(['<div>',
	'<div id="kConsoleLogDiv" style="display:none;position:fixed;top:0;right:0;width:100%;height:80%;overflow-y:auto;work-break:break-all;word-wrap:break-word;background-color:rgba(0,0,0,0.5);color:white;z-index:32767;"></div>',
	'<div style="display:none;width:100%;height:20%;position:fixed;bottom:0;work-break:break-all;word-wrap:break-word;background-color:rgba(0,0,0,0.5);z-index:32767;">',
		'<textarea id="kConsoleTextArea" type="text" style="display:inline-block;width:90%;height:100%;"></textarea>',
		'<button id="kConsoleBtnRun" style="display:inline-block;width:10%;height:100%;vertical-align:top;">run</button>',
	'</div>',
	'<button id="kConsoleShowHideBtn" style="position:fixed;top:0;right:0;z-index:32767;">console</button>',
'</div>'].join('')));
kConsoleLog = function(anything, color){
	var str = undefined;
	try{
		var str = JSON.stringify(anything);
	}catch(ex){}
	if(undefined == str){
		str = anything.toString();
	}
	var kConsoleLogDiv = document.getElementById("kConsoleLogDiv");
	var line = document.createElement("p");
	if(color){
		line.style.color=color;
	}
	line.innerHTML = str;
	kConsoleLogDiv.appendChild(line);
	kConsoleLogDiv.scrollTop = kConsoleLogDiv.scrollHeight;
};

kConsoleError = function(anything){
	kConsoleLog(anything, 'red');
};

window.addEventListener('error', function (ev) {
    var info = [
    	ev.message, "<br>",
        ev.filename, "<br>", 
    	"line: ", ev.lineno, "<br>",
        "obj: " , ev.error, "<br>"
    ].join('');
    kConsoleError(info);
}, false);

document.getElementById('kConsoleBtnRun').onclick = function(){
	var result;
	var cmd = document.getElementById('kConsoleTextArea').value;
	if("" == cmd.trim()){
		return;
	}
	result = eval(document.getElementById('kConsoleTextArea').value);
	kConsoleLog(result);
};

document.getElementById('kConsoleShowHideBtn').onclick = function(){
	if($('#kConsoleLogDiv').is(':visible')){
		$(this).siblings().hide();
	}else{
		$(this).siblings().show();
	}
};
