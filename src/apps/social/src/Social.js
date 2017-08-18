import React, { Component } from 'react'
import {connect} from 'react-redux'
import styles from './Social.less'

class Social extends Component {
  componentWillMount() {
    console.log('Social:componentWillMount')
  }
  render() {
    return (
      <section className={styles.Social}>
        Social App
      </section>
    )
  }
}

const SocialApp = connect(state => state)(Social)

export default SocialApp
