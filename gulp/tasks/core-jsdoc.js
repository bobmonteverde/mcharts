'use strict';

import gulp from 'gulp';
import help from 'gulp-help';
//import changed from 'gulp-changed';
import jsdoc from 'gulp-jsdoc';
import size from 'gulp-size';

import config from '../config';
import utils from '../utils';

help(gulp); // provide help through 'gulp help' -- the help text is the second gulp task argument (https://www.npmjs.com/package/gulp-help/)


gulp.task('core-jsdoc', 'Run jsdoc to generate docs automatically from comments in js', () => {
  return utils.plumbedSrc( // handle errors nicely (i.e., without breaking watch)
    config.javascript.src
  )

  .pipe(jsdoc(config.folders.docs))


  // Task result
  .pipe(size({
    title: 'core-jsdoc'
  }))
});
