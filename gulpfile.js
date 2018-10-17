let gulp = require('gulp');
let mocha = require('gulp-mocha');
let browserify = require('browserify');
let babelify = require('babelify');
let source = require('vinyl-source-stream');
let sass = require('gulp-sass');
let webserver = require('gulp-webserver');

gulp.task('es6', function() {
	browserify({
    	entries: 'src/js/main.js',
    	debug: true
  	})
    .transform(babelify.configure({
        presets : ["es2015"]
    }))
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./src/dist/js'))
});


gulp.task('sass', function () {
  return gulp.src('./src/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./src/dist/css'));

});

gulp.task('sass:watch', function () {
  gulp.watch('./src/scss/**/*.scss', ['sass']);
});


gulp.task('watch',function() {
	gulp.watch('src/js/main.js',['es6'])
});

gulp.task('webserver', function() {
  gulp.src('./src')
	.pipe(webserver({
		fallback: 'index.html'
	}));
});


gulp.task('default', ['watch','es6','sass:watch','sass','webserver']);

