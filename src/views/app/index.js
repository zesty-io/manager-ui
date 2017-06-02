import React, { Component } from 'react'
import {connect} from 'react-redux'
import {Switch, Redirect, Route} from 'react-router-dom'
import styles from './styles.less'

import GlobalMenu from '../../components/global-menu'
import ContentEditorView from '../content-editor'

class App extends Component {
  componentWillMount() {
    console.log('App:componentWillMount')
  }
  render() {
    return (
      <section className={styles.app}>
        <GlobalMenu />
        <ContentEditorView />
      </section>
    )
  }
}

const AppView = connect(state => state)(App)

export default AppView
