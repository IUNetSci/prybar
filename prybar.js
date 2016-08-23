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

    copyWithStyle(svgOrig, svgCopy);

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

  this.exportPng = function(filename, options){
    try {
      NewBlob();
    } catch (err) {
      throw 'No Blob support present; PNG export is disabled.'
    }

    // Default options, get overridden by supplied options
    var myOptions = {
      // default export method is to try download, with popout as fallback
      exporter: exportDataURL,
      bg: null,
      converter: null,
    };

    Object.assign(myOptions, options);

    var dataExporter;
    if (typeof(myOptions.exporter) === 'function'){
      dataExporter = myOptions.exporter;
    } else if (myOptions.exporter.toLowerCase &&
               myOptions.exporter.toLowerCase() == 'download'){
      dataExporter = downloadDataURL;
    } else if (myOptions.exporter.toLowerCase &&
               myOptions.exporter.toLowerCase() == 'popout'){
      dataExporter = popoutDataURL;
    } else {
      throw "Invalid value for 'exporter': " + myOptions.exporter;
    }

    var useCanvg = (myOptions.converter &&
                    myOptions.converter.toLowerCase &&
                    myOptions.converter.toLowerCase() == 'canvg');

    function _exportCanvas(canvas){
      if (myOptions.bg && typeof(myOptions.bg) === 'string'){
        var ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = myOptions.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      var dataURL = canvas.toDataURL('image/png');
      dataExporter(dataURL, filename);
    }

    function exportCanvg(){
      var canvas = initCanvas(),
          svgSource = svgToSource();
      canvg(canvas, svgSource);
      _exportCanvas(canvas);
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

  this.exportSvg = function(filename){
    var svgSource = svgToSource(),
        // This could also be done with Blob * ObjectURL
        dataURL = 'data:image/svg+xml;charset=utf-8,' +
          encodeURIComponent(svgSource);

    if(filename.split('.').slice(-1) != 'svg'){
      filename += '.svg';
    }

    exportDataURL(dataURL, filename);
  }
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
}

Object.assign = Object.assign || function(target) {
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  target = Object(target);
  for (var index = 1; index < arguments.length; index++) {
    var source = arguments[index];
    if (source != null) {
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
  }
  return target;
};
