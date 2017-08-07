import React, { Component } from 'react'
import cx from 'classnames'
import styles from './CodeEditorMenu.less'

export default class CodeEditorMenu extends Component {
  componentWillMount() {
    console.log('CodeEditorMenu:componentWillMount')
  }
  render() {
    return (
      <section className={cx(styles.CodeEditorMenu, this.props.className)}>
        <header className={styles.head}>
          <Search placeholder="Search your code" />
        </header>
        <main className={styles.content}>
          <ul className={styles.binList}>
            <li className={styles.bin}>
              <h1 className={styles.title}>Templates</h1>
              <ul className={styles.groupList}>
                <li className={styles.group}>homepage.tmpl</li>
                <li className={styles.group}>articles.tmpl</li>
                <li className={styles.group}>about_us.tmpl</li>
              </ul>
            </li>
            <li className={styles.bin}>
              <h1 className={styles.title}>Resources</h1>
              <ul className={styles.groupList}>
                <li className={styles.group}>main.js</li>
                <li className={styles.group}>main.css</li>
                <li className={styles.group}>jquery.js</li>
              </ul>
            </li>
          </ul>
        </main>
      </section>
    )
  }
}
