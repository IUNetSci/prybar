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

## Installation
```
$ bower install prybar
```

## Development
First you need to get the dev dependencies with `npm`
```
$ npm install -g gulp
$ npm install
```

Then you make your changes to `prybar.js`, and build with
```
$ gulp
```
This will build and minify prybar and its dependencies, and put the result in `./dist`.

## Examples
TODO: JSFiddle example

First, download the dev dependencies as in the Development section. Then,
```
$ gulp example
```
will rebuild the sources and serve the `./examples/` directory.


## TODO

* Make examples nicer
* Refactor exporters
* gh-pages
* Safari support?
