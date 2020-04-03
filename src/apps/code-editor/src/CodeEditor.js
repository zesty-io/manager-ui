import React, { Component } from "react";
import { connect } from "react-redux";
import { Switch, Redirect, Route } from "react-router-dom";
import styles from "./CodeEditor.less";

import CodeEditorMenu from "./CodeEditorMenu";

class CodeEditor extends Component {
  render() {
    return (
      <section className={styles.CodeEditor}>
        <CodeEditorMenu />
        <main className={styles.CodeEditorView}>Code Editor</main>
      </section>
    );
  }
}

const CodeApp = connect(state => state)(CodeEditor);

export default CodeApp;
