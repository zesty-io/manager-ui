import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Switch, Route } from "react-router-dom";
import cx from "classnames";

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

  const [isShown, setIsShown] = useState({
    anchorEl: null,
    hover: false,
    button: ui.contentNav,
  });

  const onEnter = () => {
    console.log("On enter");
    setIsShown((prevState) => ({
      ...prevState,
      hover: true,
    }));
  };
  const onLeave = () => {
    console.log("On Leave");
    if (ui.contentNav) {
      setIsShown((prevState) => ({
        ...prevState,
        hover: true,
      }));
    } else {
      setIsShown((prevState) => ({
        ...prevState,
        hover: false,
      }));
    }
  };

  const onClickOpen = () => {
    console.log("On Click Open");
    if (ui.contentNav) {
      setIsShown((prevState) => ({
        ...prevState,
        hover: true,
        button: ui.contentNav,
      }));
    }
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
          ui.contentNav || isShown.hover ? styles.OpenEditor : ""
        )}
      >
        <div
          data-cy="contentNav"
          className={cx(
            styles.Nav,
            ui.contentNav ? styles.OpenNav : styles.ClosedNav
          )}
          onMouseEnter={() => onEnter()}
          onMouseLeave={() => onLeave()}
          onClick={() => onClickOpen()}
        >
          <ContentNav
            dispatch={dispatch}
            models={contentModels}
            nav={navContent}
          />
        </div>
        <ContentNavToggle />
        <div
          className={cx(
            styles.Content,
            ui.contentNav ? styles.ContentOpen : " "
          )}
        >
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
