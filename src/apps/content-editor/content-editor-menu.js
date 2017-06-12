import React, { Component } from 'react'
import cx from 'classnames'
import styles from './content-editor-menu.less'

export default class ContentEditorMenu extends Component {
  componentWillMount() {
    console.log('ContentEditorMenu:componentWillMount')
  }
  render() {
    return (
      <section className={cx(styles.ContentEditorMenu, this.props.className)}>
        <header>
          <button>filter</button>
          <input type="text" />
        </header>
        <main className={styles.content}>
          Content Editor Menu
        </main>
      </section>
    )
  }
}
