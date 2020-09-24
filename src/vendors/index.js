import moment from "moment-timezone";
import cx from "classnames";
import React from "react";
import ReactDOM from "react-dom";
import * as ReactRedux from "react-redux";
import * as ReactRouter from "react-router";
import * as ReactRouterDOM from "react-router-dom";
import * as Redux from "redux";
import * as ReduxThunk from "redux-thunk";
import * as ReactMonacoEditor from "react-monaco-editor";

// Polyfills
// @see https://babeljs.io/docs/en/babel-polyfill/
import "core-js/stable";
import "regenerator-runtime/runtime";

// TODO refactor out
import * as riot from "riot";
import Clipboard from "clipboard";
import DnD from "./common/dnd";

window.cx = cx;
window.React = React;
window.ReactDOM = ReactDOM;
window.ReactRedux = ReactRedux;
window.ReactRouter = ReactRouter;
window.ReactRouterDOM = ReactRouterDOM;
window.Redux = Redux;
window.ReduxThunk = ReduxThunk;
window.moment = moment;

// TODO this dependency should be built into the code app bundle
// as it is code only used by that app and roles which have access to it
// as well as it's quite large so no point in having roles which can not load that
// app download it.
window.ReactMonacoEditor = ReactMonacoEditor;

// TODO refactor out
window.riot = riot;
window.DnD = DnD;
window.Clipboard = Clipboard;
