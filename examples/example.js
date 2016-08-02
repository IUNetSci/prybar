prybar = new Prybar('#svg-example');

var exportBtn = document.getElementById('btn-export');
exportBtn.addEventListener('click', function (e) {
      var canvas = prybar.toCanvas(),
          dataURL = canvas.toDataURL('image/png');
      window.open(dataURL);
});
