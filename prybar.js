function Prybar(selector){
  var self = this;


  function getSvg(){
    if (typeof(self.selector) === 'string'){
      return document.querySelector(self.selector);
    } else {
      return self.selector;
    }
  }


  function cloneSvg(){
    // Adapted from SVG Crowbar
    // https://github.com/NYTimes/svg-crowbar/blob/gh-pages/svg-crowbar-2.js

    function copyWithStyle(oNode, cNode, copyRootNodeStyle) {
      if (copyRootNodeStyle){
        cNode.setAttribute('style', getExplicitStyle(oNode));
      }
      var oNodeStyleComputed = getComputedStyle(oNode);
      if (oNode && oNode.hasChildNodes()) {
        var child = oNode.firstChild;
        while (child) {
          var isElement = child.nodeType === 1 && child.nodeName != 'SCRIPT',
              isText = child.nodeType === 3;
          if (isElement || isText) {
            var newChild = child.cloneNode();
            if (isElement){
              var styleStr = getExplicitStyle(child, function(k, v){
                return v !== oNodeStyleComputed.getPropertyValue(k)
              });
              if (!!styleStr){
                newChild.setAttribute('style', styleStr);
              }
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

    function getExplicitStyle (element, filter) {
      var cSSStyleDeclarationComputed = getComputedStyle(element);
      var i, len, key, value;
      var computedStyleStr = "";
      if (arguments.length == 1){
        filter = function(){ return true }
      } else if (typeof filter !== 'function'){
        filter = function(){ return !!filter }
      }
      for (i=0, len=cSSStyleDeclarationComputed.length; i<len; i++) {
        key=cSSStyleDeclarationComputed[i];
        value=cSSStyleDeclarationComputed.getPropertyValue(key);
        if (filter(key, value)) {
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
        svgOrig = self.getSvg(),
        //svgCopy = window.document.createElementNS(prefix.svg, 'svg'),
        svgCopy = svgOrig.cloneNode();
        svgDeclarationComputed = getComputedStyle(svgOrig);

    // svgCopy.setAttribute('width', svgOrig.getAttribute('width'))
    // svgCopy.setAttribute('height', svgOrig.getAttribute('height'))
    // svgCopy.setAttribute("version", "1.1");

    svgCopy.removeAttribute("xmlns");
    svgCopy.removeAttribute("xlink");

    if (!svgCopy.hasAttributeNS(prefix.xmlns, "xmlns")) {
      svgCopy.setAttributeNS(prefix.xmlns, "xmlns", prefix.svg);
    }

    if (!svgCopy.hasAttributeNS(prefix.xmlns, "xmlns:xlink")) {
      svgCopy.setAttributeNS(prefix.xmlns, "xmlns:xlink", prefix.xlink);
    }

    copyWithStyle(svgOrig, svgCopy, false);

    return svgCopy
  }


  function initCanvas(){
    var svg = self.getSvg(),
        svgBBox = svg.getBoundingClientRect(),
        canvas = document.createElement('canvas');

    canvas.width = svgBBox.width;
    canvas.height = svgBBox.height;

    return canvas
  }


  function drawCanvas(callback){
    var svgSource = svgToSource(),
        svgBlob = NewBlob(svgSource, 'image/svg+xml;charset=utf-8'),
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


  function dataURLtoBlob(dataURL){
    // c.f. https://github.com/blueimp/JavaScript-Canvas-to-Blob
    var dataURLPattern = /^data:((.*?)(;charset=.*?)?)(;base64)?,/,
        matches = dataURL.match(dataURLPattern),
        mediaType = matches[2] ? matches[1] :
          'text/plain' + (matches[3] || ';charset=US-ASCII'),
        isBase64 = !!matches[4],
        dataString = dataURL.slice(matches[0].length),
        byteString = (isBase64 ? atob : decodeURIComponent)(dataString),
        arrayBuffer = new ArrayBuffer(byteString.length),
        intArray = new Uint8Array(arrayBuffer);
    for (i = 0; i < byteString.length; i += 1) {
      intArray[i] = byteString.charCodeAt(i)
    }
    // Write the ArrayBuffer (or ArrayBufferView) to a blob:
    var hasArrayBufferViewSupport = (typeof(Blob) !== 'undefined') &&
      window.Uint8Array &&
      (function () {
        try {
          return new Blob([new Uint8Array(100)]).size === 100
        } catch (e) {
          return false
        }
      }());
    return NewBlob(hasArrayBufferViewSupport ? intArray : arrayBuffer, mediaType)
  }


  function downloadDataURL(dataURL, filename){
    if (navigator.msSaveBlob){
      var blob = dataURLtoBlob(dataURL);
      navigator.msSaveBlob(blob, filename);
    } else {
      var $download = document.createElement('a');
      $download.setAttribute('style', 'display:none');
      $download.setAttribute('href', dataURL);
      $download.setAttribute('download', filename);
      document.body.appendChild($download);
      $download.click();
      document.body.removeChild($download);
    }
  }


  var $plotWindow;
  function popoutDataURL(dataURL){
    // Probably want a more complete HTML template here
    $plotWindow = window.open('', 'ExportedPlotWindow');
    $plotWindow.document.write('<body>');
    $plotWindow.document.write('<img src="' + dataURL + '"/>');
    $plotWindow.document.write(
        '<p>Right click on the image above and select "Save image as..."</p>');
    $plotWindow.document.write('</body>');
  }


  function exportDataURL(dataURL, filename){
    try {
      downloadDataURL(dataURL, filename);
    } catch (err) {
      console.warn("Prybar: Caught error '" + err + "' downloading file." +
          ' Attempting pop-out.');
      popoutDataURL(dataURL);
      // throw err
    }
  }


  // Export functions


  function exportPng(filename, options){
    /*
    var myOptions = {
      exporter: undefined,
      bg: undefined,
      converter: undefined,
    };
    */
    try {
      NewBlob();
    } catch (err) {
      throw 'No Blob support present; PNG export is disabled.'
    }

    var dataExporter;
    if (!options.exporter){
      // default is to use exportDataURL which tries download with popout as a
      // fallback
      dataExporter = exportDataURL;
    } else if (typeof(options.exporter) === 'function'){
      dataExporter = options.exporter;
    } else if (options.exporter.toLowerCase &&
               options.exporter.toLowerCase() == 'download'){
      dataExporter = downloadDataURL;
    } else if (options.exporter.toLowerCase &&
               options.exporter.toLowerCase() == 'popout'){
      dataExporter = popoutDataURL;
    } else {
      throw "Invalid value for 'exporter': " + options.exporter;
    }

    // default is to use native (should it be? canvg has better compat...)
    var useCanvg = (options.converter &&
                    options.converter.toLowerCase &&
                    options.converter.toLowerCase() == 'canvg');

    function _exportCanvas(canvas){
      if (options.bg){
        var ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'destination-over';
        if (typeof(options.bg) === 'string'){
          ctx.fillStyle = options.bg;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.drawImage(options.bg, 0, 0, canvas.width, canvas.height);
        }
      }
      var dataURL = canvas.toDataURL('image/png');
      if(filename.indexOf('.') == -1){
        filename += '.png';
      }
      dataExporter(dataURL, filename);
    }

    function exportCanvg(){
      var canvas = initCanvas(),
          svgSource = svgToSource();
      canvg(canvas, svgSource, {renderCallback:
        function(){ _exportCanvas(canvas) }
      });
    }

    function exportNative(){
      drawCanvas(function(canvas){
        try {
          _exportCanvas(canvas);
        } catch (err) {
          console.warn("Prybar: Caught error '" + err +
              "' in native canvas.toDataURL. Using canvg as a fallback.");
          exportCanvg();
          //throw err
        }
      });
    }

    useCanvg ? exportCanvg() : exportNative();
  }


  function exportSvg(filename, options){
    /*
     * The option parsing here is not DRY. There needs to be an Exporter
     * prototype that the different filetypes inherit from.
    */
    var dataExporter;
    if (!options.exporter){
      // default is to use exportDataURL which tries download with popout as a
      // fallback
      dataExporter = exportDataURL;
    } else if (typeof(options.exporter) === 'function'){
      dataExporter = options.exporter;
    } else if (options.exporter.toLowerCase &&
               options.exporter.toLowerCase() == 'download'){
      dataExporter = downloadDataURL;
    } else if (options.exporter.toLowerCase &&
               options.exporter.toLowerCase() == 'popout'){
      dataExporter = popoutDataURL;
    } else {
      throw "Invalid value for 'exporter': " + options.exporter;
    }

    var svg = cloneSvg(),
        serializer = new XMLSerializer();

    if (options.bg){
      if(typeof(options.bg) === 'string'){
        svg.style.background = options.bg;
      } else {
        var canvas = initCanvas(),
            ctx = canvas.getContext('2d');
        ctx.drawImage(options.bg, 0, 0, canvas.width, canvas.height);

        var dataURL = canvas.toDataURL('image/png'),
            $image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        $image.setAttribute('href', dataURL);
        $image.setAttribute('width', canvas.width + 'px');
        $image.setAttribute('height', canvas.height + 'px');
        if(svg.firstChild){
          svg.insertBefore($image, svg.firstChild);
        } else {
          svg.appendChild($image);
        }
      }
    }

    var svgSource = serializer.serializeToString(svg),
        // This could also be done with Blob * ObjectURL
        dataURL = 'data:image/svg+xml;charset=utf-8,' +
          encodeURIComponent(svgSource);

    if(filename.split('.').slice(-1) != 'svg'){
      filename += '.svg';
    }

    dataExporter(dataURL, filename);
  }


  /********************/
  /* Public interface */
  /********************/


  this.selector = selector;

  this.getSvg = getSvg;

  this.clone = cloneSvg;

  this.drawCanvas = drawCanvas;

  this.exportPng = exportPng;

  this.exportSvg = exportSvg;

  this.toCanvas = svgToCanvas;

  this.toImage = svgToImage;

  this.toSource = svgToSource;
}

// Polyfill for Blob constructor
var NewBlob = function(data, datatype){
  var blob;
  try{
    blob = new Blob([data], {type: datatype});
  } catch (err) {
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder ||
                         window.MozBlobBuilder || window.MSBlobBuilder;
    if (window.BlobBuilder){
      var bb = new BlobBuilder();
      bb.append(data);
      out = bb.getBlob(datatype);
    } else {
      throw err;
    }
  }
  return blob
};
