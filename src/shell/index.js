import React, { Component } from 'react'
import {connect} from 'react-redux'
import {Switch, Redirect, Route} from 'react-router-dom'
import styles from './styles.less'

import GlobalSidebar from './components/global-sidebar'
import ContentEditorApp from '../apps/content-editor'
import MediaApp from '../apps/media'
import CodeEditorApp from '../apps/code-editor'
import SeoApp from '../apps/seo'
import LeadsApp from '../apps/leads'
import AnalyticsApp from '../apps/analytics'
import SocialApp from '../apps/social'
import FormsApp from '../apps/forms'
import SchemaApp from '../apps/schema'
import SettingsApp from '../apps/settings'
// import AuditTrailApp from '../audit-trail'

import {fetchSiteSettings} from './store/site'
import {subMenuLoad} from './store/ui/global-sub-menu'

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
