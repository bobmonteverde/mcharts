'use strict';

import utils from './utils';

let extensions = {
  javascript: '.js',
  sourcemaps: '.map',
  css: '.css',
  sass: '.scss',
  html: '.html'
};

let folders = {
  root: '.',
  dist: './dist',
  temp: './.tmp',
  app: './src',
  models: '/models',
  docs: './docs',
  styles: '/styles',
  scripts: '/scripts',
  images: '/images',
  nodeModules: './node_modules',
  jspmPackages: './jspm_packages'
};

let globs = {
  any: '/**/*',
  scripts: {
    javascript: '/**/*' + extensions.javascript,
    sourcemaps: '/**/*' + extensions.javascript + extensions.sourcemaps
  },
  styles: {
    css: '/**/*' + extensions.css,
    sass: '/**/*' + extensions.sass
  },
  images: folders.images + '/**/*',
  html: '/**/*' + extensions.html
};

let files = {
  any: '*',
  coreSASS: folders.app + folders.styles + '/mcharts.scss',
  packageJSON: folders.root + '/package.json',
  jspmConfigFile: folders.root + '/config.js' //'/jspm.conf.js' TODO: consider renaming /config.js to jspm.config.js for clarity
};

let webServerFolders = {
  dev: [
    folders.root, // necessary to have jspm_packages & jspm config file without needing a copy step
    folders.temp,
    folders.docs,
    folders.app
  ],
  dist: [
    folders.dist
  ]
};

let jsBundleName = 'mcharts.js';
let finalJsBundleName = 'mcharts.min.js';
let finalJsBundleNameNoExtension = 'mcharts.min';
// Can update this to wrap the final JS file in UMD/AMD/whatever format
let wrapJSTemplate = '(function(d3) {%= body %})(d3);';

let javascript = {
  src: [
    //folders.app + '/start.js',
    folders.app + '/main.js',
    folders.app + '/utils.js',
    folders.app + '/layer.js',
    folders.app + '/tooltip.js',
    folders.app + folders.models + globs.scripts.javascript,
    //folders.app + '/end.js'
  ],
  srcStart: folders.app + '/start.js',
  srcEnd: folders.app + '/end.js',
  //srcDist: folders.temp + '/' + jsBundleName,
  //srcDist: folders.temp + '/' + finalJsBundleName,
  srcDist: folders.temp + '/' + finalJsBundleNameNoExtension,
  //dest: folders.temp + '/' + jsBundleName,
  dest: folders.temp,
  //destDist: folders.dist + folders.scripts + '/' + finalJsBundleName,
  destDist: folders.dist + '/' + finalJsBundleName,
  jsBundleName: jsBundleName,
  finalJsBundleName: finalJsBundleName,
  finalJsBundlePath: folders.scripts + '/' + finalJsBundleName,
  wrapJSTemplate: wrapJSTemplate
};


let styles = {
  src: [
    folders.app + globs.styles.css,
    folders.app + globs.styles.sass
  ],
  srcDocsOnly: [
    folders.docs + folders.styles + globs.styles.css,
    folders.docs + folders.styles + globs.styles.sass
  ],
  srcCore: files.coreSASS,
  dest: folders.temp, // during DEV
  //dest: folders.temp + folders.styles, // during DEV
  destDist: folders.dist, // for PROD
  //destDist: folders.dist + folders.styles, // for PROD
  finalCssBundleFilename: 'mcharts.min.css',
  finalCssBundlePath: folders.styles + '/mcharts.min.css',
  finalCssDocsFilename: 'docs.min.css',
  finalCssDocsPath: folders.styles + '/docs.min.css'
};

let images = {
  src: [
    folders.docs + globs.images
  ],
  dest: folders.dist + folders.images
};

let html = {
  src: [
    folders.docs + globs.html
  ],
  dest: folders.dist
};


let copy = {
  src: [
    folders.app + globs.any,

    // ignore stuff handled by the other tasks
    utils.exclude(folders.app + globs.html),
    utils.exclude(folders.app + globs.styles.css),
    utils.exclude(folders.app + globs.styles.sass),
    utils.exclude(folders.app + globs.scripts.javascript),
  ],
  dest: folders.dist
};

let autoprefixerBrowsers = [
'ie >= 10',
'ie_mob >= 10',
'ff >= 30',
'chrome >= 34',
'safari >= 7',
'opera >= 23',
'ios >= 7',
'android >= 4.4',
'bb >= 10'
];

let minifyCss = { // https://www.npmjs.com/package/gulp-minify-g
  keepBreaks: false, // no problem here
  keepSpecialComments: true, // necessary for licensing
  compatibility: false, // no problem here
  aggressiveMerging: false // necessary because it breaks PureCSS
};

module.exports = {
  extensions,
  folders,
  globs,
  files,
  javascript,
  styles,
  images,
  html,
  copy,
  autoprefixerBrowsers,
  minifyCss,
  webServerFolders
};
