'use strict';

import gulp from 'gulp';
import help from 'gulp-help';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import size from 'gulp-size';

import config from '../config';
import utils from '../utils';

help(gulp); // provide help through 'gulp help' -- the help text is the second gulp task argument (https://www.npmjs.com/package/gulp-help/)


gulp.task('core-scripts-dist', 'Package all JavaScript code for production', () => {
  return utils.plumbedSrc( // handle errors nicely (i.e., without breaking watch)
    config.folders.temp + config.globs.scripts.javascript
  )

  // Minify JS with Uglify
  .pipe(uglify())

  // Rename to finalJsBundleName (mcharts.min.js)
  .pipe(rename(config.javascript.finalJsBundleName))

  // Output minified file to dist folder
  .pipe(gulp.dest(config.folders.dist))

  // Task result
  .pipe(size({
    title: 'core-scripts-dist'
  }));
});

