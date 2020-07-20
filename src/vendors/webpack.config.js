"use strict";

const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const extractText = new ExtractTextPlugin({
  filename: "../../../build/bundle.vendors.css"
  // disable: process.env.NODE_ENV === 'development'
});

module.exports = {
  entry: "./index.js",
  devtool: "cheap-module-source-map",
  mode: process.env.ENV_MODE || "development",
  output: {
    filename: "../../../build/bundle.vendors.js"
  },
  plugins: [extractText],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: extractText.extract({
          use: [
            {
              loader: "css-loader"
            }
          ]
        })
      }
    ]
  }
};
