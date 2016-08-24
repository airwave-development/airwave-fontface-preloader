var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');


var bower = require('bower-files')();

/* jshint ignore:start */
var uglifyOptions = {
    mangle: true,
    compress: {
        dead_code: true,
        conditionals: true,
        comparisons: true,
        booleans: true,
        unused: true,
        if_return: true,
        join_vars: true
    }
};


gulp.task('build', [
	'build:dev',
	'build:dev-promise',
	'build:dist',
	'build:dist-promise'
]);

gulp.task('build:dev', function() {
	return gulp.src(['./src/fontface-preloader.js'])
		.pipe(concat('fontface-preloader.js'))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('build:dev-promise', function() {
    var src = bower.ext('js').files;
    src.push('./src/fontface-preloader.js');

	return gulp.src(src)
		.pipe(concat('fontface-preloader.promise.js'))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('build:dist', function() {
	return gulp.src(['./src/fontface-preloader.js'])
		.pipe(concat('fontface-preloader.min.js'))
        .pipe(uglify(uglifyOptions))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('build:dist-promise', function() {
    var src = bower.ext('js').files;
    src.push('./src/fontface-preloader.js');

	return gulp.src(src)
		.pipe(concat('fontface-preloader.promise.min.js'))
        .pipe(uglify(uglifyOptions))
		.pipe(gulp.dest('./dist/'));
});
/* jshint ignore:end */
