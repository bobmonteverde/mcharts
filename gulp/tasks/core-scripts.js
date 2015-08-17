'use strict';

import gulp from 'gulp';
import help from 'gulp-help';
//import changed from 'gulp-changed';
import concat from 'gulp-concat';
import wrapJS from 'gulp-wrap-js';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'gulp-babel';
import iff from 'gulp-if';
import size from 'gulp-size';
import browserSync from 'browser-sync';

import config from '../config';
import utils from '../utils';

help(gulp); // provide help through 'gulp help' -- the help text is the second gulp task argument (https://www.npmjs.com/package/gulp-help/)


gulp.task('core-scripts', 'Transpile Core JavaScript (ES6 to ES5 using Babel) and generate sourcemaps', () =>{
  return utils.plumbedSrc( // handle errors nicely (i.e., without breaking watch)
    config.javascript.src
  )

  // Display the files in the stream
  //.pipe($.debug({title: 'Stream contents:', minimal: true}))

  // speed things up by ignoring unchanged resources
  //.pipe(changed(config.javascript.dest))

  // Initialize sourcemap generation
  .pipe(sourcemaps.init({
    debug: true
  }))

  // Transpile ES6 to ES5
  // options: https://babeljs.io/docs/usage/options/
  .pipe(babel({
    //modules: "system", // use the system module format. Useful since load these with SystemJS  //TODO: see what the best way right now to give module support (whether there is a good way to suport all common, whether it should bea build option or multiple builds, or if it is safe to use ES6 export syntax now
    stage: 1, // enable experimental features (e.g., decorators, etc): http://babeljs.io/docs/usage/experimental/
    comments: false // remove comments
  }))

  //concat into 1 filec (mcharts.js)
  .pipe(concat(config.javascript.jsBundleName))

  // Wrap JS in template (for now self calling function to prevent globals, but could change gulp/config.js to wrap in UMD/AMD/whatever
  .pipe(wrapJS(config.javascript.wrapJSTemplate))

  // Write sourcemaps: https://www.npmjs.com/package/gulp-sourcemaps
  .pipe(sourcemaps.write('.')) // use '.' to write the sourcemap to a separate file in the same dir
  //.pipe(sourcemaps.write({ // use '.' to write the sourcemap to a separate file in the same dir
    //includeContent: false, // alternative: include the contents and remove sourceRoot. Avoids issues but prevents from editing the sources directly in the browser
    //sourceRoot: '/' // use an absolute path because we have scripts in different subpaths
  //}))

  // Output files
  .pipe(gulp.dest(config.javascript.dest))

  // Display the files in the stream
  //.pipe($.debug({title: 'Stream contents:', minimal: true}))

  // Task result
  .pipe(size({
    title: 'core-scripts'
  }))

  // Reload Browser if needed
  .pipe(iff(browserSync.active, browserSync.reload({
    stream: true, once: true
  })));
});
