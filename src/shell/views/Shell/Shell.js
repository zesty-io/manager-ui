import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Switch, Redirect, Route } from "react-router-dom";
import styles from "./Shell.less";

import GlobalSidebar from "shell/components/global-sidebar";
import GlobalTopbar from "shell/components/global-topbar";

import { fetchInstance } from "shell/store/instance";
import { fetchProducts } from "shell/store/user";
// import { subMenuLoad } from "shell/store/ui/global-sub-menu";

export default function Shell() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchInstance());
    dispatch(fetchProducts());
  }, []);

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

            <Redirect from="/" to="/content" />

            {/* TODO: handle no match */}
          </Switch>
        </div>
      </main>
    </section>
  );
}
