import React, { Component } from 'react'
import {connect} from 'react-redux'
import {Switch, Redirect, Route} from 'react-router-dom'
import styles from './content-editor-actions.less'

class ContentEditorActions extends Component {
  componentWillMount() {
    console.log('ContentEditorActions:componentWillMount')
  }
  render() {
    return (
      <section className={styles.ContentEditorActions}>
        <main className={styles.content}>

        </main>
      </section>
    )
  }
}

export default connect(state => state)(ContentEditorActions)
