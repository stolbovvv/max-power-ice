import path from 'path';
import gulp from 'gulp';
import gzip from 'gulp-zip';
import sync from 'browser-sync';
import babel from 'gulp-babel';
import terser from 'gulp-terser';
import rename from 'gulp-rename';
import postcss from 'gulp-postcss';
import cssnano from 'cssnano';
import autoprefixer from 'autoprefixer';
import postcssPresetEnv from 'postcss-preset-env';
import * as del from 'del';

// Settings: "Mode"
const MODE = {
  DEV: !process.argv.includes('--production'),
  PROD: process.argv.includes('--production'),
};

// Settings: "Directories"
const DIR = {
  ROOT: path.basename(process.cwd()),
  BUILD: 'dist',
  SOURCE: 'src',
  PUBLIC: 'public',
};

// Task handle styles
function handleStyles() {
  const DIR_BUILD = `${DIR.BUILD}/_assets/styles`;
  const DIR_SOURCE = `${DIR.SOURCE}/_assets/styles`;

  const AUTOPREFIXER_CONFIG = {
    grid: true,
  };

  const POSTCSS_PRESET = {
    features: {
      ['nesting-rules']: {
        noIsPseudoSelector: false,
      },
    },
  };

  const POSTCSS_CONFIG = [postcssPresetEnv(POSTCSS_PRESET), autoprefixer(AUTOPREFIXER_CONFIG)];

  return gulp
    .src([`${DIR_SOURCE}/**/*.css`, `!${DIR_SOURCE}/**/*.min.css`], { sourcemaps: MODE.DEV })
    .pipe(postcss(POSTCSS_CONFIG))
    .pipe(gulp.dest(`${DIR_BUILD}/`))
    .pipe(rename({ suffix: '.min' }))
    .pipe(postcss([cssnano()]))
    .pipe(gulp.dest(`${MODE.PROD ? DIR_BUILD : DIR_SOURCE}/`, { sourcemaps: '.' }))
    .pipe(sync.stream());
}

// Task handle scripts
function handleScripts() {
  const DIR_BUILD = `${DIR.BUILD}/_assets/scripts`;
  const DIR_SOURCE = `${DIR.SOURCE}/_assets/scripts`;

  const BABEL_CONFIG = {
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'entry',
          corejs: '3.22',
        },
      ],
    ],
  };

  const TERSER_CONFIG = {
    keep_fnames: true,
    mangle: false,
  };

  const RENAME_CONFIG = {
    suffix: '.min',
  };

  return gulp
    .src([`${DIR_SOURCE}/**/*.js`, `!${DIR_SOURCE}/**/*.min.js`], { sourcemaps: MODE.DEV })
    .pipe(babel(BABEL_CONFIG))
    .pipe(gulp.dest(`${DIR_BUILD}/`))
    .pipe(terser(TERSER_CONFIG))
    .pipe(rename(RENAME_CONFIG))
    .pipe(gulp.dest(`${MODE.PROD ? DIR_BUILD : DIR_SOURCE}/`, { sourcemaps: '.' }))
    .pipe(sync.stream());
}

// Task handle copying
function handleCopying() {
  return gulp
    .src([`${DIR.PUBLIC}/**/*.*`], { base: DIR.PUBLIC })
    .pipe(gulp.dest(`${DIR.BUILD}/`))
    .pipe(gulp.src([`${DIR.SOURCE}/**/*.*`, `!${DIR.SOURCE}/_assets/{styles,scripts}/**/*.*`], { base: DIR.SOURCE }))
    .pipe(gulp.dest(`${DIR.BUILD}/`));
}

// Task handle archive
function handleArchive() {
  return gulp
    .src(`${DIR.BUILD}/**/*`)
    .pipe(gzip(`${DIR.ROOT}.zip`))
    .pipe(gulp.dest('.'));
}

function runClean(out) {
  del.deleteSync(`${DIR.BUILD}/*`);
  del.deleteSync(`${DIR.ROOT}.zip`);

  out();
}

// Task run watcher
function runWatcher() {
  gulp.watch([`${DIR.PUBLIC}/**/*.*`]).on('change', sync.reload);
  gulp.watch([`${DIR.SOURCE}/**/*.*`, `!${DIR.SOURCE}/_assets/{styles,scripts}/**/*.*`]).on('change', sync.reload);
  gulp.watch([`${DIR.SOURCE}/_assets/styles/**/*.css`, `!${DIR.SOURCE}/_assets/styles/**/*.min.css`], handleStyles);
  gulp.watch([`${DIR.SOURCE}/_assets/scripts/**/*.js`, `!${DIR.SOURCE}/_assets/scripts/**/*.min.js`], handleScripts);
}

// Task run server
function runServer() {
  sync.init({
    server: {
      baseDir: MODE.PROD ? DIR.BUILD : [DIR.SOURCE, DIR.PUBLIC],
    },
    notify: false,
    open: MODE.PROD,
    port: MODE.PROD ? 8080 : 1234,
    ui: false,
  });
}

// Gulp scripts:
export const clean = gulp.series(runClean);
export const build = gulp.series(runClean, handleStyles, handleScripts, handleCopying);
export const preview = gulp.series(runClean, handleStyles, handleScripts, handleCopying, runServer);
export const archive = gulp.series(runClean, handleStyles, handleScripts, handleCopying, handleArchive);

// Gulp default script:
export default gulp.series(runClean, gulp.parallel(handleStyles, handleScripts), gulp.parallel(runServer, runWatcher));
