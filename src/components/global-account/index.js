import React, { Component } from 'react'
import styles from './styles.less'

export default class GlobalAccount extends Component {
  componentWillMount() {
    console.log('GlobalAccount:componentWillMount')
  }
  render() {
    return (
      <div className={styles.GlobalAccount}>
        <i className="fa fa-user-circle-o" aria-hidden="true"></i>
      </div>
    )
  }
}
