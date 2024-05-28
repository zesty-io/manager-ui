import { useState, useEffect, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Switch, Route } from "react-router-dom";
import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase } from "@fortawesome/free-solid-svg-icons";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { legacyTheme } from "@zesty-io/material";

import { fetchModels } from "shell/store/models";
import { fetchNav } from "../store/navContent";

import { AppLink } from "@zesty-io/core/AppLink";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { ContentNav } from "./components/ContentNav";

import { ItemList2 as ItemList } from "./views/ItemList/ItemList2";
import { ItemEdit } from "./views/ItemEdit";
import { ItemCreate } from "./views/ItemCreate";
import { LinkCreate } from "./views/LinkCreate";
import { LinkEdit } from "./views/LinkEdit";
import { NotFound } from "./views/NotFound";
import { CSVImport } from "./views/CSVImport";
import ReleaseApp from "../../../release/src";

// Vendor styles for codemirror, prosemirror and flatpickr
import "@zesty-io/core/vendor.css";

import styles from "./ContentEditor.less";
import Analytics from "./views/Analytics";
import { ResizableContainer } from "../../../../shell/components/ResizeableContainer";
import { StagedChangesProvider } from "./views/ItemList/StagedChangesContext";
import { SelectedItemsProvider } from "./views/ItemList/SelectedItemsContext";

// Makes sure that other apps using legacy theme does not get affected with the palette
let customTheme = createTheme(legacyTheme, {
  palette: {
    secondary: {
      main: "#FF5D0A",
      contrastText: "#ffffff",
    },
    primary: {
      main: "#FF5D0A",
      dark: "#EC4A0A",
      light: "#FD853A",
      contrastText: "#ffffff",
    },
    success: {
      main: "#12B76A",
      dark: "#027A48",
      light: "#D1FADF",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#F79009",
      dark: "B54708",
      light: "#FEF0C7",
      contrastText: "#ffffff",
    },
    error: {
      main: "#F04438",
      dark: "#B42318",
      light: "#FECDCA",
      contrastText: "#ffffff",
    },
    info: {
      main: "#0BA5EC",
      dark: "#026AA2",
      light: "#7CD4FD",
    },
    text: {
      primary: "#101828",
      secondary: "#475467",
      disabled: alpha("#101828", 0.56),
    },
    grey: {
      50: "#F9FAFB",
      100: "#F2F4F7",
      200: "#E4E7EC",
      300: "#D0D5DD",
      400: "#98A2B3",
      500: "#667085",
      600: "#475467",
      700: "#344054",
      800: "#1D2939",
      900: "#101828",
    },
    border: "#F2F4F7",
    action: {
      active: "rgba(16, 24, 40, 0.40)",
      hover: "rgba(16, 24, 40, 0.04)",
      selected: "rgba(16, 24, 40, 0.08)",
      disabled: "rgba(16, 24, 40, 0.26)",
      disabledBackground: "rgba(16, 24, 40, 0.12)",
      focus: "rgba(16, 24, 40, 0.12)",
    },
  },
});

export default function ContentEditor() {
  const navContent = useSelector((state) => state.navContent);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Kick off loading data before app mount
    // to decrease time to first interaction
    dispatch(fetchNav())
      .then((_) => setLoading(false))
      .catch((e) => {
        throw e;
      });
    dispatch(fetchModels());
  }, []);

  return (
    <Fragment>
      <WithLoader condition={!loading} message="Starting Content Editor">
        <ThemeProvider theme={customTheme}>
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
            <section className={cx(styles.ContentEditor)}>
              <ResizableContainer
                id="contentNav"
                defaultWidth={220}
                minWidth={220}
                maxWidth={360}
              >
                <ContentNav />
              </ResizableContainer>
              <div className={cx(styles.Content)}>
                <div className={styles.ContentWrap}>
                  <Switch>
                    {/* <Route path="/content/releases" component={ReleaseApp} /> */}
                    <Route exact path="/content" component={Analytics} />
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
                      render={() => (
                        <StagedChangesProvider>
                          <SelectedItemsProvider>
                            <ItemList />
                          </SelectedItemsProvider>
                        </StagedChangesProvider>
                      )}
                    />
                    <Route path="*" component={NotFound} />
                  </Switch>
                </div>
              </div>
            </section>
          )}
        </ThemeProvider>
      </WithLoader>
    </Fragment>
  );
}
