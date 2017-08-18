import React, { Component } from 'react'
import {connect} from 'react-redux'
import styles from './Media.less'

import MediaMenu from './MediaMenu'

class Media extends Component {
  componentWillMount() {
    console.log('Media:componentWillMount')
  }
  render() {
    return (
      <section className={styles.Media}>
        <MediaMenu />
        <main className={styles.MediaView}>
          Media App
        </main>
      </section>
    )
  }
}

const MediaApp = connect(state => state)(Media)

export default MediaApp
