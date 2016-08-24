var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var webserver = require('gulp-webserver');

var BUILD = 'build/';
var DIST = 'dist/';
var EXAMPLES = 'examples/';


gulp.task('default', ['build', 'dist']);

gulp.task('build', function(){
  var BUILD_FILES = [
    'node_modules/canvg/rgbcolor.js',
    'node_modules/canvg/canvg.js',
    'prybar.js'
  ];
  return gulp.src(BUILD_FILES)
    .pipe(gulp.dest(BUILD))
    .pipe(concat('prybar.bundle.js'))
    .pipe(gulp.dest(BUILD))
    .pipe(uglify())
    .pipe(rename({extname: '.min.js'}))
    .pipe(gulp.dest(BUILD))
    ;
});

gulp.task('dist', ['build'], function(){
  return gulp.src([BUILD + 'prybar*.js'])
    .pipe(gulp.dest(DIST))
    ;
});

gulp.task('example', ['build'], function(){
  gulp.src(BUILD + '*')
    .pipe(gulp.dest(EXAMPLES + 'build/'));
  gulp.src(EXAMPLES)
    .pipe(webserver({
      open: true,
      livereload: true,
      directoryListing: {
        enable: true,
        path: './' + EXAMPLES,
        options: {
          filter: function(filename, index, files, dir){
            return !!filename.match(/\.html$/)
          }
        }
      }
    }));
});

gulp.task('clean', function(){
  return del([
    BUILD,
    DIST,
    EXAMPLES + BUILD,
    EXAMPLES + DIST
  ]);
});
