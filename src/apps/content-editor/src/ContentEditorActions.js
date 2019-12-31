import React, { Component } from "react";

import { Button } from "@zesty-io/core/Button";

import styles from "./ContentEditorActions.less";

export default class ContentEditorActions extends Component {
  componentWillMount() {
    console.log("ContentEditorActions:componentWillMount");
  }
  render() {
    return (
      <section className={styles.ContentEditorActions}>
        <main className={styles.content}>
          <Button>Publish</Button>
        </main>
      </section>
    );
  }
}
