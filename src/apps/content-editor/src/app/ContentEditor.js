import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Switch, Route } from "react-router-dom";
import cx from "classnames";

import { actions } from "shell/store/ui";

import { fetchModels } from "shell/store/models";
import { fetchNav } from "../store/navContent";

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
export default function ContentEditor(props) {
  const contentModels = useSelector((state) => state.models);
  const navContent = useSelector((state) => state.navContent);
  const ui = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const [mouseEnterTimer, setMouseEnterTimer] = useState(null);
  const [mouseLeaveTimer, setMouseLeaveTimer] = useState(null);

  const handleMouseEnter = () => {
    const enterTimer = setTimeout(() => {
      dispatch(actions.setContentNavHover(true));
    }, 500);

    setMouseEnterTimer(enterTimer);
  };

  const handleMouseLeave = () => {
    const leaveTimer = setTimeout(() => {
      dispatch(actions.setContentNavHover(false));
    }, 500);
    setMouseLeaveTimer(leaveTimer);

    clearTimeout(mouseEnterTimer);
    clearTimeout(mouseLeaveTimer);
  };

  useEffect(() => {
    // Kick off loading data before app mount
    // to decrease time to first interaction
    dispatch(fetchNav());
    dispatch(fetchModels());
  }, []);

  return (
    <WithLoader
      condition={navContent.nav.length || navContent.headless.length}
      message="Starting Content Editor"
    >
      <section
        className={cx(
          styles.ContentEditor,
          ui.contentNav ? styles.ContentNavOpen : "",
          ui.contentNavHover ? styles.ContentNavHover : ""
          // true ? styles.ContentNavHover : ""
        )}
      >
        <div
          data-cy="contentNav"
          className={styles.Nav}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <ContentNav
            dispatch={dispatch}
            models={contentModels}
            nav={navContent}
          />
        </div>
        <ContentNavToggle />
        <div className={styles.Content}>
          <div className={styles.ContentWrap}>
            <Switch>
              <Route exact path="/content" component={Dashboard} />

              <Route exact path="/content/link/new" component={LinkCreate} />

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
              <Route exact path="/content/:modelZUID" component={ItemList} />

              <Route path="*" component={NotFound} />
            </Switch>
          </div>
        </div>
      </section>
    </WithLoader>
  );
}
