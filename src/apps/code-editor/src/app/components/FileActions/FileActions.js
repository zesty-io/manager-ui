import { memo, Fragment } from "react";

import { Switch, Route, useRouteMatch } from "react-router";

import Button from "@mui/material/Button";
import HistoryIcon from "@mui/icons-material/History";
import EditIcon from "@mui/icons-material/Edit";
import StorageIcon from "@mui/icons-material/Storage";
import { CopyButton } from "@zesty-io/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faFileCode } from "@fortawesome/free-solid-svg-icons";
import Link from "@mui/material/Link";

import { AppLink } from "@zesty-io/core/AppLink";
import { Notice } from "@zesty-io/core/Notice";

import { DifferActions } from "./components/DifferActions";
import { EditorActions } from "./components/EditorActions";
import { Delete } from "./components/Delete";

import styles from "./FileActions.less";
export const FileActions = memo(function FileActions(props) {
  const match = useRouteMatch("/code/file/:fileType/:fileZUID");

  return (
    <header className={styles.FileActions}>
      <div className={styles.FileMeta}>
        {props.contentModelZUID ? (
          <Link
            underline="none"
            color="secondary"
            href={`${CONFIG.URL_PREVIEW_FULL}/-/instant/${props.contentModelZUID}.json`}
            target="_blank"
            title="Preview JSON"
            sx={{ m: 0, pr: 2, pl: 3.25, py: 0 }}
          >
            <FontAwesomeIcon icon={faBolt} />
          </Link>
        ) : (
          <FontAwesomeIcon className={styles.FileLink} icon={faFileCode} />
        )}

        <Switch>
          <Route path={`${match.url}`}>
            <div className={styles.QuickLinks}>
              {props.contentModelZUID && (
                <Fragment>
                  <AppLink
                    className={styles.Link}
                    to={`/content/${props.contentModelZUID}`}
                    title="Edit Related Content"
                  >
                    <Button variant="contained" size="small">
                      <EditIcon fontSize="small" />
                    </Button>
                  </AppLink>

                  <AppLink
                    className={styles.Link}
                    to={`/schema/${props.contentModelZUID}`}
                    title="Edit Related Model"
                  >
                    <Button variant="contained" size="small">
                      <StorageIcon fontSize="small" />
                    </Button>
                  </AppLink>
                </Fragment>
              )}

              <AppLink
                className={styles.Link}
                to={`/code/file/${props.fileType}/${
                  props.fileZUID
                }/diff/local,${
                  props.publishedVersion
                    ? props.publishedVersion
                    : props.version
                }`}
                title="Diff Versions"
              >
                <Button variant="contained" size="small">
                  <HistoryIcon fontSize="small" />
                </Button>
              </AppLink>
            </div>
          </Route>
        </Switch>

        <div className={styles.FileName}>
          <CopyButton variant="contained" size="small" value={props.fileZUID} />
          {props.fileName}
        </div>
      </div>

      {!props.synced && (
        <Notice>
          There is a new remote version ahead of your local changes
        </Notice>
      )}

      <Switch>
        <Route path={`${match.url}/diff`}>
          <DifferActions
            dispatch={props.dispatch}
            fileZUID={props.fileZUID}
            fileType={props.fileType}
            publishedVersion={props.publishedVersion}
            status={props.status}
            synced={props.synced}
            setVersionCodeLeft={props.setVersionCodeLeft}
            setVersionCodeRight={props.setVersionCodeRight}
            setLoading={props.setLoading}
            currentCode={props.currentCode}
          />
        </Route>
        <Route path={`${match.url}`}>
          <EditorActions
            dispatch={props.dispatch}
            fileZUID={props.fileZUID}
            fileType={props.fileType}
            version={props.version}
            synced={props.synced}
            status={props.status}
          />
          <Delete
            dispatch={props.dispatch}
            fileZUID={props.fileZUID}
            status={props.status}
            fileName={props.fileName}
          />
        </Route>
      </Switch>
    </header>
  );
});
