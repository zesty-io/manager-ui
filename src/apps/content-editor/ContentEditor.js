import React, { Component } from 'react'
import {connect} from 'react-redux'
import {Switch, Redirect, Route} from 'react-router-dom'
import styles from './ContentEditor.less'

import ContentEditorMenu from './ContentEditorMenu'
import ContentEditorView from './ContentEditorView'
import ContentEditorActions from './ContentEditorActions'

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
