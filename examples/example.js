prybar = new Prybar('#svg-example');

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
    var exportMethod = document.getElementById('export-png-method').value
    prybar.exportPng('exported_plot.png', exportMethod);
  });

document.getElementById('btn-export-svg')
  .addEventListener('click', function (e) {
    prybar.exportSvg('exported_plot.svg');
  });
