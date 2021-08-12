import { memo } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { Sentry } from "utility/sentry";
import cx from "classnames";

import { useDispatch, useSelector } from "react-redux";
import { toggleNav } from "shell/store/ui";

import AppError from "shell/components/AppError";
import GlobalSidebar from "shell/components/global-sidebar";
import GlobalTopbar from "shell/components/GlobalTopbar";
import Missing from "shell/components/missing";

import ContentApp from "apps/content-editor/src";
import DamApp from "apps/media/src";
import PublishApp from "apps/publish/src";
import AuditTrailApp from "apps/audit-trail/src";
import AnalyticsApp from "apps/analytics/src";
import CodeApp from "apps/code-editor/src";
import LeadsApp from "apps/leads/src";
import SchemaApp from "apps/schema/src";
import SeoApp from "apps/seo/src";
import SettingsApp from "apps/settings/src";
import CustomApp from "apps/custom-app/src";

import styles from "./Shell.less";

export default memo(function Shell() {
  const dispatch = useDispatch();
  const openNav = useSelector((state) => state.ui.openNav);
  const products = useSelector((state) => state.products);

  return (
    <section className={cx(styles.Shell, openNav ? null : styles.NavClosed)}>
      <GlobalSidebar
        onClick={() => {
          dispatch(toggleNav());
        }}
        openNav={openNav}
      />
      <main className={styles.AppLoader}>
        <GlobalTopbar />
        <div className={styles.SubApp} data-cy="SubApp">
          <Sentry.ErrorBoundary fallback={() => <AppError />}>
            <Switch>
              <Route path="/publish" component={PublishApp} />

              <Route path="/media/:groupID/file/:fileID" component={DamApp} />
              <Route path="/media/:groupID" component={DamApp} />
              <Route path="/media" component={DamApp} />

              <Route path="/app*" component={CustomApp} />

              {products.map((product) => {
                switch (product) {
                  case "content":
                    return (
                      <Route
                        key={product}
                        path="/content"
                        component={ContentApp}
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
                      <Route key={product} path="/leads" component={LeadsApp} />
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

              <Redirect exact from="/" to="/content" />
              <Route path="*" component={Missing} />
            </Switch>
          </Sentry.ErrorBoundary>
        </div>
      </main>
    </section>
  );
});
