var gulp = require('gulp');
var concat = require('gulp-concat');
// var uglify = require('gulp-uglify');
var less = require('gulp-less');
var babel = require('gulp-babel');
var sourcemaps = require("gulp-sourcemaps");

gulp.task('babel', function () {
    gulp.src(['src/**/*.js','src/**/*.jsx'])
        .pipe(sourcemaps.init())
        .pipe(babel(
          {
            presets: [
              'react',
              'es2015',
              'stage-0'
            ],
            plugins: [
              // http://babeljs.io/docs/plugins/transform-object-rest-spread/
              "transform-object-rest-spread",

              // export from ES6 to use ./src/components/core/index.js
              "transform-export-extensions",

              // async function foo() { await bar(); }
              "transform-async-to-generator",
              "transform-regenerator",
              "transform-runtime"
            ]
          }
        ))
        // .pipe(concat('../static/js/app.js'))
        .pipe(sourcemaps.write("."))
        //.pipe(uglify())
        .pipe(gulp.dest('./'));
});

gulp.task('less', function () {
 return gulp.src('./src-style/**/*.less')
  .pipe(sourcemaps.init())
  .pipe(less())
  .pipe(concat('app.css'))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('./public/css'));
});

gulp.task('jsonData', function () {
    gulp.src(['src/**/*.json'])
        .pipe(gulp.dest('./build/'));
});

var watchTaskList = [
  'babel',
  'less',
  'jsonData'
];

gulp.task('watch',
          // Jobs before watch
          watchTaskList,
          function () {
            gulp.watch(
              [
                'src/**/*.js',
                'src/**/*.jsx',
                'src-style/**/*.less',
                'src/**/*.json'
              ],
              // watch jobs
              watchTaskList
            );
            // gulp.watch( 'src/**/*.scss', ['css'] );
          }
);
