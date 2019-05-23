"use strict";

const webpack = require("webpack");
const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const extractLess = new ExtractTextPlugin({
  filename: "../../../build/bundle.shell.css"
  // disable: process.env.NODE_ENV === 'development'
});
const WebpackBar = require("webpackbar");

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
                modules: true,
                localIdentName: "[local]--[hash:base64:5]"
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

// 'use strict'

// const webpack = require('webpack')
// const ExtractTextPlugin = require("extract-text-webpack-plugin");

// const env = new webpack.EnvironmentPlugin(['NODE_ENV'])
// const extractLess = new ExtractTextPlugin({
//     filename: "../../build/bundle.shell.css",
//     disable: process.env.NODE_ENV === "development"
// })

// module.exports = {
//   entry: './index.js',
//   devtool: 'cheap-module-source-map',
//   externals: {
//     'react': 'React',
//     'react-dom': 'ReactDOM',
//     'react-redux': 'ReactRedux',
//     'react-router': 'ReactRouter',
//     'react-router-dom': 'ReactRouterDOM',
//     'redux': 'Redux',
//     'redux-thunk': 'ReduxThunk'
//   },
//   output: {
//     filename: '../../build/bundle.shell.js'
//   },
//   resolve: {
//     modules: ['node_modules', 'src'],
//     extensions: ['.js', '.jsx'],
//   },
//   plugins: [env, extractLess],
//   module: {
//     rules: [
//       {
//         test: /\.less$/,
//         use: extractLess.extract({
//           use: [{
//             loader: 'css-loader',
//             options: {
//               modules: true,
//               localIdentName: '[local]--[hash:base64:5]'
//             }
//           }, {
//             loader: 'less-loader'
//           }],
//           fallback: 'style-loader'
//         })
//       },
//       {
//         test: /\.js$/,
//         exclude: /(node_modules)/,
//         loader: 'babel-loader',
//         query: {
//           presets: ['react', 'es2015', 'stage-2']
//         }
//       }
//     ]
//   }
// }
