import React, { Component } from 'react'
import {connect} from 'react-redux'
import {Switch, Redirect, Route} from 'react-router-dom'
import styles from './styles.less'

class Settings extends Component {
  componentWillMount() {
    console.log('Settings:componentWillMount')
  }
  render() {
    return (
      <section className={styles.Settings}>
        Settings App
      </section>
    )
  }
}

const SettingsApp = connect(state => state)(Settings)

export default SettingsApp
