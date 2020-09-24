const cp = require("child_process");
const os = require("os");

module.exports = function runNpmCmd(dir, cmd) {
  const options = {
    env: process.env,
    cwd: dir,
    stdio: "inherit"
  };
  if (os.platform() === "win32") {
    options.shell = true;
  }
  cp.spawn("npm", ["run", cmd], options);
};
