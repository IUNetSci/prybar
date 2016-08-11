# prybar
Export SVG images from the web as .png or .svg files. Adapted from
[SVG Crowbar](https://github.com/NYTimes/svg-crowbar/blob/gh-pages/svg-crowbar-2.js).

## Features

- Export to SVG file
  - Exported with all styles inlined for maximum compatibility
- Export to PNG file
- Export to DOM element
  - `<canvas>`
  - `<img>`

## Browser support

* Chrome (versions?)
* Firefox (42+?)
* IE10+
* IE9 (SVG export only)

## Bundle & minify
``` bash
$ uglifyjs -c -m -r "prybar" canvg/rgbcolor.js canvg/canvg.js prybar.js > prybar.all.min.js
```

## TODO

* Finish example
* gh-pages
* Safari support?
* Bower
* Grunt
