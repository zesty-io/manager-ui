import React, { Component } from 'react'
import {connect} from 'react-redux'
import styles from './styles.less'

class Leads extends Component {
  componentWillMount() {
    console.log('Leads:componentWillMount')
  }
  render() {
    return (
      <section className={styles.Leads}>
        Leads App
      </section>
    )
  }
}

const LeadsApp = connect(state => state)(Leads)

export default LeadsApp
