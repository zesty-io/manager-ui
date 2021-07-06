"use strict";

const fs = require("fs");
const path = require("path");
const execSync = require("child_process").execSync;

const pkg = require("../package.json");
const root = path.resolve(__dirname, "../");

/**
 * Collect information on the specific release and write to file in build.
 * This info is used with bug tracking software and as a http accessible check
 */
module.exports = async function release(env) {
  //create a buildInfo file
  const version = pkg.version;
  const buildEngineer = await execSync("whoami").toString().trim(-2);
  const gitCommit = await execSync("git rev-parse --short HEAD")
    .toString()
    .trim(-2);
  const gitBranch = await execSync("git rev-parse --abbrev-ref HEAD")
    .toString()
    .trim(-2);
  let gitState = await execSync("git status --porcelain").toString().trim(-2);
  gitState = gitState === "" ? "clean" : "dirty";

  const h = {
    _meta: {},
    data: {
      version: version,
      environment: env || "env not set",
      gitCommit: gitCommit,
      gitBranch: gitBranch,
      buildEngineer: buildEngineer,
      gitState: gitState,
      buildTimeStamp: Date.now(),
    },
    message: "healthy",
  };

  fs.writeFileSync(`${root}/build/release.json`, JSON.stringify(h));

  return h;
};
