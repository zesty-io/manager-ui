"use strict";
const webpack = require("webpack");
const path = require("path");
const HtmlWebpackTagsPlugin = require("html-webpack-tags-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanupStatsPlugin = require("./CleanupStatsPlugin");

const CONFIG = require("./app.config");

module.exports = {
  entry: {
    main: path.resolve(__dirname, "./index.js"),
    livePreview: path.resolve(__dirname, "../apps/live-preview/index.js")
  },
  output: {
    filename:
      process.env.NODE_ENV !== "development"
        ? "[name].[contenthash].js"
        : "[name].js",
    path: path.resolve(__dirname, "../../build/"),
    publicPath: "/"
  },
  devServer: {
    host: "0.0.0.0",
    compress: true,
    contentBase: path.resolve(__dirname, "../../build"),
    hot: true,
    disableHostCheck: true,
    historyApiFallback: true
  },
  devtool:
    process.env.NODE_ENV !== "development"
      ? "source-map"
      : "cheap-module-source-map",
  mode: process.env.NODE_ENV !== "development" ? "production" : "development",
  resolve: {
    symlinks: false, // Used for development with npm link
    alias: {
      "react-dom": "@hot-loader/react-dom",
      shell: path.resolve(__dirname, "../shell"),
      utility: path.resolve(__dirname, "../utility"),
      apps: path.resolve(__dirname, "../apps")
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      ignoreOrder: true,
      filename:
        process.env.NODE_ENV !== "development"
          ? "[name].[contenthash].css"
          : "[name].css"
    }),
    new CopyPlugin({
      patterns: ["public"]
    }),
    new HtmlWebpackPlugin({
      inject: false,
      chunks: ["main"],
      template: "src/index.html",
      filename: "index.html"
    }),

    new HtmlWebpackPlugin({
      chunks: ["livePreview"],
      template: "src/apps/live-preview/index.html",
      filename: "livePreview.html"
    }),

    new webpack.DefinePlugin({
      __CONFIG__: JSON.stringify(CONFIG)
    }),
    new CleanupStatsPlugin()
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: process.env.NODE_ENV === "development"
            }
          },
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
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: "babel-loader",
        query: {
          presets: ["@babel/preset-env", "@babel/preset-react"],
          plugins: [
            ["@babel/plugin-proposal-class-properties", { loose: false }],
            "@babel/plugin-transform-runtime", // https://babeljs.io/docs/en/babel-plugin-transform-runtime
            "react-hot-loader/babel"
          ]
        }
      }
    ]
  }
};
