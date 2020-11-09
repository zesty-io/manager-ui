/* global require */

const gulp = require("gulp");
const concat = require("gulp-concat");
const riot = require("gulp-riot");

function buildTags() {
  return gulp
    .src("src/**/*.tag")
    .pipe(riot())
    .pipe(concat("tags.js"))
    .pipe(gulp.dest("../../../build/"));
}

gulp.task("default", gulp.series(buildTags));
