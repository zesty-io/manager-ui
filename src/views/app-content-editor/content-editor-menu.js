import React, { Component } from 'react'
import {connect} from 'react-redux'
import {Switch, Redirect, Route} from 'react-router-dom'
import styles from './content-editor-menu.less'

class ContentEditorMenu extends Component {
  componentWillMount() {
    console.log('ContentEditorMenu:componentWillMount')
  }
  render() {
    return (
      <section className={styles.ContentEditorMenu}>
        <main className={styles.content}>

        </main>
      </section>
    )
  }
}

export default connect(state => state)(ContentEditorMenu)
