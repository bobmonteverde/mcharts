'use strict';

import gulp from 'gulp';
import help from 'gulp-help';
help(gulp); // provide help through 'gulp help' -- the help text is the second gulp task argument (https://www.npmjs.com/package/gulp-help/)
import htmlReplace from 'gulp-html-replace';
import minifyHtml from 'gulp-minify-html';
import iff from 'gulp-if';
import size from 'gulp-size';

import config from '../config';
import utils from '../utils';



gulp.task('docs-html', 'Optimize HTML', () =>{
  return utils.plumbedSrc(
      config.html.src
  )

  // Display the files in the stream
  //.pipe($.debug({title: 'Stream contents:', minimal: true}))

  // Inject production assets path: https://www.npmjs.com/package/gulp-html-replace
  .pipe(htmlReplace({
    'css-bundle': config.styles.finalCssBundlePath,
    'js-app': config.javascript.finalJsBundlePath
  }))

  // Minify HTML
  .pipe(iff(config.files.any + config.extensions.html, minifyHtml()))

  // Output files
  .pipe(gulp.dest(config.html.dest))

  // Task result
  .pipe(size({
    title: 'docs-html'
  }));
});
