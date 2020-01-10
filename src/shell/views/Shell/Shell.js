import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Switch, Redirect, Route } from "react-router-dom";
import styles from "./Shell.less";

import GlobalSidebar from "shell/components/global-sidebar";
import GlobalTopbar from "shell/components/global-topbar";

import { fetchSiteSettings } from "shell/store/site";
// import { subMenuLoad } from "shell/store/ui/global-sub-menu";

export default connect(state => state)(function Shell(props) {
  useEffect(() => props.dispatch(fetchSiteSettings()), []);

  return (
    <section className={styles.app}>
      <GlobalSidebar {...props} />
      <main
        className={styles.AppLoader}
        // onMouseEnter={this.hideGlobalSubMenu.bind(this)}
      >
        <GlobalTopbar />
        <div className={styles.SubApp}>
          <Switch>
            <Route path="/content" component={ContentEditorApp} />
            <Route path="/media" component={MediaApp} />
            <Route path="/audit-trail" component={AuditTrailApp} />
            <Route path="/analytics" component={AnalyticsApp} />
            <Route path="/code" component={CodeEditorApp} />
            <Route path="/leads" component={LeadsApp} />
            <Route path="/schema" component={SchemaApp} />
            <Route path="/seo" component={SeoApp} />
            <Route path="/settings" component={SettingsApp} />

            {/*this.props.site.settings.products.map(product => {
              return <Route path={`/${product}`} component={ContentEditorApp} />
            })*/}

            <Redirect from="/" to="/content" />

            {/* TODO: handle no match */}
          </Switch>
        </div>
      </main>
    </section>
  );
});
