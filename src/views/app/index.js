import React, { Component } from 'react'
import {connect} from 'react-redux'
import {Switch, Redirect, Route} from 'react-router-dom'
import styles from './styles.less'

import GlobalSidebar from '../../components/global-sidebar'

import ContentEditorApp from '../app-content-editor'
import MediaApp from '../app-media'
import CodeEditorApp from '../app-code-editor'
import SeoApp from '../app-seo'
import LeadsApp from '../app-leads'
import AnalyticsApp from '../app-analytics'
import SocialApp from '../app-social'
import FormsApp from '../app-forms'
import AuditTrailApp from '../app-audit-trail'

class App extends Component {
  componentWillMount() {
    console.log('App:componentWillMount')
  }
  render() {
    return (
      <section className={styles.app}>
        <GlobalSidebar {...this.props} />
        <main className={styles.AppLoader}>
          <Switch>
            <Route path="/content" component={ContentEditorApp} />
            <Route path="/media" component={MediaApp} />
            <Route path="/code" component={CodeEditorApp} />
            <Route path="/seo" component={SeoApp} />
            <Route path="/leads" component={LeadsApp} />
            <Route path="/analytics" component={AnalyticsApp} />
            <Route path="/social" component={SocialApp} />
            <Route path="/forms" component={FormsApp} />
            <Route path="/audit-trail" component={AuditTrailApp} />
            <Redirect from='/' to='/content'/>
            {/* TODO: handle no match */}
          </Switch>
        </main>
      </section>
    )
  }
}

const AppView = connect(state => state)(App)

export default AppView
