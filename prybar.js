function Prybar(selector){

  function getSvg(){
    return document.querySelector(selector)
  }

  function cloneSvg(){
    // Adapted from SVG Crowbar
    // https://github.com/NYTimes/svg-crowbar/blob/gh-pages/svg-crowbar-2.js

    function copyWithStyle(oNode, cNode) {
      if (oNode && oNode.hasChildNodes()) {
        var child = oNode.firstChild;
        while (child) {
          var isElement = child.nodeType === 1 && child.nodeName != 'SCRIPT',
              isText = child.nodeType === 3;
          if (isElement || isText) {
            var newChild = child.cloneNode();
            if (isElement){
              newChild.setAttribute('style', getExplicitStyle(child));
            }
            cNode.appendChild(newChild);
            if (isElement){
              copyWithStyle(child, newChild);
            }
          }
          child = child.nextSibling;
        }
      }
    }

    function getExplicitStyle (element) {
      var cSSStyleDeclarationComputed = getComputedStyle(element);
      var i, len, key, value;
      var computedStyleStr = "";
      for (i=0, len=cSSStyleDeclarationComputed.length; i<len; i++) {
        key=cSSStyleDeclarationComputed[i];
        value=cSSStyleDeclarationComputed.getPropertyValue(key);
        if (value!==svgDeclarationComputed.getPropertyValue(key)) {
          computedStyleStr+=key+":"+value+";";
        }
      }
      return computedStyleStr
    }

    var prefix = {
          xmlns: "http://www.w3.org/2000/xmlns/",
          xlink: "http://www.w3.org/1999/xlink",
          svg: "http://www.w3.org/2000/svg"
        },
        svgOrig = getSvg(),
        svgCopy = window.document.createElementNS(prefix.svg, 'svg'),
        svgDeclarationComputed = getComputedStyle(svgOrig);

    svgCopy.setAttribute("version", "1.1");
    svgCopy.removeAttribute("xmlns");
    svgCopy.removeAttribute("xlink");

    if (!svgCopy.hasAttributeNS(prefix.xmlns, "xmlns")) {
      svgCopy.setAttributeNS(prefix.xmlns, "xmlns", prefix.svg);
    }

    if (!svgCopy.hasAttributeNS(prefix.xmlns, "xmlns:xlink")) {
      svgCopy.setAttributeNS(prefix.xmlns, "xmlns:xlink", prefix.xlink);
    }

    copyWithStyle(svgOrig, svgCopy);

    return svgCopy
  }

  function initCanvas(){
    var svg = getSvg(),
        svgBBox = svg.getBoundingClientRect(),
        canvas = document.createElement('canvas');

    canvas.width = svgBBox.width;
    canvas.height = svgBBox.height;

    return canvas
  }

  function drawCanvas(callback){
    var svgSource = svgToSource(),
        svgBlob = new Blob([svgSource], {type: 'image/svg+xml;charset=utf-8'}),
        canvas = initCanvas(),
        ctx = canvas.getContext('2d'),
        DOMURL = window.URL || window.webkitURL || window,
        objURL = DOMURL.createObjectURL(svgBlob),
        img = new Image();

    img.onload = function(){
      ctx.drawImage(img, 0, 0);
      if (typeof(callback) === 'function'){
        callback(canvas);
      }
      DOMURL.revokeObjectURL(objURL);
      console.log('svg blob size: ' + svgBlob.size);
      console.log('png data length: ' + canvas.toDataURL().length);
      canvas.toBlob(function(b){ console.log('png blob size: ' + b.size) });
    }
    img.src = objURL;

    return canvas
  }

  function svgToCanvas(){
    return drawCanvas()
  }

  function svgToImage(){
    var $img = document.createElement('img');
    drawCanvas(function(canvas){
      $img.src = canvas.toDataURL('image/png');
    });
    return $img
  }

  function svgToSource(){
    var svg = cloneSvg(),
        serializer = new XMLSerializer();
    return serializer.serializeToString(svg)
  }

  function downloadDataURL(dataURL, filename){
    var $download = document.createElement('a');
    $download.setAttribute('style', 'display:none');
    $download.setAttribute('href', dataURL);
    $download.setAttribute('download', filename);
    document.body.appendChild($download);
    $download.click();
    document.body.removeChild($download);
  }

  /********************/
  /* Public interface */
  /********************/

  this.selector = selector;

  this.getSvg = getSvg;

  this.clone = cloneSvg;

  this.drawCanvas = drawCanvas;

  this.toCanvas = svgToCanvas;

  this.toImage = svgToImage;

  this.toSource = svgToSource;

  // Exporters

  this.exportPng = function(filename, method){
    if (method <= 1){
      // Works in Chrome, not really FF
      drawCanvas(function(canvas){
        var dataURL = canvas.toDataURL('image/png');
        downloadDataURL(dataURL, filename);
      });
    } else if (method == 2){
      // Works, but triggers popup blocking
      // Works in Chrome, not really FF
      drawCanvas(function(canvas){
        var dataURL = canvas.toDataURL('image/png');
        window.open(dataURL, 'ExportedPlotWindow', '');
      });
    } else if (method == 3){
      // This method sucks; filename doesn't really work
      drawCanvas(function(canvas){
        var dataURL = canvas.toDataURL('image/png');
        var dlMimetype = 'application/octet-stream;' +
          'headers=Content-Disposition%3A%20attachment%3B%20filename=' +
          filename;
        var downloadURL = dataURL.replace('image/png', dlMimetype);
        window.open(downloadURL);
      });
    } else if (method == 4){
      // Surprisingly doesn't trigger popup blockers.
      // Works in Chrome, not really FF
      // Probably should use a whole page template w/ html doctype, etc.
      // Can check if window has already been opened
      var $plotWindow = window.open('', 'ExportedPlotWindow');
      drawCanvas(function(canvas){
        var dataURL = canvas.toDataURL('image/png');
        $plotWindow.document.write('<body>');
        $plotWindow.document.write('<img src="' + dataURL + '"/>');
        $plotWindow.document.write(
            '<p>Right click on the image above and select "Save image as..."</p>');
        $plotWindow.document.write('</body>');
      })
    } else if (method == 5){
      // Works in Chrome, not really FF
      // Not sure if better than using dataURL
      drawCanvas(function(canvas){
        canvas.toBlob(function(blob){
          var DOMURL = window.URL || window.webkitURL || window,
              objectURL = DOMURL.createObjectURL(blob);
          downloadDataURL(objectURL, filename);
        });
      });
    } else if (method == 6){
      // Combination of window.open + blobURL
      // Doesn't trigger popup blockers.
      // Works in Chrome, not really FF
      // Probably should use a whole page template w/ html doctype, etc.
      // Can check if window has already been opened
      var $plotWindow = window.open('', 'ExportedPlotWindow');
      drawCanvas(function(canvas){
        canvas.toBlob(function(blob){
          var DOMURL = window.URL || window.webkitURL || window,
              objectURL = DOMURL.createObjectURL(blob);
          $plotWindow.document.write('<body>');
          $plotWindow.document.write('<img src="' + objectURL + '"/>');
          $plotWindow.document.write(
              '<p>Right click on the image above and select "Save image as..."</p>');
          $plotWindow.document.write('</body>');
        });
      })
    } // endif
  }

  this.exportSvg = function(filename){
    var svgSource = svgToSource(),
        dataURL = 'data:image/svg+xml;charset=utf-8,' +
          encodeURIComponent(svgSource);

    if(filename.split('.').slice(-1) != 'svg'){
      filename += '.svg';
    }

    // I think this method only works in Chrome
    // It does work in FF 47
    var $download = document.createElement('a');
    $download.setAttribute('href', dataURL);
    $download.setAttribute('download', filename);
    $download.style.display = 'none';
    document.body.appendChild($download);
    $download.click();
    document.body.removeChild($download);
  }
}
