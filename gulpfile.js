const gulp = require('gulp');
const concat = require('gulp-concat-css');
const plumber = require('gulp-plumber');
const del = require('del');
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mediaquery = require('postcss-combine-media-query'); 
const htmlMinify = require('html-minifier');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');

function serve() {
  browserSync.init({
    server: {
      baseDir: './dist'
    }
  }, function(err, bs) {
    if (err) {
      console.log('BrowserSync encountered an error:', err);
    } else {
      console.log('BrowserSync is running');
    }
  });
}

function html() {
    const options = {
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      sortClassName: true,
      useShortDoctype: true,
      collapseWhitespace: true,
        minifyCSS: true,
        keepClosingSlash: true
    };
  return gulp.src('src/*.html')
        .pipe(plumber())
                .on('data', function(file) {
              const buferFile = Buffer.from(htmlMinify.minify(file.contents.toString(), options))
              return file.contents = buferFile
            })
                .pipe(gulp.dest('dist/'))
        .pipe(browserSync.reload({stream: true}));
} 
function scripts() {
  return gulp.src('src/scripts/*.js')
    .pipe(plumber())
    .pipe(uglify()) 
    .pipe(gulp.dest('dist/scripts'))
    .pipe(browserSync.reload({stream: true}))
    .on('end', () => console.log('Scripts task completed'));
}
function css() {
    const plugins = [autoprefixer(),
        mediaquery()
    ]
  return gulp.src('src/styles/*.css')
        .pipe(plumber())
        .pipe(concat('bundle.css'))
        .pipe(postcss(plugins))
                .pipe(gulp.dest('dist/'))
        .pipe(browserSync.reload({stream: true}));
}


const fs = require('fs');

function images() {
  return gulp.src('src/images/*.{jpg,png,svg,gif,ico,webp,avif}')
    .pipe(gulp.dest('dist/images'))
    .pipe(browserSync.reload({stream: true}))
    .on('end', function() {
      console.log('Images copied to dist/images');
      // Проверяем, что файлы действительно существуют в папке dist/images
      fs.readdir('dist/images', (err, files) => {
        if (err) {
          console.error('Error reading dist/images directory:', err);
          return;
        }
        console.log('Files in dist/images:', files);
      });
    });
}
function fonts() {
  return gulp.src('src/fonts/*')
    .pipe(gulp.dest('dist/fonts'))
    .pipe(browserSync.reload({stream: true}))
    .on('end', () => console.log('Fonts copied to dist/fonts'));
}
function clean() {
  return del('dist').then(() => console.log('dist directory cleaned'));
}

function watchFiles() {
  gulp.watch(['src/*.html'], html);
  gulp.watch(['src/styles/*.css'], css);
  gulp.watch(['src/images/*.{jpg,png,svg,gif,ico,webp,avif}'], images).on('change', path => console.log(`File ${path} changed, running images task`));
  gulp.watch(['src/scripts/*.js'], scripts).on('change', path => console.log(`File ${path} changed, running scripts task`));
  gulp.watch(['src/fonts/*'], fonts);
}

const build = gulp.series(clean, gulp.parallel(html, css, images, scripts));
const watchapp = gulp.parallel(build, watchFiles, serve);

exports.html = html;
exports.css = css;
exports.images = images;
exports.scripts = scripts;
exports.clean = clean;

exports.build = build;
exports.watchapp = watchapp;
exports.default = watchapp;