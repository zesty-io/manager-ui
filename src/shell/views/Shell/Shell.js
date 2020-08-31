import React, { Suspense, lazy, useEffect } from "react";
import { Switch, Route } from "react-router-dom";
import { connect } from "react-redux";

import AppError from "shell/components/AppError";
import GlobalSidebar from "shell/components/global-sidebar";
import GlobalTabs from "shell/components/global-tabs";
import Welcome from "shell/components/welcome";
import Missing from "shell/components/missing";

import MediaApp from "apps/media/src";

import styles from "./Shell.less";

// We use React.lazy and React.Suspense allow dynamic imports for Route
// components. webpack hints are required to enable prefetching (which
// loads sub-app bundles in background during idle time)
// see: https://webpack.js.org/guides/code-splitting/#dynamic-imports
// see: https://reactjs.org/docs/code-splitting.html#route-based-code-splitting

export default connect(state => {
  return {
    products: state.products
  };
})(
  React.memo(function Shell(props) {
    useEffect(() => {
      zesty.trigger("locationChange");
    }, [props.location]);
    return (
      <section className={styles.Shell}>
        <GlobalSidebar />
        <main
          className={styles.AppLoader}
          // onMouseEnter={this.hideGlobalSubMenu.bind(this)}
        >
          <GlobalTabs />
          <div className={styles.SubApp}>
            <AppError>
              <Suspense fallback={<div></div>}>
                <Switch>
                  {props.products.map(product => {
                    switch (product) {
                      case "content":
                        const ContentApp = lazy(() =>
                          import(
                            /* webpackChunkName: "content-editor" */
                            /* webpackPrefetch: true */
                            "apps/content-editor/src"
                          )
                        );
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
                        const AuditTrailApp = lazy(() =>
                          import(
                            /* webpackChunkName: "audit-trail" */
                            /* webpackPrefetch: true */
                            "apps/audit-trail/src"
                          )
                        );
                        return (
                          <Route
                            key={product}
                            path="/audit-trail"
                            component={AuditTrailApp}
                          />
                        );
                      case "analytics":
                        const AnalyticsApp = lazy(() =>
                          import(
                            /* webpackChunkName: "analytics" */
                            /* webpackPrefetch: true */
                            "apps/analytics/src"
                          )
                        );
                        return (
                          <Route
                            key={product}
                            path="/analytics"
                            component={AnalyticsApp}
                          />
                        );
                      case "code":
                        const CodeApp = lazy(() =>
                          import(
                            /* webpackChunkName: "code" */
                            /* webpackPrefetch: true */
                            "apps/code-editor/src"
                          )
                        );
                        return (
                          <Route
                            key={product}
                            path="/code"
                            component={CodeApp}
                          />
                        );
                      case "leads":
                        const LeadsApp = lazy(() =>
                          import(
                            /* webpackChunkName: "leads" */
                            /* webpackPrefetch: true */
                            "apps/leads/src"
                          )
                        );
                        return (
                          <Route
                            key={product}
                            path="/leads"
                            component={LeadsApp}
                          />
                        );
                      case "schema":
                        const SchemaApp = lazy(() =>
                          import(
                            /* webpackChunkName: "schema" */
                            /* webpackPrefetch: true */
                            "apps/schema/src"
                          )
                        );
                        return (
                          <Route
                            key={product}
                            path="/schema"
                            component={SchemaApp}
                          />
                        );
                      case "seo":
                        const SeoApp = lazy(() =>
                          import(
                            /* webpackChunkName: "seo" */
                            /* webpackPrefetch: true */
                            "apps/seo/src"
                          )
                        );
                        return (
                          <Route key={product} path="/seo" component={SeoApp} />
                        );
                      case "settings":
                        const SettingsApp = lazy(() =>
                          import(
                            /* webpackChunkName: "settings" */
                            /* webpackPrefetch: true */
                            "apps/settings/src"
                          )
                        );
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
            </AppError>
          </div>
        </main>
      </section>
    );
  })
);
