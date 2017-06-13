import React, { Component } from 'react'
import cx from 'classnames'
import styles from './code-editor-menu.less'

export default class CodeEditorMenu extends Component {
  componentWillMount() {
    console.log('CodeEditorMenu:componentWillMount')
  }
  render() {
    return (
      <section className={cx(styles.CodeEditorMenu, this.props.className)}>
        <header className={styles.head}>
          <Search placeholder="Search your content" />
        </header>
        <main className={styles.content}>
          Code Editor Menu
        </main>
      </section>
    )
  }
}
