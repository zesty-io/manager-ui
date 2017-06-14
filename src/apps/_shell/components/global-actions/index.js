import React, { Component } from 'react'
import styles from './styles.less'

export default class GlobalActions extends Component {
  componentWillMount() {
    console.log('GlobalActions:componentWillMount')
  }
  render() {
    return (
      <div className={styles.GlobalActions}>
        <i className="fa fa-comments-o" aria-hidden="true">
          <span className={styles.notificationCount}>3</span>
        </i>

        {/*<button title="Live Preview">
                  <i className="fa fa-clone" aria-hidden="true"></i>
                </button>*/}
      </div>
    )
  }
}
