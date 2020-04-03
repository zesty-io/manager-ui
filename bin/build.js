#! /usr/bin/env node
// @see https://strongloop.com/strongblog/modular-node-js-express/

const fs = require("fs");
const path = require("path");
const ncp = require("ncp").ncp;
const runPkgCmd = require("./runPkgCmd");

const root = path.resolve(__dirname, "../");
const src = root + "/src";
const appDir = root + "/src/apps";

console.log("BUILD");

let running = false;

ncp(`${root}/public`, `${root}/build`, function(err) {
  if (err) {
    console.log(err);
    throw err;
  } else {
    if (!running) {
      running = true;
      console.log("BUILD:NCP:done");

      fs.readdirSync(src).forEach(dir => {
        runPkgCmd(path.join(src, dir), "build");
      });

      fs.readdirSync(appDir).forEach(app => {
        runPkgCmd(path.join(appDir, app), "build");
      });
    }
  }
});
