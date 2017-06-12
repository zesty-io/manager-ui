import React, { Component } from 'react'
import styles from './content-editor-view.less'

export default class ContentEditorView extends Component {
  componentWillMount() {
    console.log('ContentEditorView:componentWillMount')
  }
  render() {
    return (
      <section className={styles.ContentEditorView}>
        <header>
          <button>Back</button>
          <button>Save</button>
          <button>Settings</button>
        </header>
        <main className={styles.content}>
        Content App
        </main>
      </section>
    )
  }
}
