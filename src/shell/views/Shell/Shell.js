import React from "react";
import { Switch, Redirect, Route } from "react-router-dom";

import GlobalSidebar from "shell/components/global-sidebar";
import GlobalTopbar from "shell/components/global-topbar";
import Welcome from "shell/components/welcome";
import Missing from "shell/components/missing";

// import { subMenuLoad } from "shell/store/ui/global-sub-menu";

import styles from "./Shell.less";
export default function Shell() {
  return (
    <section className={styles.Shell}>
      <GlobalSidebar />
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

            {/*this.props.user.products.map(product => {
              return <Route path={`/${product}`} component={ContentEditorApp} />
            })*/}

            {/* <Redirect from="/" to="/content" /> */}
            <Route exact path="/" component={Welcome} />
            <Route path="*" component={Missing} />
          </Switch>
        </div>
      </main>
    </section>
  );
}
