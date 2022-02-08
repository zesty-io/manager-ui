import { memo, useState, useEffect } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { Switch, Route } from "react-router";
import { Redirect, useHistory, useParams } from "react-router-dom";
import useIsMounted from "ismounted";
import cx from "classnames";

// TODO implement multitab: https://github.com/Microsoft/monaco-editor/issues/604#issuecomment-344214706

import { notify } from "shell/store/notifications";
import { fetchFields } from "shell/store/fields";
import { fetchFile } from "../../../../../store/files";
import { checkLock, lock, unlock } from "shell/store/content";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { Editor } from "../../../Editor";
import { Differ } from "../../../Differ";
import { FileDrawer } from "../../../FileDrawer";
import { LockedFile } from "../../../LockedFile";

import styles from "./FileViewer.less";

export const FileViewer = memo(function FileViewer(props) {
  console.log(props);
  const dispatch = useDispatch();
  const isMounted = useIsMounted();
  const { itemZUID } = useParams();
  const user = useSelector((state) => state.user);

  const files = useSelector((state) => state.files);

  const file = files
    ? files.find((file) => file.ZUID === props.match.params.fileZUID)
    : {};

  const getFields = useSelector((state) => state.fields);

  const fields = getFields
    ? Object.keys(getFields)
        .filter(
          (fieldZUID) =>
            getFields[fieldZUID].contentModelZUID === file.contentModelZUID
        )
        .reduce((acc, fieldZUID) => {
          acc.push(getFields[fieldZUID]);
          return acc;
        }, [])
    : [];
  console.log("PROPS", props);
  console.log("🚀 ~ file: FileViewer.js ~ line 33 ~ FileViewer ~ file", file);
  console.log(
    "🚀 ~ file: FileViewer.js ~ line 39 ~ FileViewer ~ fields",
    fields
  );

  const [loading, setLoading] = useState(false);
  const [lockState, setLockState] = useState({});
  const [checkingLock, setCheckingLock] = useState(false);

  let lineNumber = 0;
  if (props.location.search) {
    const params = new URLSearchParams(props.location.search);
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

    dispatch(
      fetchFile(props.match.params.fileZUID, props.match.params.fileType)
    )
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
              message: `Could not load ${props.match.params.fileType} ${props.match.params.fileZUID}`,
            })
          );
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [props.match.params.fileZUID]);

  async function lockFile() {
    setCheckingLock(true);
    const lockResponse = await dispatch(checkLock(itemZUID));
    console.log(
      "🚀 ~ file: FileViewer.js ~ line 103 ~ lockFile ~ lockResponse",
      lockResponse
    );
    try {
      if (isMounted.current) {
        if (!lockResponse.userZUID) {
          dispatch(lock(itemZUID));
          setLockState({ userZUID: user.ZUID });
        } else {
          setLockState(lockResponse);
        }
      }
    } catch (err) {
      if (isMounted.current) {
        setLockState({ userZUID: user.ZUID });
      }
    } finally {
      if (isMounted.current) {
        setCheckingLock(false);
      }
    }
  }

  function releaseLock(itemZUID) {
    if (lockState.userZUID === user.ZUID) {
      dispatch(unlock(itemZUID));
    }
  }

  function forceUnlock() {
    dispatch(unlock(itemZUID)).then(() => {
      dispatch(lock(itemZUID));
    });
    setLockState({ userZUID: user.ZUID });
  }

  return (
    <section className={styles.FileViewer}>
      <WithLoader condition={!loading} message="Finding File">
        {file && file.ZUID ? (
          <>
            <LockedFile />
            <Switch>
              <Route path={`${props.match.url}/diff`}>
                <Differ
                  dispatch={dispatch}
                  fileName={file.fileName}
                  fileZUID={props.match.params.fileZUID}
                  fileType={props.match.params.fileType}
                  contentModelZUID={file.contentModelZUID}
                  currentCode={file.code}
                  publishedVersion={file.publishedVersion}
                  status={props.status}
                  synced={file.synced}
                  lineNumber={lineNumber}
                />
              </Route>
              <Route path={`${props.match.url}`}>
                {/* Force Sync */}
                {!file.synced && (
                  <Redirect push to={`${props.location.pathname}/diff/`} />
                )}

                <Editor
                  dispatch={dispatch}
                  fileName={file.fileName}
                  fileZUID={props.match.params.fileZUID}
                  fileType={props.match.params.fileType}
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

            <FileDrawer file={file} match={props.match} />
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
