# API List
<!-- TOC -->

- [API List](#api-list)
- [Concept](#concept)
    - [`concept` MBC Mode](#concept-mbc-mode)
- [Global](#global)
    - [`constructor` MBC()](#constructor-mbc)
    - [`function` .getHtmlElement()](#function-gethtmlelement)
    - [`function` .getCurIndex()](#function-getcurindex)
    - [`function` .getCount()](#function-getcount)
    - [`function` .isEditing()](#function-isediting)
    - [`function` .getMode()](#function-getmode)
    - [`function` .getImage()](#function-getimage)
    - [`event` .onStartLoading](#event-onstartloading)
    - [`event` .onFinishLoading](#event-onfinishloading)
    - [`static String` .cvFolder](#static-string-cvfolder)
    - [`static function` .loadCvScriptAsync](#static-function-loadcvscriptasync)
- [Image Store](#image-store)
    - [`function` .showFileChooseWindow()](#function-showfilechoosewindow)
    - [`HTMLInputElement` .defaultFileInput](#htmlinputelement-defaultfileinput)
    - [`event` .beforeAddImgFromFileChooseWindow](#event-beforeaddimgfromfilechoosewindow)
    - [`event` .afterAddImgFromFileChooseWindow](#event-afteraddimgfromfilechoosewindow)
    - [`event` .beforeAddImgFromDropFile](#event-beforeaddimgfromdropfile)
    - [`event` .afterAddImgFromDropFile](#event-afteraddimgfromdropfile)
    - [`function` .addImageAsync()](#function-addimageasync)
    - [`Number` .addedImageMaxWH](#number-addedimagemaxwh)
    - [`boolean` .isShowNewImgWhenAdd](#boolean-isshownewimgwhenadd)
    - [`function` .updateUIOnResize()](#function-updateuionresize)
    - [`event` .onNumChange](#event-onnumchange)
    - [`function` .changePage()](#function-changepage)
    - [`function` .del()](#function-del)
    - [`function` .getWidth()](#function-getwidth)
    - [`function` .getHeight()](#function-getheight)
    - [`function` .getBlob()](#function-getblob)
    - [`function` .download()](#function-download)
    - [`function` .bindThumbnailBox()](#function-bindthumbnailbox)
    - [`function` .unbindThumbnailBox()](#function-unbindthumbnailbox)
- [Gesturer](#gesturer)
    - [`Number` .leftDoubleClickZoomRate](#number-leftdoubleclickzoomrate)
    - [`Number` .rightDoubleClickZoomRate](#number-rightdoubleclickzoomrate)
    - [`boolean` .allowedTouchMoveSwitchImgOverBoundary](#boolean-allowedtouchmoveswitchimgoverboundary)
    - [`event` .onUpdateImgPosZoom](#event-onupdateimgposzoom)
    - [`function` .getZoom()](#function-getzoom)
    - [`function` .setZoom()](#function-setzoom)
- [Basic Editor](#basic-editor)
    - [`Number` .stepImgsGCThreshold](#number-stepimgsgcthreshold)
    - [`function` .addProtectedStep()](#function-addprotectedstep)
    - [`function` .removeProtectedStep()](#function-removeprotectedstep)
    - [`function` .getProtectedSteps()](#function-getprotectedsteps)
    - [`function` .undo()](#function-undo)
    - [`function` .redo()](#function-redo)
    - [`function` .getStepCount()](#function-getstepcount)
    - [`function` .getCurStep()](#function-getcurstep)
    - [`function` .setCurStepAsync()](#function-setcurstepasync)
    - [`function` .enterEditAsync()](#function-entereditasync)
    - [`function` .cancelEdit()](#function-canceledit)
    - [`function` .saveEditAsync()](#function-saveeditasync)
    - [`function` .rotateRight()](#function-rotateright)
    - [`function` .rotateLeft()](#function-rotateleft)
    - [`function` .mirror()](#function-mirror)
    - [`function` .flip()](#function-flip)
    - [`function` .resizeAsync()](#function-resizeasync)
    - [`function` .getEditWidth()](#function-geteditwidth)
    - [`function` .getEditHeight()](#function-geteditheight)
- [Crop](#crop)
    - [`boolean` .isAutoShowCropUI](#boolean-isautoshowcropui)
    - [`function` .showCropRect()](#function-showcroprect)
    - [`function` .hideCropRect()](#function-hidecroprect)
    - [`function` .setCropRectStyle()](#function-setcroprectstyle)
    - [`Number` .cropRectMinW](#number-croprectminw)
    - [`Number` .cropRectMinH](#number-croprectminh)
    - [`event` .onCropRectChange](#event-oncroprectchange)
    - [`function` .setCropRectArea()](#function-setcroprectarea)
    - [`function` .getCropRectArea()](#function-getcroprectarea)
    - [`function` .cropAsync()](#function-cropasync)
- [Free Transform](#free-transform)
    - [`function` .documentDetectAsync()](#function-documentdetectasync)
    - [`function` .setFreeTransformCornerPos()](#function-setfreetransformcornerpos)
    - [`function` .getFreeTransformCornerPos()](#function-getfreetransformcornerpos)
    - [`event` .onFreeTransformCornerPosChange](#event-onfreetransformcornerposchange)
    - [`Number` .freeTransformMaxWH](#number-freetransformmaxwh)
    - [`function` .freeTransformAsync()](#function-freetransformasync)
    - [`function` .enterFreeTransformModeAsync()](#function-enterfreetransformmodeasync)
    - [`function` .exitFreeTransformModeAsync()](#function-exitfreetransformmodeasync)
- [Video](#video)
    - [`HTMLDivElement` .videoHtmlElement](#htmldivelement-videohtmlelement)
    - [`MediaStreamConstraints` .videoSettings](#mediastreamconstraints-videosettings)
    - [`function` .showVideo](#function-showvideo)
    - [`function` .grabVideo](#function-grabvideo)
    - [`function` .hideVideo](#function-hidevideo)
    - [`event` .beforeAddImgFromGrabVideoBtn](#event-beforeaddimgfromgrabvideobtn)
    - [`event` .afterAddImgFromGrabVideoBtn](#event-afteraddimgfromgrabvideobtn)

<!-- /TOC -->
---
# Concept

---
## `concept` MBC Mode

<pre>
MBC Instance
  |- View Mode
  |- Edit Mode (basicEdit)
    |- FreeTransform Mode (need `loadCvScriptAsync`)
    |- Brush Mode
</pre>

*reference:* [getMode()](#function-getmode)

*explanation:*

All function in parent mode can be processed in son mode. But not all gesturers in parent mode is valid in son mode.

For example, `FreeTransform` mode is a son mode of `Edit` mode. Function `.rotateLeft()` can still be called. However, you can't double click to zoom in or zoom out the canvas.

---
# Global

---
## `constructor` MBC()

*Syntax:* `new MBC(license)`

| parameter | type | description |
| --- | --- | --- |
| license | `String` | |

*example:*
```js
// MBC without a license can be used for evaluation purposes. It is not stable for long time usage.
var painter = new MBC();
// MBC need a license in production environments.
painter = new MBC('xxxxx');
```

<br /><br />

---
## `function` .getHtmlElement()

*Syntax:* `.getHtmlElement()`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `HTMLDivElement` | |

*example:*
```js
var painterDom = painter.getHtmlElement();
painterDom.style.width = '100%';
painterDom.style.height = '100%';
document.getElementById('painter-container').appendChild(painterDom);
```

<br /><br />

---
## `function` .getCurIndex()

Get the current showing image index a in MBC instance.

*Syntax:* `.getCurIndex()`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `Number` | |

<br /><br />

---
## `function` .getCount()

Get the image count in a MBC instance.

*Syntax:* `.getCount()`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `Number` | |

<br /><br />

---
## `function` .isEditing()

Identify whether the MBC instance is in `Edit` mode.

*Syntax:* `.isEditing()`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `boolean` | |

<br /><br />

---
## `function` .getMode()

Identify whether the MBC instance is in `Edit` mode.

*Syntax:* `.getMode()`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `string` | `view`, `basicEdit`, `freeTransform` or `brush` |

<br /><br />

---
## `function` .getImage()

*Syntax:* `.getImage(isOri, index)`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `HTMLImageElement` | |
| isOri *(optinal)* | `boolean` | |
| index *(optinal)* | `Number` | |

*example:*
```js
// A way to access to inner data. Don't modify it if you are not sure.
var imgOri = painter.getImage(true);
// This image can be used in any place and free to modify it.
var imgCopyed = painter.getImage();
imgCopyed.style.width = '100px';
imgCopyed.style.height = '100px';
document.getElementById('image-container').appendChild(imgCopyed);
```

<br /><br />

---
## `event` .onStartLoading

Binding a function that would be called when starting an expensive operation.

*Syntax:* `function(){}`

*example:*
```js
painter.onStartLoading = function(){
    document.getElementById('animation').show();
};
```

<br /><br />

---
## `event` .onFinishLoading

Binding a function that would be called when finishing an expensive operation.

*Syntax:* `function(){}`

*example:*
```js
painter.onFinishLoading = function(){
    document.getElementById('animation').hide();
};
```

<br /><br />

---
## `static String` .cvFolder

Tell this painter the directory where you place `cv-wasm.js` and `cv-wasm.wasm`.

*Syntax:* `MBC.cvFolder = 'js';`

<br /><br />

---
## `static function` .loadCvScriptAsync

You should call `MBC.loadCvScriptAsync()` first before use `Free Transform` and `Brush` module.

*Syntax:* `MBC.loadCvScriptAsync(callback)`

| parameter | type | description |
| --- | --- | --- |
| callback | `function(boolean bSuccess)` | |

*example:*
```js
MBC.loadCvScriptAsync(function(bSuccess){
    if(bSuccess){
        console.log('load cv script success.');
        painter.enterFreeTransformModeAsync();
    }else{
        console.log('load cv script fail.');
    }
});
```

<br /><br />

---
# Image Store

---
## `function` .showFileChooseWindow()

Show file choose window by click the hidden file input. Can't process during `Edit` mode.

*Syntax:* `.showFileChooseWindow()`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `boolean` | |

*example:*
```js
document.getElementById('btn-add-image').addEventListener('click', function(){
    painter.showFileChooseWindow();
});
```

<br /><br />

---
## `HTMLInputElement` .defaultFileInput

*example:*
```js
// warning: never redefine it if you are not sure
// painter.defaultFileInput = document.createElement('input');
painter.defaultFileInput.accept = "image/png";
painter.defaultFileInput.multiple = false;
```

<br /><br />

---
## `event` .beforeAddImgFromFileChooseWindow

Binding a function that would be called when `defaultFileInput` change by `showFileChooseWindow()`.

*Syntax:* `function(event, callback){}`

*example:*
```js
painter.beforeAddImgFromFileChooseWindow = function(ev, callback){
    var files = ev.target.files;
    var newBlobs = [];
    var finishedIndex = 0;
    for(var i = 0; i < files.length; ++i){
        var file = files[i];
        doSomeWorkToGetANewBlob(file, function(blob){
            newBlobs.push(blob);
            if(files.length == ++finishedIndex){
                callback(newBlobs);
            }
        });
    }
};
```

<br /><br />

---
## `event` .afterAddImgFromFileChooseWindow

Binding a function that would be called after adding image from `defaultFileInput`.

*Syntax:* `function(){}`

*example:*
```js
painter.afterAddImgFromFileChooseWindow = function(bSuccess){
    if(bSuccess){console.log('The new image(s) has been added from file choose window.');}
};
```

<br /><br />

---
## `event` .beforeAddImgFromDropFile

*Syntax:* `function(event, callback){}`

*example:*
```js
painter.beforeAddImgFromDropFile = function(ev, callback){
    var files = ev.dataTransfer.files;
    var newBlobs = [];
    var finishedIndex = 0;
    for(var i = 0; i < files.length; ++i){
        var file = files[i];
        doSomeWorkToGetANewBlob(file, function(blob){
            newBlobs.push(blob);
            if(files.length == ++finishedIndex){
                callback(newBlobs);
            }
        });
    }
};
```

<br /><br />

---
## `event` .afterAddImgFromDropFile

*Syntax:* `function(){}`

*example:*
```js
painter.afterAddImgFromDropFile = function(bSuccess){
    if(bSuccess){console.log('The new image(s) has been added from dropping.');}
};
```

<br /><br />

---
## `function` .addImageAsync()

Add image(s) to the MBC instance. Can only process in `View` mode.

*Syntax:* `.addImageAsync(imgData, callback)`

| parameter | type | description |
| --- | --- | --- |
| imgData | `Blob`, `HTMLCanvasElement`, `HTMLImageElement`, `String`*(url)*, `Array`*(a array of source)*, `FileList` | |
| callback *(optional)* | `function(bSuccess)` | |

*example:*
```js
painter.addImageAsync(image, function(bSuccess){
    console.log('Add success');
});
```

<br /><br />

---
## `Number` .addedImageMaxWH

The image whose width or height larger than `addedImageMaxWH` would be compressed when adding.

*Syntax:* `.addedImageMaxWH = 4096;`

<br /><br />

---
## `boolean` .isShowNewImgWhenAdd

Whether `changePage` to the new added image.

*Syntax:* `.isShowNewImgWhenAdd = true;`

<br /><br />

---
## `function` .updateUIOnResize()

Update the `htmlElement` of a MBC instance. Should call it manually when the `htmlElement` resize.

*Syntax:* `.updateUIOnResize(isLazy, callback)`

| parameter | type | description |
| --- | --- | --- |
| isLazy *(optional)*| `boolean` | Default false. Set true to avoid to update too frequently. |
| callback | `function()` | Callback of finish updating. Might abort the earlier callback when `isLazy` is true. |

*example:*
```js
window.addEventListener('resize',function(){
    painter.updateUIOnResize(true, function(){
        console.log('painter update');
    });
});
```

<br /><br />

---
## `event` .onNumChange

Binding a function that would be called when current image index or total length change.

*Syntax:* `function(Number curIndex, Number length){}`

*example:*
```js
painter.onNumChange = function(curIndex, length){
    console.log('curIndex: '+curIndex+', length:'+length);
};
```

<br /><br />

---
## `function` .changePage()

Change index of the current page. Can only process in `View` mode.

*Syntax:* `.changePage(cmd)`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `boolean` | |
| cmd | `Number`*(index)*, `String`*('f', 'p', 'n', 'l')* | Index number, or command string of 'f'(first), 'p'(pre), 'n'(next), 'l'(last). |

*example:*
```js
document.getElementById('btn-first').addEventListener('click', function(){
    painter.changePage('f');
});
document.getElementById('btn-pre').addEventListener('click', function(){
    painter.changePage('p');
});
document.getElementById('btn-next').addEventListener('click', function(){
    painter.changePage('n');
});
document.getElementById('btn-last').addEventListener('click', function(){
    painter.changePage('l');
});
document.getElementById('btn-toThisPage').addEventListener('click', function(){
    painter.changePage(parseInt(document.getElementById('ipt-page').value));
});
```

<br /><br />

---
## `function` .del()

Delete a image. Can only process in `View` mode.

*Syntax:* `.del(index)`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `boolean` | |
| index *(optional)* | `Number` | Default current index. |

<br /><br />

---
## `function` .getWidth()

Get width of current image in the MBC instance.

*Syntax:* `.getWidth(index)`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `Number` | |
| index *(optional)* | `Number` | Default current index. |

<br /><br />

---
## `function` .getHeight()

Get height of current image in the MBC instance.

*Syntax:* `.getHeight(index)`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `Number` | |
| index *(optional)* | `Number` | Default current index. |

<br /><br />

---
## `function` .getBlob()

Get the image data in `Blob` type.

*Syntax:* `.getBlob(index)`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `Number` | |
| index *(optional)* | `Number` | Default current index. |

<br /><br />

---
## `function` .download()

Download the image to users' local system. The function should be invoked directly by the user. Async invoking may have problems.

*Syntax:* `.download(filename, index)`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `Number` | |
| filename *(optional)* | `String` | |
| index *(optional)* | `Number` | Default current index. |

*example:*
```js
document.getElementById('btn-download').addEventListener('click', function(){
    for(var i = 0; i < painter.getCount(); ++i){
        painter.download(null, i);
    }
});
```

<br /><br />

---
## `function` .bindThumbnailBox()

*Syntax:* `.bindThumbnailBox(container, funWrap, maxWH)`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `boolean` | |
| container | `HTMLElement` | |
| funWrap *(optional)* | `HTMLElement function(HTMLCanvasElement cvs)` | |
| maxWH *(optional)* | `Number` | Default 256. |

*example:*
```js
painter.bindThumbnailBox(document.getElementById('div-thumbnailContainer'), function(cvs){
    console.log(cvs.className);// 'kPainterThumbnailCanvas', never remove this class
    var box = document.createElement('div');
    box.className = 'div-thumbnailBox';
    box.appendChild(cvs);
    box.addEventListener('click', function(){
        var idx = box.getKPainterIndex();// get index
        painter.changePage(idx);
    });
    return box;
});

//change the current selected box style
painter.onNumChange = function(curIndex, length){
    var container = document.getElementById('div-thumbnailContainer');
    var childNodes = container.childNodes;
    for(var i = 0; i < childNodes.length; ++i){
        var child = childNodes[i];
        child.removeAttribute('selected');
    }
    // An array called `kPainterThumbBoxArr` will be added after `bindThumbnailBox`. The array will update automatically
    container.kPainterThumbBoxArr[curIndex].setAttribute('selected','');
};
```

<br /><br />

---
## `function` .unbindThumbnailBox()

*Syntax:* `.unbindThumbnailBox(container)`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `boolean` | |
| container | `HTMLElement` | |

*example:*
```js
painter.bindThumbnailBox(document.getElementById('div-thumbnailContainer'));
```

<br /><br />

---
# Gesturer

---
## `Number` .leftDoubleClickZoomRate

Set the zoom rate when user left double click.

*Syntax:* `.leftDoubleClickZoomRate = 2;`

<br /><br />

---
## `Number` .rightDoubleClickZoomRate

Set the zoom rate when user right double click.

*Syntax:* `.rightDoubleClickZoomRate = 0.5;`

<br /><br />

---
## `boolean` .allowedTouchMoveSwitchImgOverBoundary

Whether allow switch from last to first or from first to last by `touchmove` gesture.

*Syntax:* `.allowedTouchMoveSwitchImgOverBoundary = true;`

<br /><br />

---
## `event` .onUpdateImgPosZoom

Binding a function that would be called when the performence of the current image or canvas(in `Edit` mode) update.

*Syntax:* `function(){}`

*example:*
```js
painter.onUpdateImgPosZoom(function(){
    console.log(painter.getZoom());
    console.log(painter.getEditWidth());
    console.log(painter.getEditHeight());
});
```

<br /><br />

---
## `function` .getZoom()

Get the zoom of current image or canvas(in `Edit` mode).

*Syntax:* `.getZoom()`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `Number` | |

<br /><br />

---
## `function` .setZoom()

Set the zoom of current image or canvas(in `Edit` mode).

*Syntax:* `.setZoom(num, isRate)`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `Number` | The finally effective zoom. |
| num | `Number` | |
| isRate | `boolean` | |

<br /><br />

---
# Basic Editor

---
## `Number` .stepImgsGCThreshold

The can-not-store step (freeTransform, brush) will generate a step image. If the step images' count over `stepImgsGCThreshold`, oldest not protected one would be GC.

*Syntax:* `.stepImgsGCThreshold = 10;`

<br /><br />

---
## `function` .addProtectedStep()

Add a protected step. Then this step would not be GC. Can only process in `Edit` mode.

*Syntax:* `.addProtectedStep(index)`

| parameter | type | description |
| --- | --- | --- |
| index | `Number` | |

*example:*
```js
/**
 *  sample code: save and give up editing about freeTransform mode 
 */

document.getElementById('btn-enterFreeTransformMode').addEventListener('click', function(){
    // pretect step when enter freeTransform mode
    painter.addProtectedStep(painter.getCurStep());
    // presume that `MBC.loadCvScriptAsync(callback)` has been called and success
    painter.enterFreeTransformModeAsync();
});

document.getElementById('btn-saveFreeTransform').addEventListener('click', function(){
    // remove the the last pretect step
    var protectedSteps = painter.getProtectedSteps();
    painter.removeProtectedStep(protectedSteps[protectedSteps.length - 1]);
    // transform and exitFreeTransformMode
    painter.freeTransformAsync(function(){
        painter.exitFreeTransformModeAsync();
    });
});

document.getElementById('btn-giveUpFreeTransform').addEventListener('click', function(){
    // pretect step when enter freeTransform mode
    var protectedSteps = painter.getProtectedSteps();
    var lastPretectedStep = protectedSteps[protectedSteps.length - 1];
    // remove the the last pretect step
    painter.removeProtectedStep(lastPretectedStep);
    // exitFreeTransformMode
    painter.exitFreeTransformModeAsync(function(){
        // jump to the last pretect step
        painter.setCurStepAsync(lastPretectedStep);
    });
});
```

<br /><br />

---
## `function` .removeProtectedStep()

Remove a protected step. Then this step can be GC. Can only process in `Edit` mode.

*Syntax:* `.removeProtectedStep(index)`

| parameter | type | description |
| --- | --- | --- |
| index | `Number` | |

<br /><br />

---
## `function` .getProtectedSteps()

Get All protected steps. Can only process in `Edit` mode.

*Syntax:* `.getProtectedSteps()`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `Array` | A array of the protected numbers. |

<br /><br />

---
## `function` .undo()

Undo an editing step. Can only process in `Edit` mode.

*Syntax:* `.undo(callback)`

| parameter | type | description |
| --- | --- | --- |
| callback | `function(boolean bSuccess)` | |

<br /><br />

---
## `function` .redo()

Redo an editing step. Can only process in `Edit` mode.

*Syntax:* `.redo(callback)`

| parameter | type | description |
| --- | --- | --- |
| callback | `function(boolean bSuccess)` | |

<br /><br />

---
## `function` .getStepCount()

Get count of editing steps. Can only process in `Edit` mode.

*Syntax:* `.getStepCount()`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `Number` | |

<br /><br />

---
## `function` .getCurStep()

Get current editing step. Can only process in `Edit` mode.

*Syntax:* `.getCurStep()`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `Number` | |

<br /><br />

---
## `function` .setCurStepAsync()

Set current editing step. Can only process in `Edit` mode.

*Syntax:* `.setCurStepAsync(index, callback)`

| parameter | type | description |
| --- | --- | --- |
| index | `Number` | |
| callback | `function(boolean bSuccess)` | |

<br /><br />

---
## `function` .enterEditAsync()

Enter the `Edit` mode.

*Syntax:* `.enterEditAsync(callback)`

| parameter | type | description |
| --- | --- | --- |
| callback | `function(boolean bSuccess)` | |

<br /><br />

---
## `function` .cancelEdit()

Leave the `Edit` mode without saving change.

*Syntax:* `.cancelEdit(callback)`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `boolean` | |

<br /><br />

---
## `function` .saveEditAsync()

Save change and leave the `Edit` mode.

*Syntax:* `.saveEditAsync(callback, isCover)`

| parameter | type | description |
| --- | --- | --- |
| callback | `function(boolean bSuccess)` | |
| isCover | `boolean` | |

<br /><br />

---
## `function` .rotateRight()

Rotate right. Can only process in `Edit` mode.

*Syntax:* `.rotateRight()`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `boolean` | |

<br /><br />

---
## `function` .rotateLeft()

Rotate left. Can only process in `Edit` mode.

*Syntax:* `.rotateLeft()`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `boolean` | |

<br /><br />

---
## `function` .mirror()

Mirror. Can only process in `Edit` mode.

*Syntax:* `.mirror()`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `boolean` | |

<br /><br />

---
## `function` .flip()

Flip. Can only process in `Edit` mode.

*Syntax:* `.flip()`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `boolean` | |

<br /><br />

---
## `function` .resizeAsync()

Resize. Can only process in `Edit` mode.

*Syntax:* `.resizeAsync(newWidth, newHeight, callback)`

| parameter | type | description |
| --- | --- | --- |
| newWidth | `Number` | |
| newHeight | `Number` | |
| callback | `function(boolean bSuccess)` | |

<br /><br />

---
## `function` .getEditWidth()

Get width of current editing canvas.

*Syntax:* `.getEditWidth()`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `Number` | |

<br /><br />

---
## `function` .getEditHeight()

Get height of current editing canvas.

*Syntax:* `.getEditHeight()`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `Number` | |

<br /><br />

---
# Crop

---
## `boolean` .isAutoShowCropUI

Whether show `Crop Rect` UI when enter `Edit` mode

*Syntax:* `.isAutoShowCropUI = true;`

<br /><br />

---
## `function` .showCropRect()

Show `Crop Rect`. Can only process in `Edit` mode.

*Syntax:* `.showCropRect()`

<br /><br />

---
## `function` .hideCropRect()

Hide `Crop Rect`. Can only process in `Edit` mode.

*Syntax:* `.hideCropRect()`

<br /><br />

---
## `function` .setCropRectStyle()

Default 0.
0: touch/click moving inside `Crop Rect` will move the back canvas.
1: touch/click moving inside `Crop Rect` will move the `Crop Rect`.

*Syntax:* `.setCropRectStyle(styleNo)`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `boolean` | |
| styleNo | `Number` | 0, 1 |

<br /><br />

---
## `Number` .cropRectMinW

`Crop Rect` min width.

*Syntax:* `.cropRectMinW = 50;`

<br /><br />

---
## `Number` .cropRectMinH

`Crop Rect` min height.

*Syntax:* `.cropRectMinH = 50;`

<br /><br />

---
## `event` .onCropRectChange

Binding a function that would be called when the `Crop Rect` change.

*Syntax:* `function(){}`

*example:*
```js
painter.onCropRectChange = function(){
    var cropArea = painter.getCropRectArea(true);
    document.getElementById('cropWidth').innerText = cropArea[2] - cropArea[0];
    document.getElementById('cropHeight').innerText = cropArea[3] - cropArea[1];
};
```

<br /><br />

---
## `function` .setCropRectArea()

Set `Crop Rect` area. Can only process in `Edit` mode.

*Syntax:* `.setCropRectArea()`

`Crop Rect` select All.

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `boolean` | |

<br />

*Syntax:* `.setCropRectArea(left, top, right, bottom)`

`Crop Rect` select an area.

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `boolean` | |
| left *(optional)* | `Number` | -0.5 ~ 0.5, default -0.5. |
| top *(optional)* | `Number` | -0.5 ~ 0.5, default -0.5. |
| right *(optional)* | `Number` | -0.5 ~ 0.5, default 0.5. |
| bottom *(optional)* | `Number` | -0.5 ~ 0.5, default 0.5. |

<br /><br />

---
## `function` .getCropRectArea()

*Syntax:* `.getCropRectArea(isAbsolute)`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `Array` | A array of [left, top, right, bottom]. |
| isAbsolute | `boolean` | Default `false`, get precentage(-50% ~ 50%) array. |

<br /><br />

---
## `function` .cropAsync()

Crop the selected area. Can only process in `Edit` mode.

*Syntax:* `.cropAsync(callback, array)`

| parameter | type | description |
| --- | --- | --- |
| callback *(optional)* | `function([left, top, right, bottom])` | |
| array *(optional)* | `Array` | A array of [left, top, right, bottom] \(each -0.5 ~ 0.5\). Default use an area accroding to `Crop Rect`. |

<br /><br />

---
# Free Transform

You should call `KPainter.loadCvScriptAsync()` first before use `FreeTransform` mode.

---
## `function` .documentDetectAsync()

Detect a document. Would auto call `setFreeTransformCornerPos()` after detected. Can only process in `FreeTransform` mode.

*Syntax:* `.documentDetectAsync(callback, importSrc)`

| parameter | type | description |
| --- | --- | --- |
| callback *(optional)* | `function([[x0,y0], [x1,y1], [x2,y2], [x3,y3]])` |  x0, y0... is from -0.5 to 0.5. |
| importSrc *(optional)* | | TUDO. Not easy enough to use now. |

<br /><br />

---
## `function` .setFreeTransformCornerPos()

Set the `FreeTransform` corner position. Can only process in `FreeTransform` mode.

*Syntax:* `.setFreeTransformCornerPos(cornerPoints)`

| parameter | type | description |
| --- | --- | --- |
| cornerPoints | `Array` | A array of [[x0,y0], [x1,y1], [x2,y2], [x3,y3]]. x0, y0... is from -0.5 to 0.5. |

<br /><br />

---
## `function` .getFreeTransformCornerPos()

Get the `FreeTransform` corner position.

*Syntax:* `.getFreeTransformCornerPos()`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `Array` | A array of [[x0,y0], [x1,y1], [x2,y2], [x3,y3]]. x0, y0... is from -0.5 to 0.5.|

<br /><br />

---
## `event` .onFreeTransformCornerPosChange

Binding a function that would be called when the `FreeTransform` corner position change.

*Syntax:* `function()`

*example:*
```js
painter.onFreeTransformCornerPosChange = function(){
    console.log(painter.getFreeTransformCornerPos());
};
```

<br /><br />

---
## `Number` .freeTransformMaxWH

`freeTransformAsync()` is a really expensive operation. `freeTransformMaxWH` would limit the max width and height of the result.

*Syntax:* `.freeTransformMaxWH = 2048;`

<br /><br />

---
## `function` .freeTransformAsync()

Transform the quadrilateral surround by the `FreeTransform` corner into a rectangle. Can only process in `FreeTransform` mode.

*Syntax:* `.freeTransformAsync(callback, cornerPoints, importSrc)`

| parameter | type | description |
| --- | --- | --- |
| callback *(optional)* | `function(boolean bSuccess)` | |
| cornerPoints *(optional)* | `Array` | A array of [[x0,y0], [x1,y1], [x2,y2], [x3,y3]]. x0, y0... is from -0.5 to 0.5. |
| importSrc *(optional)* | | TUDO. Not show for user. |

<br /><br />

---
## `function` .enterFreeTransformModeAsync()

Enter `FreeTransform` mode. Can only process in `Edit` mode.

*Syntax:* `.enterFreeTransformModeAsync(callback)`

| parameter | type | description |
| --- | --- | --- |
| callback *(optional)* | `function(boolean bSuccess)` | |

<br /><br />

---
## `function` .exitFreeTransformModeAsync()

Exist `FreeTransform` mode.

*Syntax:* `.exitFreeTransformModeAsync(callback)`

| parameter | type | description |
| --- | --- | --- |
| callback *(optional)* | `function(boolean bSuccess)` | |

<br /><br />

---
# Video

---
## `HTMLDivElement` .videoHtmlElement

The html element of video module.

*example:*
```js
// log the default video module 
console.log(painter.videoHtmlElement.innerHTML);
// custom your video module
painter.videoHtmlElement.innerHTML = '<video class="kPainterVideo" webkit-playsinline="true"></video>';
palnter.showVideo();
```

<br /><br />

---
## `MediaStreamConstraints` .videoSettings

A [MediaStreamConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints).

*reference:* [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

<br /><br />

---
## `function` .showVideo

*Syntax:* `.showVideo(videoSettings)`

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `Promise(resolve(), reject(ex))` | |
| videoSettings *(optional)* | `MediaStreamConstraints` | A [MediaStreamConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints). *reference:* [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) |

<br /><br />

---
## `function` .grabVideo

*Syntax:* `.grabVideo()`

Grab a image from the video and return the image.

| parameter | type | description |
| --- | --- | --- |
| *(return value)* | `HTMLCanvasElement` | |

<br />

*Syntax:* `.grabVideo(true, callback)`

Grab a image from the video and auto add image to the painter. Can only process in `View` mode.

| parameter | type | description |
| --- | --- | --- |
| callback *(optional)* | `function(boolean bSuccess)` | |

<br /><br />

---
## `function` .hideVideo

*Syntax:* `.hideVideo()`

<br /><br />

---
## `event` .beforeAddImgFromGrabVideoBtn

*Syntax:* `function(canvas, callback){}`

*example:*
```js
painter.beforeAddImgFromGrabVideoBtn = function(canvas, callback){
    doSomeWorkToGetNewSrc(canvas, function(srcValidForAddImage){
        callback(srcValidForAddImage);
    });
};
```

<br /><br />

---
## `event` .afterAddImgFromGrabVideoBtn

*Syntax:* `function(){}`

*example:*
```js
painter.afterAddImgFromGrabVideoBtn = function(bSuccess){
    if(bSuccess){console.log('The new image(s) has been added from video.');}
};
```

<br /><br />


