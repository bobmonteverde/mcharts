
'use strict';

import gulp from 'gulp';
import help from 'gulp-help';
help(gulp); // provide help through 'gulp help' -- the help text is the second gulp task argument (https://www.npmjs.com/package/gulp-help/)
import browserSync from 'browser-sync';
import runSequence from 'run-sequence';

import config from '../config';
import utils from '../utils';


// Watch files for changes & reload
let startBrowserSync = () => {
  browserSync({
    notify: false,
    // Customize the BrowserSync console logging prefix
    // logPrefix: 'WSK', //TODO: decide if I should use a custom prefix here
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    //server: ['.tmp', 'app']
    server: config.webServerFolders.dev
  });

  gulp.watch([config.html.src], browserSync.reload);
  gulp.watch([config.styles.src], ['core-styles', browserSync.reload]);
  gulp.watch(config.javascript.src, [
    //'es-lint',
    'core-scripts'
  ]); // JavaScript changes will force a reload
  gulp.watch([config.images.src], browserSync.reload);
};


//gulp.task('serve', 'Watch files for changes and rebuild/reload automagically', () =>{
gulp.task('serve', () => {
  runSequence('prepare-serve', startBrowserSync); // here we need to ensure that all the other tasks are done before we start BrowserSync
});


//gulp.task('prepare-serve', 'Do all the necessary preparatory work for the serve task', (callback) =>{
gulp.task('prepare-serve', (callback) => {
  return runSequence([
    //'gen-ts-refs',
    'core-scripts',
    'core-styles',
    //'validate-package-json'
    'docs-html'
    //'images'
  ], callback);
});
