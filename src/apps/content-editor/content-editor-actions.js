import React, { Component } from 'react'
import styles from './content-editor-actions.less'

export default class ContentEditorActions extends Component {
  componentWillMount() {
    console.log('ContentEditorActions:componentWillMount')
  }
  render() {
    return (
      <section className={styles.ContentEditorActions}>
        <main className={styles.content}>
          <Button>Publish</Button>
        </main>
      </section>
    )
  }
}
