import React, { Component } from 'react'
import {connect} from 'react-redux'
import styles from './styles.less'

class AuditTrail extends Component {
  componentWillMount() {
    console.log('AuditTrail:componentWillMount')
  }
  render() {
    return (
      <section className={styles.AuditTrail}>
        AuditTrail App
      </section>
    )
  }
}

const AuditTrailApp = connect(state => state)(AuditTrail)

export default AuditTrailApp
