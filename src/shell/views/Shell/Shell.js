import React, { Suspense, lazy } from "react";
import { Switch, Route } from "react-router-dom";
import { connect } from "react-redux";

import GlobalSidebar from "shell/components/global-sidebar";
import GlobalTabs from "shell/components/global-tabs";
import Welcome from "shell/components/welcome";
import Missing from "shell/components/missing";

import MediaApp from "apps/media/src";

import styles from "./Shell.less";

const ContentApp = lazy(() =>
  import(
    /* webpackChunkName: "content-editor" */
    /* webpackPrefetch: true */
    "apps/content-editor/src"
  )
);
const AuditTrailApp = lazy(() =>
  import(
    /* webpackChunkName: "audit-trail" */
    /* webpackPrefetch: true */
    "apps/audit-trail/src"
  )
);
const AnalyticsApp = lazy(() =>
  import(
    /* webpackChunkName: "analytics" */
    /* webpackPrefetch: true */
    "apps/analytics/src"
  )
);
const CodeApp = lazy(() =>
  import(
    /* webpackChunkName: "code" */
    /* webpackPrefetch: true */
    "apps/code-editor/src"
  )
);
const LeadsApp = lazy(() =>
  import(
    /* webpackChunkName: "leads" */
    /* webpackPrefetch: true */
    "apps/leads/src"
  )
);
const SchemaApp = lazy(() =>
  import(
    /* webpackChunkName: "schema" */
    /* webpackPrefetch: true */
    "apps/schema/src"
  )
);
const SeoApp = lazy(() =>
  import(
    /* webpackChunkName: "seo" */
    /* webpackPrefetch: true */
    "apps/seo/src"
  )
);
const SettingsApp = lazy(() =>
  import(
    /* webpackChunkName: "settings" */
    /* webpackPrefetch: true */
    "apps/settings/src"
  )
);

export default connect(state => {
  return {
    products: state.products
  };
})(
  React.memo(function Shell(props) {
    return (
      <section className={styles.Shell}>
        <GlobalSidebar />
        <main
          className={styles.AppLoader}
          // onMouseEnter={this.hideGlobalSubMenu.bind(this)}
        >
          <GlobalTabs />
          <div className={styles.SubApp}>
            <Suspense fallback={<div></div>}>
              <Switch>
                {props.products.map(product => {
                  switch (product) {
                    case "content":
                      return (
                        <Route
                          key={product}
                          path="/content"
                          component={ContentApp}
                        />
                      );
                    case "media":
                      return (
                        <Route
                          key={product}
                          path="/media"
                          component={MediaApp}
                        />
                      );
                    case "audit-trail":
                      return (
                        <Route
                          key={product}
                          path="/audit-trail"
                          component={AuditTrailApp}
                        />
                      );
                    case "analytics":
                      return (
                        <Route
                          key={product}
                          path="/analytics"
                          component={AnalyticsApp}
                        />
                      );
                    case "code":
                      return (
                        <Route key={product} path="/code" component={CodeApp} />
                      );
                    case "leads":
                      return (
                        <Route
                          key={product}
                          path="/leads"
                          component={LeadsApp}
                        />
                      );
                    case "schema":
                      return (
                        <Route
                          key={product}
                          path="/schema"
                          component={SchemaApp}
                        />
                      );
                    case "seo":
                      return (
                        <Route key={product} path="/seo" component={SeoApp} />
                      );
                    case "settings":
                      return (
                        <Route
                          key={product}
                          path="/settings"
                          component={SettingsApp}
                        />
                      );
                    default:
                      null;
                  }
                })}

                <Route exact path="/" component={Welcome} />
                <Route path="*" component={Missing} />
              </Switch>
            </Suspense>
          </div>
        </main>
      </section>
    );
  })
);
