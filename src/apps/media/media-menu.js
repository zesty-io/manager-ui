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
          <Search placeholder="Search your media" />
        </header>
        <main className={styles.content}>
          <ButtonGroup>
            <Button className={styles.upload}>
              <i className="fa fa-plus" aria-hidden="true"></i>Upload File
            </Button>
          </ButtonGroup>
          <ul className={styles.binList}>
            <li className={styles.bin}>
              <h1 className={styles.title}>Site Media</h1>
              <ul className={styles.groupList}>
                <li className={styles.group}>Hero Banners</li>
                <li className={styles.group}>Product Shots
                  <ul className={styles.groupList}>
                    <li className={styles.group}>Cameras</li>
                    <li className={styles.group}>T.V. Sets</li>
                    <li className={styles.group}>Microphones</li>
                  </ul>
                </li>
                <li className={styles.group}>Influencers</li>
              </ul>
            </li>
            <li className={styles.bin}>
              <h1 className={styles.title}>Eco Media</h1>
              <ul className={styles.groupList}>
                <li className={styles.group}>Company Logos</li>
                <li className={styles.group}>Company Logos</li>
                <li className={styles.group}>Company Logos</li>
                <li className={styles.group}>Company Logos</li>
                <li className={styles.group}>Company Logos</li>
                <li className={styles.group}>Company Logos</li>
                <li className={styles.group}>Company Logos</li>
                <li className={styles.group}>Company Logos</li>
                <li className={styles.group}>Company Logos</li>
                <li className={styles.group}>Company Logos</li>
                <li className={styles.group}>Company Logos</li>
                <li className={styles.group}>Company Logos</li>
                <li className={styles.group}>Company Logos</li>
                <li className={styles.group}>Company Logos</li>
                <li className={styles.group}>Company Logos</li>
                <li className={styles.group}>Company Logos</li>
                <li className={styles.group}>Company Logos</li>
                <li className={styles.group}>Company Logos</li>
                <li className={styles.group}>Company Logos</li>
                <li className={styles.group}>Company Logos</li>
                <li className={styles.group}>Company Logos</li>
              </ul>
            </li>
          </ul>
        </main>
      </section>
    )
  }
}
