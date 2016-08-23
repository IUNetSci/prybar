// The Prybar constructor takes either a query selector or a DOM element
prybar = new Prybar('#svg-example');
// prybar = new Prybar(document.querySelector('#svg-example'));

function getExportOptions(){
  return {
    // defaults to download
    exporter: (document.querySelector('#rad-popout').checked ? 'popout': null),
    // defaults to native
    converter: (document.querySelector('#rad-canvg').checked ? 'canvg' : null),
    bg: document.querySelector('#bg-image')
  }
}

document.getElementById('btn-to-canvas')
  .addEventListener('click', function (e) {
    var canvas = prybar.toCanvas();
    document.body.appendChild(canvas);
  });

document.getElementById('btn-to-image')
  .addEventListener('click', function (e) {
    var image = prybar.toImage();
    document.body.appendChild(image);
  });

document.getElementById('btn-export-png')
  .addEventListener('click', function (e) {
    var opts = getExportOptions();
    console.log('exportPng', opts);
    prybar.exportPng('exported_plot.png', opts);
  });

document.getElementById('btn-export-svg')
  .addEventListener('click', function (e) {
    var opts = getExportOptions();
    console.log('exportSvg', opts);
    prybar.exportSvg('exported_plot.svg', opts);
  });
