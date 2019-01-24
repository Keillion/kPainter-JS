/*global $, KPainter, TaskQueue, Tiff, pdfjsLib, kUtil*/
/*eslint-disable no-console*/
var isMobileSafari = (/iPhone/i.test(navigator.platform) || /iPod/i.test(navigator.platform) || /iPad/i.test(navigator.userAgent)) && !!navigator.appVersion.match(/(?:Version\/)([\w\._]+)/); 
if(isMobileSafari){
    /* In safari at ios, 
     * when open this page by '_blank' mode,
     * and run the script in every pages which this page can link to, 
     * can disable ios safari swipe back and forward.
     */
    window.history.replaceState(null, null, "#");
}

$("#imgShowMdl").on("touchmove", function(ev){
    ev.preventDefault();
    ev.stopPropagation();
});

var painter = new KPainter();
painter.onStartLoading = function(){ $("#grayFog").show(); };
painter.onFinishLoading = function(){ $("#grayFog").hide(); };
painter.onNumChange = function(curIndex, length){
    $("#pageNum").html((curIndex+1)+"/"+length);
};
var painterDOM = painter.getHtmlElement();
painterDOM.style.width = '100%';
painterDOM.style.height = '100%';
painterDOM.style.backgroundColor = 'rgba(0,0,0,0.3)';
$("#imgShowMdl").append(painterDOM);
$(window).resize(function(){
    painter.updateUIOnResize(true);
});

painter.defaultFileInput.accept += ',image/tiff,application/pdf';

var getCvsFromTif = function(blob, callback){
    return new Promise(function(resolve, reject){
        if(self.Tiff){
            resolve();
        }else{
            console.log('loading tiff component...');
            var script = document.createElement('script');
            script.src = 'js/tiff.min.js';
            self.onTiffJsLoadSuccess = function(){
                //initialize with 100MB for large files
                Tiff.initialize({
                    TOTAL_MEMORY: 100000000
                });
                resolve();
            };
            script.onerror = function(ex){
                //tudo test it
                reject(script.error || ex || 'load tiff js fail');
            };
            document.body.appendChild(script);
        }
    }).then(function(){
        console.log('parsing the tiff...');
        return new Promise(function(resolve, reject){
            var fr = new FileReader();
            fr.onload = function(){
                resolve(fr.result);
            };
            fr.onerror = function(){
                reject(fr.error);
            };
            fr.readAsArrayBuffer(blob);
        });
    }).then(function(arrayBuffer){
        var tiff = new Tiff({
            buffer: arrayBuffer
        });
        var taskQueue = new TaskQueue();
        for (var j = 0, len = tiff.countDirectory(); j < len; ++j) {
            taskQueue.push(function(j){
                tiff.setDirectory(j);
                callback(tiff.toCanvas(), function(){
                    taskQueue.next();
                });
            },null,[j]);
        }
        return new Promise(function(resolve){
            taskQueue.push(function(){
                resolve();
            });
        });
    });
};

var getCvsFromPdf = function(blob, callback){
    return new Promise(function(resolve, reject){
        if(self.pdfjsLib){
            resolve();
        }else{
            console.log('loading pdf component...');
            var script = document.createElement('script');
            script.src = 'js/pdf.js';
            self.onPdfJsLoadSuccess = function(){
                self.pdfjsLib = window['pdfjs-dist/build/pdf'];
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/pdf.worker.js';
                resolve();
            };
            script.onerror = function(ex){
                //tudo test it
                reject(script.error || ex || 'load pdf js fail');
            };
            document.body.appendChild(script);
        }
    }).then(function(){
        console.log('parsing the pdf...');
        return new Promise(function(resolve, reject){
            var fr = new FileReader();
            fr.onload = function(){
                resolve(fr.result);
            };
            fr.onerror = function(){
                reject(fr.error);
            };
            fr.readAsArrayBuffer(blob);
        });
    }).then(function(arrayBuffer){
        return pdfjsLib.getDocument(arrayBuffer);
    }).then(function(pdf){
        var taskQueue = new TaskQueue();
        for(var i = 0; i < pdf.numPages; ++i){
            taskQueue.push(function(i){
                //pdfjs is 1 base >_<
                var cvs = null;
                pdf.getPage(i+1).then(function(page){
                    var viewport = page.getViewport(1);
                    cvs = document.createElement('canvas');
                    cvs.width = viewport.width;
                    cvs.height = viewport.height;

                    var ctx = cvs.getContext('2d');
                    return page.render({
                        canvasContext: ctx,
                        viewport: viewport
                    });
                }).then(function(){
                    callback(cvs, function(){
                        taskQueue.next();
                    });
                }).catch(function(ex){
                    console.error(ex);
                    taskQueue.next();
                });
            }, null, [i]);
        }
        return new Promise(function(resolve){
            taskQueue.push(function(){
                resolve();
            });
        });
    });
};

var addImageFromUrlWithPdfTiffAsync = painter.beforeAddImgFromFileChooseWindow = painter.beforeAddImgFromDropFile = function(src, callback){
    var taskQueue = new TaskQueue();
    var files = null;
    if(typeof src == "string" || src instanceof String){
        // url
        files = ['placeholder'];
        taskQueue.push(function(){
            kUtil.convertURLToBlob(src, function(blob){
                files = [blob];
                taskQueue.next();
            });
        });
    }else{
        // input || drop 
        files = src.target.files || src.dataTransfer.files;
    }
    for(var i = 0; i < files.length; ++i){
        taskQueue.push(function(i){
            var file = files[i];
            if('image/tiff' == file.type){
                getCvsFromTif(file, painter.addImageAsync).then(function(){
                    taskQueue.next();
                }).catch(function(ex){
                    console.error(ex);
                    taskQueue.next();
                });
            }else if('application/pdf' == file.type){
                getCvsFromPdf(file, painter.addImageAsync).then(function(){
                    taskQueue.next();
                }).catch(function(ex){
                    console.error(ex);
                    taskQueue.next();
                });
            }else{
                painter.addImageAsync(file, function(){
                    taskQueue.next();
                });
            }
        }, null, [i]);
    }
    // callback
    if(callback){
        taskQueue.push(function(){
            callback();
        });
    }
};

painter.bindThumbnailBox(document.getElementById('div-thumbnailContainer'), function(cvs){
    var box = document.createElement('div');
    box.className = 'div-thumbnailBox';
    box.appendChild(cvs);
    var svgTrash = $('<svg width="32" height="32" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path file="#fff" d="M704 736v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm128 724v-948h-896v948q0 22 7 40.5t14.5 27 10.5 8.5h832q3 0 10.5-8.5t14.5-27 7-40.5zm-672-1076h448l-48-117q-7-9-17-11h-317q-10 2-17 11zm928 32v64q0 14-9 23t-23 9h-96v948q0 83-47 143.5t-113 60.5h-832q-66 0-113-58.5t-47-141.5v-952h-96q-14 0-23-9t-9-23v-64q0-14 9-23t23-9h309l70-167q15-37 54-63t79-26h320q40 0 79 26t54 63l70 167h309q14 0 23 9t9 23z"/></svg>');
    var fog = document.createElement('div');
    fog.className = 'div-trashFog';
    fog.appendChild(svgTrash[0]);
    box.appendChild(fog);
    return box;
});

$('#ipt-deleteMode').change(function(){
    if($(this).prop('checked')){
        $('#thumbnailMdl').addClass('inDeleteMode');
    }else{
        $('#thumbnailMdl').removeClass('inDeleteMode');
    }
});
$('#div-thumbnailContainer').on('click', '.div-thumbnailBox', function(){
    var idx = this.getKPainterIndex();
    if($('#ipt-deleteMode').prop('checked')){
        painter.del(idx);
    }else{
        painter.changePage(idx);
        $('#thumbnailMdl').hide();
    }
});

$("#grayFog").hide();
