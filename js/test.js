/*global Vue, $, KPainter, kConsoleLog*/

var isMobileSafari = (/iPhone/i.test(navigator.platform) || /iPod/i.test(navigator.platform) || /iPad/i.test(navigator.userAgent)) && !!navigator.appVersion.match(/(?:Version\/)([\w\._]+)/); 
if(isMobileSafari){
    /* In safari at ios, 
     * when open this page by '_blank' mode,
     * and run the script in every pages which this page can link to, 
     * can disable ios safari swipe back and forward.
     */
    window.history.replaceState(null, null, "#");
}

$("#mdl-view").on("touchmove", function(ev){
    ev.preventDefault();
    ev.stopPropagation();
});

var painter = new KPainter();
var painterDom = painter.getHtmlElement();
painterDom.style.width = '100%';
painterDom.style.height = '80%';
painterDom.style.position = 'absolute';
painterDom.style.left = '0';
painterDom.style.bottom = '0';

var appTestMbc = new Vue({
    el: '#app-testMbc',
    data: {
        curIndex: painter.getCurIndex(),
        count: painter.getCount(),
        isEditing: painter.isEditing(),
        mode: painter.getMode(),
        width: NaN,
        height: NaN,
        zoom: NaN,
        editWidth: NaN,
        editHeight: NaN,
        curStep: NaN,
        stepCount: NaN,
        protectedSteps: null,
        cropRectArea: null,
        freeTransformCornerPos: null,

        //Image Store
        defaultFileInputAccept: painter.defaultFileInput.accept,
        defaultFileInputMultiple: painter.defaultFileInput.multiple,
        addImageSrc: '',
        addedImageMaxWH: painter.addedImageMaxWH,
        isShowNewImgWhenAdd: painter.isShowNewImgWhenAdd,
        changePageCmd: '',
        movePageToIndex: '',
        downloadFileName: '',
        //Gesturer
        leftDoubleClickZoomRate: painter.leftDoubleClickZoomRate,
        rightDoubleClickZoomRate: painter.rightDoubleClickZoomRate,
        allowedTouchMoveSwitchImgOverBoundary: painter.allowedTouchMoveSwitchImgOverBoundary,
        zoomNum: 1,
        zoomIsRate: false,
        //Basic Edit
        saveIsCover: false,
        stepImgsGCThreshold: painter.stepImgsGCThreshold,
        numAddProtectedStep: 0,
        numRemoveProtectedStep: 0,
        numSetCurStep: 0,
        resizeWidth: 100,
        resizeHeight: 100,
        //Crop
        isAutoShowCropUI: painter.isAutoShowCropUI,
        cropRectStyle: 0,
        cropRectMinW: painter.cropRectMinW,
        cropRectMinH: painter.cropRectMinH,
        cropRectLeft: -0.5,
        cropRectTop: -0.5,
        cropRectRight: 0.5,
        cropRectBottom: 0.5,
        //Free Transform
        x0: -0.5,
        y0: -0.5,
        x1: 0.5,
        y1: -0.5,
        x2: 0.5,
        y2: 0.5,
        x3: -0.5,
        y3: 0.5,
        freeTransformMaxWH: painter.freeTransformMaxWH,

        style: {}
    },
    watch: {
        //Image Store
        defaultFileInputAccept: function(value){
            painter.defaultFileInput.accept = value;
        },
        defaultFileInputMultiple: function(value){
            painter.defaultFileInput.multiple = value;
        },
        addedImageMaxWH: function(value){
            painter.addedImageMaxWH = parseInt(value);
        },
        isShowNewImgWhenAdd: function(value){
            painter.isShowNewImgWhenAdd = value;
        },
        //Gesturer
        leftDoubleClickZoomRate: function(value){
            painter.leftDoubleClickZoomRate = parseInt(value);
        },
        rightDoubleClickZoomRate: function(value){
            painter.rightDoubleClickZoomRate = parseInt(value);
        },
        allowedTouchMoveSwitchImgOverBoundary: function(value){
            painter.allowedTouchMoveSwitchImgOverBoundary = value;
        },
        //Basic Edit
        stepImgsGCThreshold: function(value){
            painter.stepImgsGCThreshold = parseInt(value);
        },
        //Crop
        isAutoShowCropUI: function(value){
            painter.isAutoShowCropUI = value;
        },
        cropRectMinW: function(value){
            painter.cropRectMinW = parseInt(value);
        },
        cropRectMinH: function(value){
            painter.cropRectMinH = parseInt(value);
        },
        //Free Transform
        freeTransformMaxWH: function(value){
            painter.freeTransformMaxWH = parseInt(value);
        },
    },
    methods: {
        loadCvScript: function(){
            KPainter.loadCvScript().then(function(){
                kConsoleLog('loadCvScript success');
            },function(ex){
                kConsoleLog(ex.message || ex);
            });
        },
        //Image Store
        showFileChooseWindow: function(){
            painter.showFileChooseWindow();
        },
        addImage: function(src){
            painter.addImage(src).then(function(){
                kConsoleLog('addImage success');
            },function(ex){
                kConsoleLog(ex.message || ex);
            });
        },
        changePage: function(cmd){
            kConsoleLog(painter.changePage(cmd));
        },
        movePage: function(toIdx){
            kConsoleLog(painter.movePage(toIdx));
        },
        del: function(){
            kConsoleLog(painter.del());
        },
        download: function(filename){
            kConsoleLog(painter.download(filename));
        },
        //Gesturer
        setZoom: function(num, isRate){
            kConsoleLog(painter.setZoom(parseFloat(num), isRate));
        },
        //Basic Edit
        enterEdit: function(){
            painter.enterEdit().then(function(){
                kConsoleLog('enterEdit success');
            },function(ex){
                kConsoleLog(ex.message || ex);
            });
        },
        cancelEdit: function(){
            kConsoleLog(painter.cancelEdit());
        },
        saveEdit: function(isCover){
            painter.saveEdit(isCover).then(function(){
                kConsoleLog('saveEdit success');
            },function(ex){
                kConsoleLog(ex.message || ex);
            });
        },
        addProtectedStep: function(num){
            kConsoleLog(painter.addProtectedStep(parseInt(num)));
        },
        removeProtectedStep: function(num){
            kConsoleLog(painter.removeProtectedStep(parseInt(num)));
        },
        undo: function(){
            painter.undo().then(function(){
                kConsoleLog('undo success');
            },function(ex){
                kConsoleLog(ex.message || ex);
            });
        },
        redo: function(){
            painter.redo().then(function(){
                kConsoleLog('redo success');
            },function(ex){
                kConsoleLog(ex.message || ex);
            });
        },
        setCurStep: function(index){
            painter.setCurStep(parseInt(index)).then(function(){
                kConsoleLog('success');
            },function(ex){
                kConsoleLog(ex);
            });
        },
        rotateRight: function(){
            kConsoleLog(painter.rotateRight());
        },
        rotateLeft: function(){
            kConsoleLog(painter.rotateLeft());
        },
        mirror: function(){
            kConsoleLog(painter.mirror());
        },
        flip: function(){
            kConsoleLog(painter.flip());
        },
        resize: function(width, height){
            painter.resize(parseInt(width), parseInt(height)).then(function(){
                kConsoleLog('resize success');
            },function(ex){
                kConsoleLog(ex.message || ex);
            });
        },
        showCropRect: function(){
            kConsoleLog(painter.showCropRect());
        },
        hideCropRect: function(){
            kConsoleLog(painter.hideCropRect());
        },
        setCropRectStyle: function(num){
            kConsoleLog(painter.setCropRectStyle(parseInt(num)));
        },
        setCropRectArea: function(left,top,right,bottom){
            kConsoleLog(painter.setCropRectArea(parseFloat(left),parseFloat(top),parseFloat(right),parseFloat(bottom)));
        },
        crop: function(){
            painter.crop().then(function(arr){
                kConsoleLog(arr);
            });
        },
        //Free Transform
        enterFreeTransformMode: function(){
            painter.enterFreeTransformMode().then(function(){
                kConsoleLog('enterFreeTransformMode success');
            },function(ex){
                kConsoleLog(ex.message || ex);
            });
        },
        exitFreeTransformMode: function(){
            painter.exitFreeTransformMode().then(function(){
                kConsoleLog('exitFreeTransformMode success');
            },function(ex){
                kConsoleLog(ex.message || ex);
            });
        },
        setFreeTransformCornerPos: function(pos){
            painter.setFreeTransformCornerPos(pos);
        },
        documentDetect: function(){
            painter.documentDetect().then(function(){
                kConsoleLog('documentDetect success');
            },function(ex){
                kConsoleLog(ex.message || ex);
            });
        },
        freeTransform: function(){
            painter.freeTransform().then(function(){
                kConsoleLog('freeTransform success');
            },function(ex){
                kConsoleLog(ex.message || ex);
            });
        },
        //Video
        showVideo: function(){
            painter.showVideo().then(function(){
                kConsoleLog('Play video success');
            },function(ex){
                kConsoleLog(ex.message || ex);
            });
        },
        grabVideo: function(){
            painter.grabVideo(true).then(function(){
                kConsoleLog('grabVideo success');
            },function(ex){
                kConsoleLog(ex.message || ex);
            });
        },
        hideVideo: function(){
            kConsoleLog(painter.hideVideo());
        }
    }
});

document.getElementById('mdl-view').appendChild(painterDom);

painter.bindThumbnailBox(document.getElementById('div-thumbnailBox')/*, function(cvs){
    var box = document.createElement('div');
    box.appendChild(cvs);
    return box;
}*/);
$('#div-thumbnailBox').on('click', 'canvas', function(){
    var idx = this.getKPainterIndex();
    painter.changePage(idx);
});

$(window).resize(function(){
    painter.updateUIOnResize(true);
});

painter.onNumChange = function(curIndex, length){
    appTestMbc.curIndex = curIndex;
    appTestMbc.count = length;
};

painter.onUpdateImgPosZoom = function(){
    appTestMbc.isEditing = painter.isEditing();
    setTimeout(function(){
        appTestMbc.mode = painter.getMode();
    },0);
    appTestMbc.mode = painter.getMode();
    appTestMbc.width = painter.getWidth();
    appTestMbc.height = painter.getHeight();
    appTestMbc.zoom = painter.getZoom();
    appTestMbc.editWidth = painter.getEditWidth();
    appTestMbc.editHeight = painter.getEditHeight();
    appTestMbc.curStep = painter.getCurStep();
    appTestMbc.stepCount = painter.getStepCount();
    appTestMbc.protectedSteps = painter.getProtectedSteps();
};

painter.onCropRectChange = function(){
    appTestMbc.cropRectArea = painter.getCropRectArea(true);
};

painter.onFreeTransformCornerPosChange = function(){
    appTestMbc.freeTransformCornerPos = painter.getFreeTransformCornerPos();
};

$('#btn-switch-fun').click(function(){
    if($('#mdl-fun').is(':visible')){
        $('#mdl-fun').hide();
    }else{
        $('#mdl-fun').show();
    }
});

var divKConsole = document.getElementById('kConsoleLogDiv').parentElement;
$(divKConsole).children().css('position', 'absolute');
document.getElementById('mdl-log').appendChild(divKConsole);
document.getElementById('kConsoleShowHideBtn').click();

