import React, { useState, useEffect } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { Sentry } from "utility/sentry";
import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronCircleLeft } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { setNav } from "../../store/ui";

import AppError from "shell/components/AppError";
import GlobalSidebar from "shell/components/global-sidebar";
import GlobalTopbar from "shell/components/GlobalTopbar";
import Missing from "shell/components/missing";

import ContentApp from "apps/content-editor/src";

import DamApp from "apps/media/src";

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
    const dispatch = useDispatch();
    const Nav = useSelector(state => state.ui.openNav);
    console.log("🚀 ~ file: Shell.js ~ line 38 ~ Shell ~ Nav", Nav);

    const openNav = () => {
      dispatch(setNav(!Nav));
    };

    // useEffect(() => {
    //   dispatch(setNav(Nav));
    // }, [Nav]);

    return (
      <section className={cx(styles.Shell, Nav ? styles.NavClosed : " ")}>
        <GlobalSidebar onClick={openNav} globalNav={Nav} />
        <main className={styles.AppLoader}>
          <GlobalTopbar />
          <div className={styles.SubApp}>
            <Sentry.ErrorBoundary fallback={() => <AppError />}>
              <Switch>
                <Route path="/media/:groupID/file/:fileID" component={DamApp} />
                <Route path="/media/:groupID" component={DamApp} />
                <Route path="/media" component={DamApp} />
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

                <Redirect exact from="/" to="/content" />
                <Route path="*" component={Missing} />
              </Switch>
            </Sentry.ErrorBoundary>
          </div>
        </main>
      </section>
    );
  })
);
