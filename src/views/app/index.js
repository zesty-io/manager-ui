import React, { Component } from 'react'
import {connect} from 'react-redux'
import {Switch, Redirect, Route} from 'react-router-dom'
import styles from './styles.less'

import GlobalAccount from '../../components/global-account'
import GlobalMenu from '../../components/global-menu'
import GlobalActions from '../../components/global-actions'

import ContentEditorApp from '../app-content-editor'
import MediaApp from '../app-media'
import CodeEditorApp from '../app-code-editor'

class App extends Component {
  componentWillMount() {
    console.log('App:componentWillMount')
  }
  render() {
    return (
      <section className={styles.app}>
        <aside className={styles.GlobalSidebar}>
          <GlobalAccount />
          <GlobalMenu />
          <GlobalActions />
        </aside>
        <main className={styles.AppLoader}>
          <Switch>
            <Route path="/content" component={ContentEditorApp} />
            <Route path="/media" component={MediaApp} />
            <Route path="/code" component={CodeEditorApp} />
            <Route path="/" component={ContentEditorApp} />
            {/*<Redirect from='/' to='/content'/>*/}
            {/* TODO: handle no match */}
          </Switch>
        </main>
      </section>
    )
  }
}

const AppView = connect(state => state)(App)

export default AppView
