import React, { Component } from 'react'
import {connect} from 'react-redux'
import {Switch, Redirect, Route} from 'react-router-dom'
import styles from './styles.less'

import ContentEditorMenu from './content-editor-menu'
import ContentEditorView from './content-editor-view'
import ContentEditorActions from './content-editor-actions'

class ContentEditor extends Component {
  constructor(props) {
    super(props)
    console.log('ContentEditor:constructor', this)
  }
  componentWillMount() {
    console.log('ContentEditor:componentWillMount', this)
  }
  render() {
    return (
      <section className={styles.ContentEditor}>
        <ContentEditorMenu sets={this.props.sets} />
        <ContentEditorView />
        <ContentEditorActions />
      </section>
    )
  }
}

export default connect(state => state)(ContentEditor)
