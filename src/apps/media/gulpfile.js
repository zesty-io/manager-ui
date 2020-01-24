/* global require */

const { src, dest } = require("gulp");
const concat = require("gulp-concat");
const riot = require("gulp-riot");

exports.default = function build() {
  return src("src/**/*.tag")
    .pipe(riot())
    .pipe(concat("tags.js"))
    .pipe(dest("../../../build/"));
};
