"use strict";

var pjson = require("./package.json");

const webpack = require("webpack");
const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const extractLess = new ExtractTextPlugin({
  filename: "../../../build/bundle.shell.css"
  // disable: process.env.NODE_ENV === 'development'
});

let CONFIG = {};
if (process.env.NODE_ENV === "production") {
  CONFIG = {
    VERSION: pjson.version,
    ENV: "production",

    API_ACCOUNTS: "//accounts.api.zesty.io/v1",
    API_INSTANCE: ".api.zesty.io/v1",

    SERVICE_AUTH: "https://auth.api.zesty.io",
    SERVICE_EMAIL: "https://email.zesty.io/send",
    SERVICE_MEDIA_MANAGER: "https://svc.zesty.io/media-manager-service",
    SERVICE_MEDIA_RESOLVER: "https://svc.zesty.io/media-resolver-service",
    SERVICE_MEDIA_STORAGE: "https://svc.zesty.io/media-storage-service",
    SERVICE_MEDIA_MODIFY: "https://svc.zesty.io/media-modify-service",
    SERVICE_REDIS_GATEWAY: "https://cache.zesty.io",
    SERVICE_GOOGLE_ANALYTICS_AUTH: "",
    SERVICE_GOOGLE_ANALYTICS_READ: "",

    URL_MANAGER: ".manager.zesty.io",
    URL_MANAGER_PROTOCOL: "https://",
    URL_PREVIEW: "-dev.preview.zesty.io",
    URL_PREVIEW_PROTOCOL: "https://",
    URL_ACCOUNTS: "",

    COOKIE_NAME: "APP_SID",
    COOKIE_DOMAIN: ".zesty.io",

    GOOGLE_WEB_FONTS_KEY: "AIzaSyD075qEo9IXa4BPsSZ_YJGWlTw34T51kuk"
  };
} else if (process.env.NODE_ENV === "stage") {
  CONFIG = {
    VERSION: pjson.version,
    ENV: "stage",

    API_ACCOUNTS: "//accounts.api.stage.zesty.io/v1",
    API_INSTANCE: ".api.stage.zesty.io/v1",

    SERVICE_AUTH: "https://auth.api.stage.zesty.io",
    SERVICE_EMAIL: "https://email.zesty.io/send",
    SERVICE_MEDIA_MANAGER: "https://stage-svc.zesty.io/media-manager-service",
    SERVICE_MEDIA_RESOLVER: "https://stage-svc.zesty.io/media-resolver-service",
    SERVICE_MEDIA_STORAGE: "https://stage-svc.zesty.io/media-storage-service",
    SERVICE_MEDIA_MODIFY: "https://stage-svc.zesty.io/media-modify-service",
    SERVICE_REDIS_GATEWAY: "https://cache.stage.zesty.io",
    SERVICE_GOOGLE_ANALYTICS_AUTH:
      "https://us-central1-zesty-stage.cloudfunctions.net/authenticateGoogleAnalytics",
    SERVICE_GOOGLE_ANALYTICS_READ:
      "https://us-central1-zesty-stage.cloudfunctions.net/googleAnalyticsGetPageViews",

    URL_MANAGER: ".manager.stage.zesty.io",
    URL_MANAGER_PROTOCOL: "https://",
    URL_PREVIEW: "-dev.preview.stage.zesty.io",
    URL_PREVIEW_PROTOCOL: "https://",
    URL_ACCOUNTS: "",

    COOKIE_NAME: "STAGE_APP_SID",
    COOKIE_DOMAIN: ".zesty.io",

    GOOGLE_WEB_FONTS_KEY: "AIzaSyD075qEo9IXa4BPsSZ_YJGWlTw34T51kuk"
  };
} else if (process.env.NODE_ENV === "development") {
  CONFIG = {
    VERSION: pjson.version,
    ENV: "development",

    API_ACCOUNTS: "https://accounts.api.dev.zesty.io/v1",
    API_INSTANCE: ".api.dev.zesty.io/v1",
    API_INSTANCE_PROTOCOL: "https://",

    SERVICE_AUTH: "https://auth.api.dev.zesty.io",
    SERVICE_EMAIL: "https://email.zesty.io/send",
    SERVICE_MEDIA_MANAGER: "https://dev-svc.zesty.io/media-manager-service",
    SERVICE_MEDIA_RESOLVER: "https://dev-svc.zesty.io/media-resolver-service",
    SERVICE_MEDIA_STORAGE: "https://dev-svc.zesty.io/media-storage-service",
    SERVICE_MEDIA_MODIFY: "https://dev-svc.zesty.io/media-modify-service",
    SERVICE_REDIS_GATEWAY: "https://cache.dev.zesty.io",
    SERVICE_GOOGLE_ANALYTICS_AUTH:
      "https://us-central1-zesty-dev.cloudfunctions.net/authenticateGoogleAnalytics",
    SERVICE_GOOGLE_ANALYTICS_READ:
      "https://us-central1-zesty-dev.cloudfunctions.net/googleAnalyticsGetPageViews",

    URL_MANAGER: ".manager.dev.zesty.io",
    URL_MANAGER_PROTOCOL: "https://",
    URL_PREVIEW: "-dev.preview.dev.zesty.io",
    URL_PREVIEW_PROTOCOL: "https://",
    URL_ACCOUNTS: "",

    COOKIE_NAME: "DEV_APP_SID",
    COOKIE_DOMAIN: ".zesty.io"
  };
} else {
  CONFIG = {
    VERSION: pjson.version,
    ENV: "local",

    API_ACCOUNTS: "//accounts.api.zesty.localdev:3022/v1",
    API_INSTANCE: ".api.zesty.localdev:3023/v1",
    API_INSTANCE_PROTOCOL: "http://",

    SERVICE_AUTH: "http://auth.api.zesty.localdev:3011",
    SERVICE_EMAIL: "",
    SERVICE_MEDIA_MANAGER:
      "http://svc.zesty.localdev:3005/media-manager-service",
    SERVICE_MEDIA_RESOLVER:
      "http://svc.zesty.localdev:3007/media-resolver-service",
    SERVICE_MEDIA_STORAGE:
      "http://svc.zesty.localdev:3008/media-storage-service",
    SERVICE_REDIS_GATEWAY: "http://redis-gateway.zesty.localdev:3025",
    SERVICE_GOOGLE_ANALYTICS_AUTH:
      "https://us-central1-zesty-dev.cloudfunctions.net/authenticateGoogleAnalytics",
    SERVICE_GOOGLE_ANALYTICS_READ:
      "https://us-central1-zesty-dev.cloudfunctions.net/googleAnalyticsGetPageViews",

    URL_MANAGER: ".manager.zesty.localdev:3020",
    URL_MANAGER_PROTOCOL: "http://",
    URL_PREVIEW: "-dev.preview.zesty.localdev:3016",
    URL_PREVIEW_PROTOCOL: "http://",
    URL_ACCOUNTS: "http://accounts.zesty.localdev:3100",

    COOKIE_NAME: "DEV_APP_SID",
    COOKIE_DOMAIN: ".zesty.localdev",

    GOOGLE_WEB_FONTS_KEY: "AIzaSyD075qEo9IXa4BPsSZ_YJGWlTw34T51kuk"
  };
}

module.exports = {
  entry: "./index.js",
  // context: path.resolve(__dirname, "src"),
  devtool: "cheap-module-source-map",
  mode: process.env.ENV_MODE || "development",
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
    riot: "riot",
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
