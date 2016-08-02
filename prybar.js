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

  function svgToSource(){
    var svg = cloneSvg(),
        serializer = new XMLSerializer();
    return serializer.serializeToString(svg)
  }

  function svgToCanvas(){
    var svgSource = svgToSource(),
        svgBlob = new Blob([svgSource], {type: 'image/svg+xml;charset=utf-8'}),
        canvas = initCanvas(),
        ctx = canvas.getContext('2d');

    console.log(svgBlob, svgSource);

    var DOMURL = window.URL || window.webkitURL || window,
        objURL = DOMURL.createObjectURL(svgBlob),
        img = new Image();

    img.onload = function(){
      ctx.drawImage(img, 0, 0);
      DOMURL.revokeObjectURL(objURL);
    }
    img.src = objURL;

    return canvas
  }

  /********************/
  /* Public interface */
  /********************/

  this.selector = selector;

  // Rename this? Like, selectSvg?
  this.getSvg = getSvg;

  this.toSource = svgToSource;

  this.toCanvas = svgToCanvas;

  // Maybe expose a toDataURL(mimetype) that works like canvas?
  this.toDataURL = function(mimetype){ }

  this.exportPng = function(){
    var canvas = svgToCanvas(),
        dataURL = canvas.toDataURL('image/png');
    console.log(dataURL);

    //canvas.setAttribute('id', '_pb-canvas');
    //document.body.appendChild(canvas);

    /*
    var $download = document.createElement('a');
    $download.setAttribute('style', 'display:none');
    $download.setAttribute('href', dataURL);
    $download.setAttribute('download', 'image.png');
    document.body.appendChild($download);
    $download.click();
    document.body.removeChild($download);
    */
    window.open(dataURL);

    /*
    console.log(dataURL);
    var dlMimetype = 'application/octet-stream;' +
      'headers=Content-Disposition%3A%20attachment%3B%20filename=image.png';
    var downloadURL = dataURL.replace('image/png', dlMimetype);
    $window = window.open(downloadURL);
    //$window.document.write('<img src="' + downloadURL + '"/>');
    */
  }

  this.exportSvg = function(filename){
    var svgSource = svgToSource(),
        dataURL = 'data:image/svg+xml;charset=utf-8,' +
          encodeURIComponent(svgSource);

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
