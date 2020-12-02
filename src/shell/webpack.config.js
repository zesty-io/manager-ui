"use strict";

const webpack = require("webpack");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const CleanupStatsPlugin = require("./CleanupStatsPlugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

const CONFIG = require("./app.config");

module.exports = (env) => {
  console.log("SELECTED", env);
  console.log("CONFIG", CONFIG[env.NODE_ENV]);

  return {
    devServer: {
      host: "0.0.0.0",
      compress: true,
      contentBase: path.resolve(__dirname, "../../build"),
      hot: true,
      disableHostCheck: true,
      historyApiFallback: true,
    },
    devtool:
      env.NODE_ENV !== "development" ? "source-map" : "cheap-module-source-map",
    mode: env.NODE_ENV !== "development" ? "production" : "development",
    entry: {
      main: path.resolve(__dirname, "./index.js"),
      activePreview: path.resolve(__dirname, "../apps/active-preview/index.js"),
    },
    output: {
      filename:
        env.NODE_ENV !== "development" ? "[name].[hash].js" : "[name].js",
      path: path.resolve(__dirname, "../../build/"),
      publicPath: "/",
    },
    resolve: {
      symlinks: false, // Used for development with npm link
      alias: {
        "react-dom": "@hot-loader/react-dom",
        shell: path.resolve(__dirname, "../shell"),
        utility: path.resolve(__dirname, "../utility"),
        apps: path.resolve(__dirname, "../apps"),
      },
      fallback: {
        // csv-parse needs these to function
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),
        util: require.resolve("util/"),
      },
    },
    plugins: [
      // new BundleAnalyzerPlugin(),

      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      }),

      new MiniCssExtractPlugin({
        ignoreOrder: true,
        filename:
          env.NODE_ENV !== "development" ? "[name].[hash].css" : "[name].css",
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
        __CONFIG__: JSON.stringify(CONFIG[env.NODE_ENV]),
      }),

      new CleanupStatsPlugin(),
    ],
    optimization: {
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
        // Used by monaco
        {
          test: /\.ttf$/,
          use: ["file-loader"],
        },

        {
          test: /\.less$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: "css-loader",
              options: {
                modules: {
                  localIdentName: "[local]--[hash:base64:5]",
                },
              },
            },
            {
              loader: "less-loader",
            },
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
              presets: ["@babel/preset-env", "@babel/preset-react"],
              plugins: [
                ["@babel/plugin-proposal-class-properties", { loose: false }],
                "@babel/plugin-transform-runtime", // https://babeljs.io/docs/en/babel-plugin-transform-runtime
                "react-hot-loader/babel",
              ],
            },
          },
        },
      ],
    },
  };
};
