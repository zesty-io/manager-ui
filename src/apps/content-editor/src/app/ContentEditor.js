import React, { Component } from "react";
import { connect } from "react-redux";
import { Switch, Route } from "react-router-dom";

import { fetchNav } from "../store/contentNav";
import { fetchModels } from "../store/contentModels";

import { WithLoader } from "@zesty-io/core/WithLoader";

import AppError from "./AppError";
import { ContentNav } from "./components/Nav";

import { Dashboard } from "./views/Dashboard";
import { ItemList } from "./views/ItemList";
import { ItemEdit } from "./views/ItemEdit";
import { ItemCreate } from "./views/ItemCreate";
import { LinkCreate } from "./views/LinkCreate";
import { LinkEdit } from "./views/LinkEdit";
import { NotFound } from "./views/NotFound";
import { CSVImport } from "./views/CSVImport";

// Vendor styles for codemirror, prosemirror and flatpickr
import "@zesty-io/core/vendor.css";

import styles from "./ContentEditor.less";
export default connect(state => {
  return {
    contentModels: state.contentModels,
    contentNav: state.contentNav
  };
})(
  class ContentEditor extends Component {
    componentDidMount() {
      // listen for the reload nav event from riot sub-apps
      zesty.on("RELOAD_NAV", () => {
        this.props.dispatch(fetchNav());
        this.props.dispatch(fetchModels());
      });
    }
    render() {
      return (
        <AppError>
          <WithLoader
            condition={
              this.props.contentNav.nav.length ||
              this.props.contentNav.headless.length
            }
            message="Starting Content Editor"
            width="100vw"
          >
            <section className={styles.ContentEditor}>
              <div className={styles.Nav}>
                <ContentNav
                  dispatch={this.props.dispatch}
                  models={this.props.contentModels}
                  nav={this.props.contentNav}
                />
              </div>
              <div className={styles.Content}>
                <div className={styles.ContentWrap}>
                  <Switch>
                    <Route exact path="/content" component={Dashboard} />

                    <Route
                      exact
                      path="/content/link/new"
                      component={LinkCreate}
                    />

                    <Route
                      exact
                      path="/content/:modelZUID/new"
                      component={ItemCreate}
                    />
                    <Route
                      path="/content/link/:linkZUID"
                      component={LinkEdit}
                    />
                    <Route
                      exact
                      path="/content/:modelZUID/import"
                      component={CSVImport}
                    />
                    <Route
                      path="/content/:modelZUID/:itemZUID"
                      component={ItemEdit}
                    />
                    <Route
                      exact
                      path="/content/:modelZUID"
                      component={ItemList}
                    />

                    <Route path="*" component={NotFound} />
                  </Switch>
                </div>
              </div>
            </section>
          </WithLoader>
        </AppError>
      );
    }
  }
);
