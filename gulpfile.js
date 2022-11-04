const { src, dest, watch, parallel, series } = require('gulp');
const scss                           = require('gulp-sass')(require('sass'));
const concat                         = require('gulp-concat');
const autoprefixer                   = require('gulp-autoprefixer');
const browserSync                    = require('browser-sync').create();
const uglify                         = require('gulp-uglify-es').default;
const imagemin                       = require('gulp-imagemin');
const newer                          = require('gulp-newer');

function browsersync(){
	browserSync.init({
    server: { baseDir: "app/" },
    notify: false,
    online: true,
  });
}

function bulidStyle(){
	return src('app/scss/style.scss')
	.pipe(scss({outputStyle: 'compressed'}))
	.pipe(concat('style.min.css'))
	.pipe(
		autoprefixer({
			overrideBrowserslist: ["last 10 version"],
			grid: true,
		})
	)
	.pipe(dest('app/css'))
	.pipe(browserSync.stream())
}

function buildScripts(){
	return src('app/js/script.js')
	.pipe(concat('script.min.js'))
	.pipe(uglify(''))
	.pipe(dest('app/js/'))
	.pipe(browserSync.stream())
}

function buildImg() {
  return src("app/img/src/**/*")
    .pipe(newer("app/img/dest/"))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest("app/img/dist/"));
}

function smartWatch(){
	watch(['app/scss/**/*.scss'], bulidStyle)
	watch(['app/js/**/*.js', "!app/**/*.min.js"], buildScripts)
	watch(['app/*.html']).on('change', browserSync.reload)
	watch(["app/img/src/**/*"], buildImg)
}

function buildCopy() {
  return src(
    [
      "app/css/**/*.min.css",
      "app/js/**/*.min.js",
      "app/fonts/**/*",
      "app/img/dist/**/*",
      "app/**/*.html",
    ],
    {
      base: "app",
    }
  ).pipe(dest("dist"));
}

exports.bulidStyle = bulidStyle;
exports.browsersync = browsersync;
exports.smartWatch = smartWatch;
exports.buildScripts = buildScripts;
exports.buildImg = buildImg;
exports.default = parallel(buildScripts, browsersync, smartWatch, buildImg)
exports.build = series(buildScripts, bulidStyle, buildImg, buildCopy)