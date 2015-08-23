'use strict';

import gulp from 'gulp';
import help from 'gulp-help';
//import changed from 'gulp-changed';
import eslint from 'gulp-eslint';
import size from 'gulp-size';

import config from '../config';
import utils from '../utils';

help(gulp); // provide help through 'gulp help' -- the help text is the second gulp task argument (https://www.npmjs.com/package/gulp-help/)


gulp.task('core-eslint', 'Lint core JS code with ESLint', () => {
  return utils.plumbedSrc( // handle errors nicely (i.e., without breaking watch)
    config.javascript.src
  )

  // eslint() attaches the lint output to the eslint property
  // of the file object so it can be used by other modules.
  .pipe(eslint({
    globals: {
      'd3': true
    }
  }))
  // eslint.format() outputs the lint results to the console.
  // Alternatively use eslint.formatEach() (see Docs).
  .pipe(eslint.format())
  // To have the process exit with an error code (1) on
  // lint error, return the stream and pipe to failOnError last.
  //.pipe(eslint.failOnError());

});
