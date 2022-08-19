"use strict";

const path = require("path");
const process = require("process");
const mkdirp = require("mkdirp");

const webpack = require("webpack");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const MomentLocalesPlugin = require("moment-locales-webpack-plugin");
const SentryCliPlugin = require("@sentry/webpack-plugin");

const release = require("../../etc/release");
const CONFIG = require("./app.config");

module.exports = async (env) => {
  // create build/ dir
  mkdirp.sync(path.resolve(__dirname, "../../build/"));
  // Attach release info onto config to connect with bug tracking software
  CONFIG[process.env.NODE_ENV].build = await release(process.env.NODE_ENV);

  console.log("CONFIG", CONFIG[process.env.NODE_ENV]);

  return {
    snapshot: {
      managedPaths: [],
    },
    cache:
      process.env.NODE_ENV === "development"
        ? // enables 5 second build times from cache instead of 30 seconds
          {
            type: "filesystem",
            buildDependencies: {
              config: [__filename],
            },
          }
        : false,
    devServer: {
      host: "0.0.0.0",
      compress: true,
      contentBase: path.resolve(__dirname, "../../build"),
      disableHostCheck: true,
      historyApiFallback: {
        rewrites: [
          { from: /^\/active-preview/, to: "/activePreview.html" },
          { from: /./, to: "/index.html" },
        ],
      },
    },
    devtool:
      process.env.NODE_ENV !== "development"
        ? "source-map"
        : "cheap-module-source-map",
    mode: process.env.NODE_ENV !== "development" ? "production" : "development",
    entry: {
      main: path.resolve(__dirname, "./index.js"),
      activePreview: path.resolve(__dirname, "../apps/active-preview/index.js"),
    },
    output: {
      filename:
        process.env.NODE_ENV !== "development"
          ? "[name].[contenthash].js"
          : "[name].js",
      path: path.resolve(__dirname, "../../build/"),
      publicPath: "/",
    },
    resolve: {
      symlinks: false, // Used for development with npm link
      alias: {
        shell: path.resolve(__dirname, "../shell"),
        utility: path.resolve(__dirname, "../utility"),
        apps: path.resolve(__dirname, "../apps"),
      },
      extensions: [".ts", ".tsx", ".js"],
    },
    plugins: [
      new SentryCliPlugin({
        include: "./build",
        ignoreFile: ".sentrycliignore",
        ignore: ["node_modules", "webpack.config.js"],
        configFile: "sentry.properties",
        release: CONFIG[process.env.NODE_ENV].build.data.gitCommit,
        project: "manager-ui",
        org: "zestyio",
      }),
      new NodePolyfillPlugin({
        excludeAliases: ["console"],
      }),
      new MomentLocalesPlugin(),
      new MiniCssExtractPlugin({
        ignoreOrder: true,
        filename:
          process.env.NODE_ENV !== "development"
            ? "[name].[contenthash].css"
            : "[name].css",
      }),

      new MonacoWebpackPlugin({
        // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
        languages: [
          // "coffee",
          "css",
          // "dockerfile",
          // "handlebars",
          "html",
          "javascript",
          "json",
          "less",
          "markdown",
          // "pug",
          "scss",
          "typescript",
          "xml",
          // "yaml"
        ],
        features: [
          "bracketMatching",
          "!caretOperations",
          "!clipboard",
          "!codeAction",
          "!codelens",
          "!colorDetector",
          "comment",
          "contextmenu",
          "coreCommands",
          "!cursorUndo",
          "!dnd",
          "find",
          "folding",
          "!fontZoom",
          "format",
          "!goToDefinitionCommands",
          "!goToDefinitionMouse",
          "gotoError",
          "gotoLine",
          "!hover",
          "!inPlaceReplace",
          "!inspectTokens",
          "!iPadShowKeyboard",
          "linesOperations",
          "!links",
          "multicursor",
          "parameterHints",
          "!quickCommand",
          "!quickOutline",
          "!referenceSearch",
          "!rename",
          "smartSelect",
          "!snippets",
          "suggest",
          "toggleHighContrast",
          "!toggleTabFocusMode",
          "!transpose",
          "wordHighlighter",
          "wordOperations",
          "wordPartOperations",
        ],
      }),

      new CopyPlugin({
        patterns: ["public"],
      }),

      new HtmlWebpackPlugin({
        inject: false,
        chunks: ["main"],
        template: "src/index.html",
        filename: "index.html",
      }),

      new HtmlWebpackPlugin({
        chunks: ["activePreview"],
        template: "src/apps/active-preview/index.html",
        filename: "activePreview.html",
      }),

      // Inject app config into bundle based on env
      new webpack.DefinePlugin({
        __CONFIG__: JSON.stringify(CONFIG[process.env.NODE_ENV]),
      }),
    ],
    optimization: {
      moduleIds: "deterministic",
      runtimeChunk: "single",
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      },
    },
    module: {
      rules: [
        {
          test: /\.ts$|tsx/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.less$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                modules: {
                  localIdentName: "[local]--[contenthash:base64:5]",
                },
              },
            },
            "less-loader",
          ],
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: "babel-loader",
            options: {
              cacheCompression: false,
              cacheDirectory: true,
              presets: [
                "@babel/preset-env",
                ["@babel/preset-react", { runtime: "automatic" }],
              ],
              plugins: ["@babel/plugin-transform-runtime"],
            },
          },
        },
        {
          test: /\.ttf$/,
          use: ["file-loader"],
        },
      ],
    },
  };
};
