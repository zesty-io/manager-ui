#! /usr/bin/env node
// @see https://strongloop.com/strongblog/modular-node-js-express/

const fs = require("fs");
const path = require("path");
const ncp = require("ncp").ncp;
const runPkgCmd = require("./runPkgCmd");

const root = path.resolve(__dirname, "../");
const src = root + "/src";
const appDir = root + "/src/apps";

ncp(
  `${root}/public`,
  `${root}/build`,
  {
    stopOnErr: true
  },
  function(err) {
    if (err) {
      return console.error(err);
    } else {
      fs.readdirSync(src).forEach(dir => {
        runPkgCmd(path.join(src, dir), "build");
      });

      fs.readdirSync(appDir).forEach(app => {
        runPkgCmd(path.join(appDir, app), "build");
      });
    }
  }
);
