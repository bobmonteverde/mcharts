'use strict';

import gulp from 'gulp';
import help from 'gulp-help';
import sourcemaps from 'gulp-sourcemaps';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import csso from 'gulp-csso';
import iff from 'gulp-if';
import size from 'gulp-size';
import browserSync from 'browser-sync';

import config from '../config';
import utils from '../utils';

help(gulp); // provide help through 'gulp help' -- the help text is the second gulp task argument (https://www.npmjs.com/package/gulp-help/)


gulp.task('core-styles', 'Compile core styles, add vendor prefixes and generate sourcemaps', () => {

  // For best performance, don't add Sass partials to `gulp.src`
  return utils.plumbedSrc( // handle errors nicely (i.e., without breaking watch)
      config.styles.srcCore
  )

  // Initialize sourcemap generation
  .pipe(sourcemaps.init())

  // Process the sass files
  .pipe(sass({
    style: 'compressed'
    //precision: 10,
    //onError: console.error.bind(console, 'Sass error:')
  }))

  // Write sourcemaps: https://www.npmjs.com/package/gulp-sourcemaps
  .pipe(sourcemaps.write('.'))
  //.pipe(sourcemaps.write({ // use '.' to write the sourcemap to a separate file in the same dir
    //includeContent: false, // alternative: include the contents and remove sourceRoot. Avoids issues but prevents from editing the sources directly in the browser
    //sourceRoot: './' // use the file's folder as source root
  //}))

  // Include vendor prefixes
  // The if clause prevents autoprefixer from messing up the sourcemaps (necessary if the maps are put in separate files)
  // reference: https://github.com/sindresorhus/gulp-autoprefixer/issues/8#issuecomment-93817177
  .pipe(iff([ config.extensions.css, '!*.map' ], autoprefixer({
    browsers: config.autoprefixerBrowsers // alternative: $.autoprefixer('last 2 version')
  })))

  // Output files
  .pipe(gulp.dest(config.styles.dest))

  // Task result
  .pipe(size({
    title: 'core-styles'
  }))

  // Reload Browser if needed
  // Stream if possible
  .pipe(iff(browserSync.active, browserSync.reload({
    stream: true, once: true
  })));
});
