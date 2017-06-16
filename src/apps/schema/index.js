import React, { Component } from 'react'
import {connect} from 'react-redux'
import {Switch, Redirect, Route} from 'react-router-dom'
import styles from './styles.less'

class Schema extends Component {
  componentWillMount() {
    console.log('Schema:componentWillMount')
  }
  render() {
    return (
      <section className={styles.Schema}>
        Schema App
      </section>
    )
  }
}

const SchemaApp = connect(state => state)(Schema)

export default SchemaApp
