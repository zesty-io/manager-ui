import { useState, useEffect, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Switch, Route } from "react-router-dom";
import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase } from "@fortawesome/free-solid-svg-icons";

import { fetchModels } from "shell/store/models";
import { fetchNav } from "../store/navContent";

import { AppLink } from "@zesty-io/core/AppLink";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { ContentNav } from "./components/Nav";
import { ContentNavToggle } from "./components/Nav/components/ContentNavToggle";

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
export default function ContentEditor() {
  const contentModels = useSelector((state) => state.models);
  const navContent = useSelector((state) => state.navContent);
  const ui = useSelector((state) => state.ui);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Kick off loading data before app mount
    // to decrease time to first interaction
    dispatch(fetchNav()).then((_) => setLoading(false));
    dispatch(fetchModels());
  }, []);

  console.table(navContent);

  return (
    <Fragment>
      <WithLoader condition={!loading} message="Starting Content Editor">
        {navContent.raw.length === 0 ? (
          <div className={styles.SchemaRedirect}>
            <h1 className={styles.display}>
              Please create a new content model
            </h1>
            <AppLink to={`schema/new`}>
              <FontAwesomeIcon icon={faDatabase} />
              &nbsp; Schema
            </AppLink>
          </div>
        ) : (
          <section
            className={cx(
              styles.ContentEditor,
              ui.contentNav ? styles.ContentGridOpen : "",
              ui.contentNavHover && !ui.contentNav
                ? styles.ContentGridHover
                : ""
            )}
          >
            <ContentNav
              data-cy="contentNav"
              dispatch={dispatch}
              models={contentModels}
              nav={navContent}
            />

            <ContentNavToggle />
            <div
              className={cx(
                styles.Content,
                ui.openNav ? styles.GlobalOpen : styles.GlobalClosed
              )}
            >
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
                  <Route path="/content/link/:linkZUID" component={LinkEdit} />
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
        )}
      </WithLoader>
    </Fragment>
  );
}
