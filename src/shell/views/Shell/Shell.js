import React from "react";
import { Switch, Route } from "react-router-dom";
import { connect } from "react-redux";

import GlobalSidebar from "shell/components/global-sidebar";
import GlobalTopbar from "shell/components/global-topbar";
import Welcome from "shell/components/welcome";
import Missing from "shell/components/missing";

// import { subMenuLoad } from "shell/store/ui/global-sub-menu";

import styles from "./Shell.less";
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
          <GlobalTopbar />
          <div className={styles.SubApp}>
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
                      <Route key={product} path="/media" component={MediaApp} />
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

                // return (
                //   <Route key={product} path={`/${product}`} component={`${product.replace()}App`} />
                // );
              })}

              <Route exact path="/" component={Welcome} />
              <Route path="*" component={Missing} />
            </Switch>
          </div>
        </main>
      </section>
    );
  })
);
