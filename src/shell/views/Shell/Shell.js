import React, { useEffect } from "react";
import { Switch, Route } from "react-router-dom";
import { connect } from "react-redux";
import * as Sentry from "@sentry/react";

import AppError from "shell/components/AppError";
import GlobalSidebar from "shell/components/global-sidebar";
import GlobalTabs from "shell/components/global-tabs";
import Welcome from "shell/components/welcome";
import Missing from "shell/components/missing";

import ContentApp from "apps/content-editor/src";
import MediaApp from "apps/media/src";
import AuditTrailApp from "apps/audit-trail/src";
import AnalyticsApp from "apps/analytics/src";
import CodeApp from "apps/code-editor/src";
import LeadsApp from "apps/leads/src";
import SchemaApp from "apps/schema/src";
import SeoApp from "apps/seo/src";
import SettingsApp from "apps/settings/src";

import styles from "./Shell.less";

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
        <main className={styles.AppLoader}>
          <GlobalTabs />
          <div className={styles.SubApp}>
            <Sentry.ErrorBoundary fallback={() => <AppError />}>
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

                <Route exact path="/" component={ContentApp} />
                <Route path="*" component={Missing} />
              </Switch>
            </Sentry.ErrorBoundary>
          </div>
        </main>
      </section>
    );
  })
);
