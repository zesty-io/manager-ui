"use strict";

var pjson = require("./package.json");

const webpack = require("webpack");
const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const extractLess = new ExtractTextPlugin({
  filename: "../../../build/bundle.shell.css"
  // disable: process.env.NODE_ENV === 'development'
});
const WebpackBar = require("webpackbar");

let CONFIG = {};
if (process.env.NODE_ENV === "PRODUCTION") {
  CONFIG = {
    VERSION: pjson.version,
    ENV: "production",
    API_ACCOUNTS: "https://accounts.api.zesty.io/v1",
    API_INSTANCE: ".api.zesty.io/v1/",
    SERVICE_AUTH: "https://svc.zesty.io/auth",
    SERVICE_EMAIL: "https://email.zesty.io/send",
    SERVICE_MEDIA_MANAGER: "",
    MANAGER_URL: ".manage.zesty.io",
    MANAGER_URL_PROTOCOL: "https://",
    PREVIEW_URL: "-dev.preview.zestyio.com",
    PREVIEW_URL_PROTOCOL: "https://",
    COOKIE_NAME: "APP_SID",
    COOKIE_DOMAIN: ".zesty.io"
  };
} else if (process.env.NODE_ENV === "STAGE") {
  CONFIG = {
    VERSION: pjson.version,
    ENV: "stage",
    API_ACCOUNTS: "https://accounts.stage-api.zesty.io/v1",
    API_INSTANCE: ".stage-api.zesty.io/v1/",
    SERVICE_AUTH: "https://stage-svc.zesty.io/auth",
    SERVICE_EMAIL: "https://email.zesty.io/send",
    SERVICE_MEDIA_MANAGER: "",
    MANAGER_URL: ".stage-manage.zesty.io",
    MANAGER_URL_PROTOCOL: "https://",
    PREVIEW_URL: "-dev.stage-preview.zestyio.com",
    PREVIEW_URL_PROTOCOL: "https://",
    COOKIE_NAME: "STAGE_APP_SID",
    COOKIE_DOMAIN: ".zesty.io"
  };
} else {
  CONFIG = {
    VERSION: pjson.version,
    ENV: "development",
    API_ACCOUNTS: "http://accounts.api.zesty.localdev:3022/v1",
    API_INSTANCE: ".api.zesty.localdev:3023/v1/",
    SERVICE_AUTH: "http://svc.zesty.localdev:3011/auth",
    SERVICE_EMAIL: "",
    SERVICE_MEDIA_MANAGER: "",
    MANAGER_URL: ".manage.zesty.localdev:3020",
    MANAGER_URL_PROTOCOL: "http://",
    PREVIEW_URL: "-dev.preview.zestyio.localdev:3020",
    PREVIEW_URL_PROTOCOL: "http://",
    COOKIE_NAME: "DEV_APP_SID",
    COOKIE_DOMAIN: ".zesty.localdev"
  };
}

module.exports = {
  entry: "./index.js",
  // context: path.resolve(__dirname, "src"),
  devtool: "cheap-module-source-map",
  mode: process.env.NODE_ENV || "development",
  output: {
    filename: "../../../build/bundle.shell.js"
  },
  resolve: {
    symlinks: false, // Used for development with npm link
    alias: {
      shell: path.resolve(__dirname, "../shell"),
      utility: path.resolve(__dirname, "../utility"),
      apps: path.resolve(__dirname, "../apps")
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
  plugins: [
    extractLess,

    // Inject app config into bundle
    new webpack.DefinePlugin({
      __CONFIG__: JSON.stringify(CONFIG)
    }),
    new webpack.optimize.ModuleConcatenationPlugin()
    // new WebpackBar({
    //   name: "shell"
    // })
  ],
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
