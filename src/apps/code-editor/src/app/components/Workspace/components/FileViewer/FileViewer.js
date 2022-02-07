import { memo, useState, useEffect } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { Switch, Route } from "react-router";
import { Redirect, useHistory } from "react-router-dom";
import useIsMounted from "ismounted";
import cx from "classnames";

// TODO implement multitab: https://github.com/Microsoft/monaco-editor/issues/604#issuecomment-344214706

import { notify } from "shell/store/notifications";
import { fetchFields } from "shell/store/fields";
import { fetchFile } from "../../../../../store/files";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { Editor } from "../../../Editor";
import { Differ } from "../../../Differ";
import { FileDrawer } from "../../../FileDrawer";
import { LockedFile } from "../../../LockedFile";

import styles from "./FileViewer.less";

export const FileViewer = memo(function FileViewer(props) {
  console.log(props);
  const dispatch = useDispatch();
  const history = useHistory();

  const files = useSelector((state) => state.files);

  const file = files
    ? files.find((file) => file.ZUID === props.match.params.fileZUID)
    : {};

  console.log("🚀 ~ file: FileViewer.js ~ line 31 ~ FileViewer ~ file", file);

  const getFields = useSelector((state) => state.fields);
  console.log(
    "🚀 ~ file: FileViewer.js ~ line 35 ~ FileViewer ~ getFields",
    getFields
  );

  const fields = getFields
    ? Object.keys(getFields)
        .filter(
          (fieldZUID) =>
            getFields[fieldZUID]?.contentModelZUID === file.contentModelZUID
        )
        .reduce((acc, fieldZUID) => {
          acc.push(getFields[fieldZUID]);
          return acc;
        }, [])
    : [];

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
    if (!file || !file.ZUID) {
      setLoading(true);
    }
    if (file.contentModelZUID && !fields.length) {
      setLoading(true);
    }

    props
      .dispatch(fetchFile(match.params.fileZUID, match.params.fileType))
      .then((res) => {
        if (file.contentModelZUID) {
          return dispatch(fetchFields(file.contentModelZUID));
        } else {
          res;
        }
      })
      .catch((err) => {
        if (err !== "duplicate request") {
          console.error(err);
          dispatch(
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
        {file && file.ZUID ? (
          <>
            <LockedFile />
            <Switch>
              <Route path={`${match.url}/diff`}>
                <Differ
                  dispatch={dispatch}
                  fileName={file.fileName}
                  fileZUID={match.params.fileZUID}
                  fileType={match.params.fileType}
                  contentModelZUID={file.contentModelZUID}
                  currentCode={file.code}
                  publishedVersion={file.publishedVersion}
                  status={props.status}
                  synced={file.synced}
                  lineNumber={lineNumber}
                />
              </Route>
              <Route path={`${match.url}`}>
                {/* Force Sync */}
                {!file.synced && (
                  <Redirect push to={`${location.pathname}/diff/`} />
                )}

                <Editor
                  dispatch={dispatch}
                  fileName={file.fileName}
                  fileZUID={match.params.fileZUID}
                  fileType={match.params.fileType}
                  contentModelZUID={file.contentModelZUID}
                  publishedVersion={file.publishedVersion}
                  fields={fields}
                  code={file.code}
                  synced={file.synced}
                  status={props.status}
                  version={file.version}
                  lineNumber={lineNumber}
                />
              </Route>
            </Switch>

            <FileDrawer file={file} match={match} />
          </>
        ) : (
          <div className={cx(styles.FileNotFound, styles.display)}>
            File Not Found
          </div>
        )}
      </WithLoader>
    </section>
  );
});
