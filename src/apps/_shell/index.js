import React, { Component } from 'react'
import {connect} from 'react-redux'
import {Switch, Redirect, Route} from 'react-router-dom'
import styles from './styles.less'

import GlobalSidebar from './components/global-sidebar'
import ContentEditorApp from '../content-editor'
import MediaApp from '../media'
import CodeEditorApp from '../code-editor'
import SeoApp from '../seo'
import LeadsApp from '../leads'
import AnalyticsApp from '../analytics'
import SocialApp from '../social'
import FormsApp from '../forms'
import SchemaApp from '../schema'
import SettingsApp from '../settings'
// import AuditTrailApp from '../audit-trail'

import {fetchSiteSettings} from './store/site'
import {subMenuLoad} from './store/global-sub-menu'

class App extends Component {
  componentWillMount() {
    console.log('App:componentWillMount', this)
    this.props.dispatch(fetchSiteSettings())
  }
  render() {
    return (
      <section className={styles.app}>
        <GlobalSidebar {...this.props} />
        <main className={styles.AppLoader} onMouseEnter={this.hideGlobalSubMenu.bind(this)}>
          <Switch>

            <Route path="/analytics" component={AnalyticsApp} />
            <Route path="/audit-trail" component={AuditTrailApp} />
            <Route path="/content" component={ContentEditorApp} />
            <Route path="/code" component={CodeEditorApp} />
            <Route path="/forms" component={FormsApp} />
            <Route path="/leads" component={LeadsApp} />
            <Route path="/media" component={MediaApp} />
            <Route path="/schema" component={SchemaApp} />
            <Route path="/seo" component={SeoApp} />
            <Route path="/settings" component={SettingsApp} />
            <Route path="/social" component={SocialApp} />

            {/*this.props.site.settings.products.map(product => {
              return <Route path={`/${product}`} component={ContentEditorApp} />
            })*/}

            <Redirect from='/' to='/content'/>
            {/* TODO: handle no match */}
          </Switch>
        </main>
      </section>
    )
  }
  hideGlobalSubMenu() {
    this.props.dispatch(subMenuLoad(''))
  }
}

const AppShell = connect(state => state)(App)

export default AppShell
