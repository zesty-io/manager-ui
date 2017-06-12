import React, { Component } from 'react'
import {connect} from 'react-redux'
import {Switch, Redirect, Route} from 'react-router-dom'
import styles from './styles.less'

import ContentEditorMenu from './content-editor-menu'
import ContentEditorView from './content-editor-view'
import ContentEditorActions from './content-editor-actions'

class ContentEditor extends Component {
  componentWillMount() {
    console.log('ContentEditor:componentWillMount')
  }
  render() {
    return (
      <section className={styles.ContentEditor}>
        <ContentEditorMenu />
        <ContentEditorView />
        <ContentEditorActions />
      </section>
    )
  }
}

const ContentEditorApp = connect(state => state)(ContentEditor)

export default ContentEditorApp
