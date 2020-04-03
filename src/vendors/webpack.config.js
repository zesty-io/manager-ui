"use strict";

const webpack = require("webpack");

module.exports = {
  entry: "./index.js",
  devtool: "cheap-module-source-map",
  mode: process.env.ENV_MODE || "development",
  output: {
    filename: "../../../build/bundle.vendors.js"
  }
};
