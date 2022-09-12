import { memo, useState, useEffect, Fragment } from "react";
import { connect } from "react-redux";
import { Switch, Route } from "react-router";
import { Redirect } from "react-router-dom";
import cx from "classnames";

// TODO implement multitab: https://github.com/Microsoft/monaco-editor/issues/604#issuecomment-344214706

import { notify } from "shell/store/notifications";
import { fetchFields } from "shell/store/fields";
import { fetchFile, saveFile } from "../../../../../store/files";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { Editor } from "../../../Editor";
import { Differ } from "../../../Differ";
import { FileDrawer } from "../../../FileDrawer";
import { LockedView } from "../../../LockedView";
import { PendingEditsModal } from "../../../../components/PendingEditsModal";

import styles from "./FileViewer.less";
import { tabLocationEquality } from "../../../../../../../../shell/store/ui";
export const FileViewer = connect((state, props) => {
  const file = state.files.find(
    (file) => file.ZUID === props.match.params.fileZUID
  );
  const fields =
    file && file.contentModelZUID
      ? Object.keys(state.fields)
          .filter(
            (fieldZUID) =>
              state.fields[fieldZUID].contentModelZUID === file.contentModelZUID
          )
          .reduce((acc, fieldZUID) => {
            acc.push(state.fields[fieldZUID]);
            return acc;
          }, [])
      : [];

  const pinnedTabs = state.ui.pinnedTabs;
  const fileIsPinned = Boolean(
    pinnedTabs.find((tab) =>
      tabLocationEquality(tab, {
        search: "",
        pathname: `/code/file/views/${file.ZUID}`,
      })
    )
  );
  /*
  pt.forEach(tab => {
    const pathname = `/code/file/views/${file.ZUID}`
    const thing = tabLocationEquality(tab, { search: "", pathname})
    console.log({tab, pathname, thing})
  })
  */
  console.log({ file, pinnedTabs, fileIsPinned });
  return {
    file: file ? file : {},
    fields,
    fileIsPinned,
  };
})(
  memo(function FileViewer(props) {
    const { match, location } = props;
    const [loading, setLoading] = useState(false);
    console.log("FileViewer.js", { props });

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
        .then((res) => {
          if (props.file.contentModelZUID) {
            return props.dispatch(fetchFields(props.file.contentModelZUID));
          } else {
            res;
          }
        })
        .catch((err) => {
          if (err !== "duplicate request") {
            console.error(err);
            props.dispatch(
              notify({
                kind: "warn",
                message: `Could not load ${match.params.fileType} ${match.params.fileZUID}`,
              })
            );
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
            <Fragment>
              <LockedView ZUID={props.file.ZUID} name={props.file.fileName} />
              <PendingEditsModal
                show={props.file.dirty && !props.fileIsPinned}
                title="Unsaved Changes"
                message="You have unsaved changes that will be lost if you leave this page."
                loading={false}
                onSave={() =>
                  props
                    .dispatch(saveFile(props.file.ZUID, "dev"))
                    .catch((err) => {
                      console.error(err);
                    })
                }
                onDiscard={() =>
                  props
                    .dispatch(
                      fetchFile(match.params.fileZUID, match.params.fileType, {
                        forceSync: true,
                      })
                    )
                    .then(() => {
                      props.dispatch({
                        type: "UNMARK_FILE_DIRTY",
                        payload: props.file,
                      });
                    })
                }
              />

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
            </Fragment>
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
