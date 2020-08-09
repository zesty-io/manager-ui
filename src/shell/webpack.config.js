const webpack = require("webpack");
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanupStatsPlugin = require("./CleanupStatsPlugin");

const CONFIG = require("./app.config");

module.exports = {
  entry: path.resolve(__dirname, "./index.js"),
  output: {
    filename:
      process.env.NODE_ENV !== "production" ? "[name].js" : "[name].[hash].js",
    path: path.resolve(__dirname, "../../build/"),
    publicPath: "/"
  },
  devServer: {
    compress: true,
    contentBase: path.resolve(__dirname, "../../build"),
    hot: true,
    disableHostCheck: true,
    historyApiFallback: true
  },
  devtool: "cheap-module-source-map",
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
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
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      ignoreOrder: true,
      filename:
        process.env.NODE_ENV !== "production"
          ? "[name].css"
          : "[name].[hash].css"
    }),
    new CopyPlugin({
      patterns: ["public"]
    }),
    new HtmlWebpackPlugin({
      template: "src/index.html"
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
              hmr: process.env.NODE_ENV !== "production"
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
            "@babel/plugin-transform-runtime",
            "react-hot-loader/babel"
          ]
        }
      }
    ]
  }
};
