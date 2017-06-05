import React, { Component } from 'react'
import {connect} from 'react-redux'
import {Switch, Redirect, Route} from 'react-router-dom'
import styles from './styles.less'

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
