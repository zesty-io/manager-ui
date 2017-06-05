import React, { Component } from 'react'
import {connect} from 'react-redux'
import {Switch, Redirect, Route} from 'react-router-dom'
import styles from './styles.less'

class Media extends Component {
  componentWillMount() {
    console.log('Media:componentWillMount')
  }
  render() {
    return (
      <section className={styles.Media}>
        Media App
      </section>
    )
  }
}

const MediaApp = connect(state => state)(Media)

export default MediaApp
