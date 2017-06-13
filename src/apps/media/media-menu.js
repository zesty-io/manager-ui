import React, { Component } from 'react'
import cx from 'classnames'
import styles from './media-menu.less'

export default class MediaMenu extends Component {
  componentWillMount() {
    console.log('MediaMenu:componentWillMount')
  }
  render() {
    return (
      <section className={cx(styles.MediaMenu, this.props.className)}>
        <header className={styles.head}>
          <Search placeholder="Search your content" />
        </header>
        <main className={styles.content}>
          Media Menu
        </main>
      </section>
    )
  }
}
