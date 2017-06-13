import React, { Component } from 'react'
import styles from './content-editor-view.less'

export default class ContentEditorView extends Component {
  componentWillMount() {
    console.log('ContentEditorView:componentWillMount')
  }
  render() {
    return (
      <section className={styles.ContentEditorView}>
        <header className={styles.ContentActions}>
          <Link>Back</Link>
          <ButtonGroup>
            <Button>Save</Button>
            <Button>Settings</Button>
          </ButtonGroup>
        </header>
        <main className={styles.content}>
        Content App
        </main>
      </section>
    )
  }
}
