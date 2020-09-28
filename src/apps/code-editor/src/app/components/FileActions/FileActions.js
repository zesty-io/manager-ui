import React from "react";
import cx from "classnames";
import { Switch, Route, useRouteMatch } from "react-router";

import { Button } from "@zesty-io/core/Button";
import { AppLink } from "@zesty-io/core/AppLink";
import { Url } from "@zesty-io/core/Url";
import { Notice } from "@zesty-io/core/Notice";
// import { Infotip } from "@zesty-io/core/Infotip";

import { DifferActions } from "./components/DifferActions";
import { EditorActions } from "./components/EditorActions";
import { Delete } from "./components/Delete";

import styles from "./FileActions.less";
export const FileActions = React.memo(function FileActions(props) {
  const match = useRouteMatch("/code/file/:fileType/:fileZUID");
  return (
    <header className={styles.FileActions}>
      <div className={styles.FileMeta}>
        {props.contentModelZUID ? (
          <Url
            className={styles.FileLink}
            href={`${CONFIG.URL_PREVIEW_FULL}/-/instant/${props.contentModelZUID}.json`}
            target="_blank"
          >
            <i className="fas fa-bolt"></i>
          </Url>
        ) : (
          <i className={cx(styles.FileLink, "far fa-file-code")}></i>
        )}

        <Switch>
          <Route path={`${match.url}`}>
            <div className={styles.QuickLinks}>
              {props.contentModelZUID && (
                <React.Fragment>
                  <AppLink
                    className={styles.Link}
                    to={`/content/${props.contentModelZUID}`}
                    title="Edit Related Content"
                  >
                    <Button>
                      <i className="fas fa-edit"></i>
                    </Button>
                  </AppLink>

                  <AppLink
                    className={styles.Link}
                    to={`/schema/${props.contentModelZUID}`}
                    title="Edit Related Model"
                  >
                    <Button>
                      <i className="fas fa-database"></i>
                    </Button>
                  </AppLink>
                </React.Fragment>
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
                <Button>
                  <i className="fas fa-history"></i>
                </Button>
              </AppLink>
            </div>
          </Route>
        </Switch>

        <div className={styles.FileName}>
          <em className={styles.ZUID}>{props.fileZUID}</em>
          <span>{props.fileName}</span>
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
          />
        </Route>
      </Switch>
    </header>
  );
});
