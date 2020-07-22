import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Switch, Route } from "react-router";
import { Redirect } from "react-router-dom";
import cx from "classnames";

// TODO implement multitab: https://github.com/Microsoft/monaco-editor/issues/604#issuecomment-344214706

import { notify } from "shell/store/notifications";
import { fetchFields } from "shell/store/fields";
import { fetchFile } from "../../../../../store/files";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { Editor } from "../../../Editor";
import { Differ } from "../../../Differ";
import { FileDrawer } from "../../../FileDrawer";

import styles from "./FileViewer.less";
export const FileViewer = connect((state, props) => {
  const file = state.files.find(
    file => file.ZUID === props.match.params.fileZUID
  );
  const fields =
    file && file.contentModelZUID
      ? Object.keys(state.fields)
          .filter(
            fieldZUID =>
              state.fields[fieldZUID].contentModelZUID === file.contentModelZUID
          )
          .reduce((acc, fieldZUID) => {
            acc.push(state.fields[fieldZUID]);
            return acc;
          }, [])
      : [];

  return {
    file: file ? file : {},
    fields
  };
})(
  React.memo(function FileViewer(props) {
    const { match, location } = props;
    const [loading, setLoading] = useState(false);

    let lineNumber = 0;
    if (location.search) {
      const params = new URLSearchParams(location.search);
      lineNumber = params.get("line");
    }

    // If we don't have the file on hand, fetch it from the api
    useEffect(() => {
      // If we already have the file on hand let the refresh happen in the background
      if (!props.file || !props.file.ZUID) {
        setLoading(true);
      }
      if (props.file.contentModelZUID && !props.fields.length) {
        setLoading(true);
      }

      props
        .dispatch(fetchFile(match.params.fileZUID, match.params.fileType))
        .then(res => {
          if (props.file.contentModelZUID) {
            return props.dispatch(fetchFields(props.file.contentModelZUID));
          } else {
            res;
          }
        })
        .catch(err => {
          if (err !== "duplicate request") {
            console.error(err);
            notify({
              kind: "warn",
              message: `Could not load ${match.params.fileType} ${match.params.fileZUID}`
            });
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }, [match.params.fileZUID]);

    return (
      <section className={styles.FileViewer}>
        <WithLoader condition={!loading} message="Finding File">
          {props.file && props.file.ZUID ? (
            <>
              <Switch>
                <Route path={`${match.url}/diff`}>
                  <Differ
                    dispatch={props.dispatch}
                    fileName={props.file.fileName}
                    fileZUID={match.params.fileZUID}
                    fileType={match.params.fileType}
                    contentModelZUID={props.file.contentModelZUID}
                    currentCode={props.file.code}
                    publishedVersion={props.file.publishedVersion}
                    status={props.status}
                    synced={props.file.synced}
                    lineNumber={lineNumber}
                  />
                </Route>
                <Route path={`${match.url}`}>
                  {/* Force Sync */}
                  {!props.file.synced && (
                    <Redirect push to={`${location.pathname}/diff/`} />
                  )}

                  <Editor
                    dispatch={props.dispatch}
                    fileName={props.file.fileName}
                    fileZUID={match.params.fileZUID}
                    fileType={match.params.fileType}
                    contentModelZUID={props.file.contentModelZUID}
                    publishedVersion={props.file.publishedVersion}
                    fields={props.fields}
                    code={props.file.code}
                    synced={props.file.synced}
                    status={props.status}
                    version={props.file.version}
                    lineNumber={lineNumber}
                  />
                </Route>
              </Switch>

              <FileDrawer file={props.file} match={match} />
            </>
          ) : (
            <div className={cx(styles.FileNotFound, styles.display)}>
              File Not Found
            </div>
          )}
        </WithLoader>
      </section>
    );
  })
);
