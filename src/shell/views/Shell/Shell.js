import React, { Component } from 'react'
import {connect} from 'react-redux'
import {Switch, Redirect, Route} from 'react-router-dom'
import styles from './Shell.less'

import GlobalSidebar from 'shell/components/global-sidebar'

import {fetchSiteSettings} from 'shell/store/site'
import {subMenuLoad} from 'shell/store/ui/global-sub-menu'

class Shell extends Component {
  componentWillMount() {
    console.log('Shell:componentWillMount', this)
    this.props.dispatch(fetchSiteSettings())
  }
  render() {
    return (
      <section className={styles.app}>
        <GlobalSidebar {...this.props} />
        <main className={styles.AppLoader} onMouseEnter={this.hideGlobalSubMenu.bind(this)}>
          <Switch>

            <Route path="/content" component={ContentEditorApp} />
            <Route path="/media" component={MediaApp} />
            <Route path="/audit-trail" component={AuditTrailApp} />
            <Route path="/analytics" component={AnalyticsApp} />
            <Route path="/code" component={CodeEditorApp} />
            <Route path="/forms" component={FormsApp} />
            <Route path="/leads" component={LeadsApp} />
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

export default connect(state => state)(Shell)
