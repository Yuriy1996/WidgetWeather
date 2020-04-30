const gulp = require('gulp');
const fileinclude = require('gulp-file-include');
const saas = require('gulp-sass');
const cssMin = require('gulp-cssmin');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const browserify = require('gulp-browserify');
const image = require('gulp-image');
const changed = require('gulp-changed');
const plumber = require('gulp-plumber');
const babel = require('gulp-babel');
const browserSync = require('browser-sync');

let pathsList = {
	root: {
		src: './layout/',
		dist: './dist/',
	},
	parts: {
		styles: 'styles/',
		scripts: 'scripts/',
		html: 'html/',
		images: 'images/',
		fonts: 'fonts/'
	}
};

const indexFiles = {
	html: 'home.html',
	styles: 'styles.scss',
	scripts: 'main.js'
};

gulp.task('browserSync', function () {
	browserSync({
		server: {
			baseDir: ('./')
		},
		port: 8080,
		open: true,
		notify: false,
		startPath: pathsList.root.dist + pathsList.parts.html + indexFiles.html
	});
});

gulp.task('html:build', () => {
	return gulp.src(pathsList.root.src + pathsList.parts.html + '*.html')
		.pipe(plumber())
		.pipe(fileinclude({
			prefix: '@@',
			basepath: '@file'
		}))
		.pipe(plumber.stop())
		.pipe(gulp.dest(pathsList.root.dist + pathsList.parts.html))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('styles:build', () => {
	return gulp.src(pathsList.root.src + pathsList.parts.styles + '*.scss')
		.pipe(plumber())
		.pipe(saas().on('error', saas.logError))
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 2 versions'],
			cascade: false
		}))
		.pipe(cssMin())
		.pipe(plumber.stop())
		.pipe(gulp.dest(pathsList.root.dist + pathsList.parts.styles))
		.pipe(browserSync.stream());
});

gulp.task('scripts:build', () => {
	return gulp.src(pathsList.root.src + pathsList.parts.scripts + '*.js')
		.pipe(plumber())
		.pipe(browserify({
			insertGlobals: true,
			debug: true
		}))
		.pipe(babel({
			presets: ['env']
		}))
		.pipe(concat('script.js'))
		.pipe(plumber.stop())
		.pipe(gulp.dest(pathsList.root.dist + pathsList.parts.scripts))
		.pipe(browserSync.stream());
});

gulp.task('scripts-minifies:build', () => {
	return gulp.src(pathsList.root.src + pathsList.parts.scripts + '*.js')
		.pipe(plumber())
		.pipe(browserify({
			insertGlobals: true,
			debug: true
		}))
		.pipe(babel({
			presets: ['env']
		}))
		.pipe(concat('script.js'))
		.pipe(uglify({
			toplevel: true,
		}))
		.pipe(plumber.stop())
		.pipe(gulp.dest(pathsList.root.dist + pathsList.parts.scripts))
		.pipe(browserSync.stream());
});

gulp.task('images:build', () => {
	return gulp.src(pathsList.root.src + pathsList.parts.images + '**/*')
		.pipe(plumber())
		.pipe(changed(pathsList.root.dist + pathsList.parts.images))
		.pipe(image())
		.pipe(plumber.stop())
		.pipe(gulp.dest(pathsList.root.dist + pathsList.parts.images))
		.pipe(browserSync.stream());
});

gulp.task('fonts:build', () => {
	return gulp.src(pathsList.root.src + pathsList.parts.fonts + '**')
		.pipe(plumber())
		.pipe(plumber.stop())
		.pipe(gulp.dest(pathsList.root.dist + pathsList.parts.fonts))
});

gulp.task('layout:build', gulp.parallel('html:build', 'styles:build', 'scripts:build', 'images:build', 'fonts:build'));

//Compiles and minifies for production
gulp.task('build', gulp.parallel('html:build', 'styles:build', 'scripts-minifies:build', 'images:build', 'fonts:build'));

// Watchers

gulp.task('html:watch', () => {
	gulp.watch(pathsList.root.src + pathsList.parts.html + '**', gulp.series('html:build'))
});

gulp.task('styles:watch', () => {
	gulp.watch(pathsList.root.src + pathsList.parts.styles + '**', gulp.series('styles:build'));
});

gulp.task('scripts:watch', () => {
	gulp.watch(pathsList.root.src + pathsList.parts.scripts + '**', gulp.series('scripts:build'));
});

gulp.task('images:watch', () => {
	gulp.watch(pathsList.root.src + pathsList.parts.images + '**', gulp.series('images:build'));
});

gulp.task('watch', gulp.parallel('html:watch', 'styles:watch', 'scripts:watch', 'images:watch', 'browserSync'));

//build and watch

gulp.task('dev', gulp.parallel('layout:build', 'watch'));