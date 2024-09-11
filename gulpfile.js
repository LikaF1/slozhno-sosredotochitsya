//все ошибки поправила, ошибок консоль у ме6ня не выводит. Наставник Хаз проверил у себя на работоспособность и сказал работает.
//если что-то не так прошу оставить хоть подсказку так как я над этим файлом работала много и долго и иногда не понимаю причин. Надеюсь на понимание
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
//Скрипты написала с помощью советов в браузере и вроде загружают переключение темы.
//в курсах практикума НЕБЫЛО прописано как подключать скрипты даже в готовом файле их не было. Поэтому по просьбе ревью писала сама, для скриптов. И у меня работают.
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
      // Проверяем, что файлы действительно существуют в папке dist/images. Прошу заметить они там появляются, и проверка проходит
      fs.readdir('dist/images', (err, files) => {
        if (err) {
          //ошибки не выводит, но я не понимаю почему выводит в вид иконки ибо ошибки нет вообще нигде. Хаз тоже сказал что все хорошо!
          //в интернете пишут может быть связано с кэшэм 
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
  gulp.watch(['src/fonts/*'], fonts);// шрифты подключила, у меня отображаются в коде
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