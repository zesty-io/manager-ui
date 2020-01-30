"use strict";

const webpack = require("webpack");
const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const extractLess = new ExtractTextPlugin({
  filename: "../../../../build/bundle.media-app.css"
  // disable: process.env.NODE_ENV === 'development'
});

module.exports = {
  entry: "./index.js",
  context: path.resolve(__dirname, "src"),
  devtool: "cheap-module-source-map",
  mode: process.env.NODE_ENV || "development",
  output: {
    filename: "../../../../build/bundle.media-app.js"
  },
  resolve: {
    symlinks: false, // Used for development with npm link
    alias: {
      shell: path.resolve(__dirname, "../../shell/"),
      utility: path.resolve(__dirname, "../../utility/"),
      components: path.resolve(__dirname, "src/components/"),
      store: path.resolve(__dirname, "src/store/")
    }
  },
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
    "react-router": "ReactRouter",
    "react-router-dom": "ReactRouterDOM",
    "react-redux": "ReactRedux",
    redux: "Redux",
    "redux-thunk": "ReduxThunk",
    moment: "moment",
    "moment-timezone": "moment"
  },
  plugins: [extractLess, new webpack.optimize.ModuleConcatenationPlugin()],
  module: {
    rules: [
      {
        test: /\.less$/,
        use: extractLess.extract({
          use: [
            {
              loader: "css-loader",
              options: {
                modules: {
                  localIdentName: "[local]--[hash:base64:5]"
                }
              }
            },
            {
              loader: "less-loader"
            }
          ]
        })
      },
      {
        test: /\.css$/,
        use: extractLess.extract({
          use: [
            {
              loader: "css-loader"
            }
          ]
        })
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: "babel-loader",
        query: {
          presets: ["@babel/preset-env", "@babel/preset-react"],
          plugins: [
            ["@babel/plugin-proposal-class-properties", { loose: false }]
          ]
        }
      }
    ]
  }
};
