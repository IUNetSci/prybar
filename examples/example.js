prybar = new Prybar('#svg-example');

document.getElementById('btn-to-canvas')
  .addEventListener('click', function (e) {
    var canvas = prybar.toCanvas();
    document.body.appendChild(canvas);
  });

document.getElementById('btn-export-png')
  .addEventListener('click', function (e) {
    var canvas = prybar.toCanvas(),
        dataURL = canvas.toDataURL('image/png');
    window.open(dataURL);
  });

document.getElementById('btn-export-svg')
  .addEventListener('click', function (e) {
    prybar.exportSvg('exported_plot.svg');
  });
