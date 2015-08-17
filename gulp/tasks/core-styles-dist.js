'use strict';

import gulp from 'gulp';
import help from 'gulp-help';
import sass from 'gulp-sass';
import cssimport from 'gulp-cssimport';
import concat from 'gulp-concat';
import csso from 'gulp-csso';
import minifyCss from 'gulp-minify-css';
import size from 'gulp-size';

import config from '../config';
import utils from '../utils';

help(gulp); // provide help through 'gulp help' -- the help text is the second gulp task argument (https://www.npmjs.com/package/gulp-help/)


gulp.task('core-styles-dist', 'Optimize and minimize stylesheets for production', () => {

  return utils.plumbedSrc( // handle errors nicely (i.e., without breaking watch)
    config.styles.srcCore
  )

  // Display the files in the stream
  //.pipe($.debug({title: 'Stream contents:', minimal: true}))

  //TODO: consider building sourcemaps in dist as separate file (users may want this).  Or copy non-minified css with sourcemaps from core-styles task to dist.

  // Process Sass files
  .pipe(sass({
    style: 'compressed'
    //errLogToConsole: true
  }))

  // Replace CSS imports by actual contents
  .pipe(cssimport())

  //TODO: should probably be adding prefixes with autoprefixer

  // Remove any unused CSS
  // Note that it breaks the sourcemaps (but we shouldn't care for dist since we don't need sourcemaps there)
  // Note that it also causes weird output during build in combination w/ Angular
  //.pipe($.uncss({
  //  html: [
  //    config.html.src
  //  ],
  //  // CSS Selectors for UnCSS to ignore
  //  ignore: [
  //  ]
  //}))

  // Regroup all files together
  .pipe(concat(config.styles.finalCssBundleFilename))

  // Optimize and minimize
  .pipe(csso()) // https://www.npmjs.com/package/gulp-csso
  .pipe(minifyCss(
      config.minifyCss
  ))

  // Output file
  .pipe(gulp.dest(config.styles.destDist))

  // Task result
  .pipe(size({
    title: 'core-styles-dist'
  }));
});

