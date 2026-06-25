import { useState, useEffect, Fragment, use, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Switch, Route } from "react-router-dom";
import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase } from "@fortawesome/free-solid-svg-icons";
import { Box, Stack, Typography, Link } from "@mui/material";
import { SubAppSkeleton } from "shell/components/SubAppSkeleton";
import { Database } from "@zesty-io/material";

import { fetchModels } from "shell/store/models";
import { fetchNav } from "../store/navContent";

import { AppLink } from "shell/components/AppLink";
import { WithLoader } from "shell/components/legacy/WithLoader";
import { ContentNav } from "./components/ContentNav";
import { LoadingQuote } from "../../../../shell/components/LoadingQuote";

import { ItemList } from "./views/ItemList";
import { ItemEdit } from "./views/ItemEdit";
import { ItemCreate } from "./views/ItemCreate";
import { LinkCreate } from "./views/LinkCreate";
import { LinkEdit } from "./views/LinkEdit";
import NotFound from "./views/NotFound";
import { CSVImport } from "./views/CSVImport";
import ReleaseApp from "../../../release/src";

// Vendor styles for codemirror, prosemirror and flatpickr
import "shell/components/legacy/vendor.css";

import styles from "./ContentEditor.less";
import Analytics from "./views/Analytics";
import { ResizableContainer } from "../../../../shell/components/ResizeableContainer";
import { StagedChangesProvider } from "./views/ItemList/StagedChangesContext";
import { SelectedItemsProvider } from "./views/ItemList/SelectedItemsContext";
import { TableSortProvider } from "./views/ItemList/TableSortProvider";
import { useParams } from "../../../../shell/hooks/useParams";

// Makes sure that other apps using legacy theme does not get affected with the palette

// Local Suspense boundary so lazy-loading the "content" namespace shows a
// fallback in the sub-app area only, instead of blanking the whole shell.
export default function ContentEditor() {
  return (
    <Suspense fallback={<SubAppSkeleton />}>
      <ContentEditorContent />
    </Suspense>
  );
}

function ContentEditorContent() {
  // Requesting the namespace here triggers its lazy load and suspends this
  // subtree until ready; child components use bare useTranslation() with
  // qualified keys (t("content.key")) once it's in the store.
  const { t } = useTranslation("content");
  const navContent = useSelector((state) => state.navContent);
  const dispatch = useDispatch();
  const [params] = useParams();

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
    <section className={cx(styles.ContentEditor)}>
      {params.get("isDialog") !== "true" && (
        <ResizableContainer
          id="contentNav"
          defaultWidth={220}
          minWidth={220}
          maxWidth={360}
        >
          <ContentNav />
        </ResizableContainer>
      )}

      {loading ? (
        <LoadingQuote />
      ) : !navContent.raw.length ? (
        <Stack
          sx={{ width: "100%", alignItems: "center", justifyContent: "center" }}
        >
          <Typography variant="h1" color="text.primary">
            {t("content.emptyCreateModel")}
          </Typography>
          <Link
            underline="none"
            color="secondary"
            title="Zesty.io Schema"
            href="/schema/new"
            sx={{
              p: 2,
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Database />
            &nbsp; {t("shell.navSchema")}
          </Link>
        </Stack>
      ) : (
        <div className={cx(styles.Content)}>
          <div className={styles.ContentWrap}>
            <Switch>
              {/* <Route path="/content/releases" component={ReleaseApp} /> */}
              <Route exact path="/content" component={Analytics} />
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
              <Route
                exact
                path="/content/:modelZUID"
                render={() => (
                  <StagedChangesProvider>
                    <SelectedItemsProvider>
                      <TableSortProvider>
                        <ItemList />
                      </TableSortProvider>
                    </SelectedItemsProvider>
                  </StagedChangesProvider>
                )}
              />
              <Route path="*" component={NotFound} />
            </Switch>
          </div>
        </div>
      )}
    </section>
  );
}
