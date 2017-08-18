import React, { Component } from 'react'
import {connect} from 'react-redux'
import styles from './Forms.less'

class Forms extends Component {
  componentWillMount() {
    console.log('Forms:componentWillMount')
  }
  render() {
    return (
      <section className={styles.Forms}>
        Forms App
      </section>
    )
  }
}

const FormsApp = connect(state => state)(Forms)

export default FormsApp
