import React, { Component } from 'react'
import {connect} from 'react-redux'
import {Switch, Redirect, Route} from 'react-router-dom'
import styles from './styles.less'

class CodeEditor extends Component {
  componentWillMount() {
    console.log('CodeEditor:componentWillMount')
  }
  render() {
    return (
      <section className={styles.CodeEditor}>
        Code Editor
      </section>
    )
  }
}

const CodeEditorApp = connect(state => state)(CodeEditor)

export default CodeEditorApp
