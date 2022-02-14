import { memo, useState, useEffect } from "react";
import { connect } from "react-redux";
import useIsMounted from "ismounted";
import { Switch, Route } from "react-router";
import { Redirect } from "react-router-dom";
import cx from "classnames";

// TODO implement multitab: https://github.com/Microsoft/monaco-editor/issues/604#issuecomment-344214706

import { notify } from "shell/store/notifications";
import { fetchFields } from "shell/store/fields";
import { checkLock, lock, unlock } from "shell/store/content";
import { fetchFile } from "../../../../../store/files";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { Editor } from "../../../Editor";
import { Differ } from "../../../Differ";
import { FileDrawer } from "../../../FileDrawer";
import { LockedFile } from "../../../LockedFile/LockedFile";

import styles from "./FileViewer.less";
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

  return {
    file: file ? file : {},
    fields,
    user: state.user,
  };
})(
  memo(function FileViewer(props) {
    const isMounted = useIsMounted();
    const { match, location } = props;
    const [loading, setLoading] = useState(false);

    const [lockState, setLockState] = useState({});
    const [checkingLock, setCheckingLock] = useState(true);

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

      async function loadFile() {
        try {
          const fileResponse = await props.dispatch(
            fetchFile(match.params.fileZUID, match.params.fileType)
          );

          await lockItem(fileResponse.data.ZUID);

          if (props.file.contentModelZUID) {
            await props.dispatch(fetchFields(props.file.contentModelZUID));
          }
        } catch (err) {
          if (err !== "duplicate request") {
            console.error(err);
            props.dispatch(
              notify({
                kind: "warn",
                message: `Could not load ${match.params.fileType} ${match.params.fileZUID}`,
              })
            );
          }
        } finally {
          setLoading(false);
        }
      }

      loadFile();

      return () => {
        releaseLock(props.file.ZUID); // on unmount, release lock
      };
    }, [match.params.fileZUID, props.file.ZUID]);

    async function lockItem(file) {
      setCheckingLock(true);
      try {
        const lockResponse = await props.dispatch(checkLock(file));

        // If no one has a lock then give lock to current user
        if (isMounted.current) {
          if (!lockResponse.userZUID) {
            props.dispatch(lock(file));
            setLockState({ userZUID: props.user.ZUID });
          } else {
            setLockState(lockResponse);
          }
        }
      } catch (err) {
        // If service is unavailable allow all users ownership
        if (isMounted.current) {
          setLockState({ userZUID: props.user.ZUID });
        }
      } finally {
        if (isMounted.current) {
          setCheckingLock(false);
        }
      }
    }

    function releaseLock(fileZUID) {
      if (lockState.userZUID === props.user.ZUID) {
        props.dispatch(unlock(fileZUID));
      }
    }

    function forceUnlock() {
      // Transfer item lock to current session user
      props.dispatch(unlock(props.file.ZUID)).then(() => {
        props.dispatch(lock(props.file.ZUID));
      });
      setLockState({ userZUID: props.user.ZUID });
    }

    const isLocked = !checkingLock && lockState.userZUID !== props.user.ZUID; //show lock modal

    return (
      <section className={styles.FileViewer}>
        <WithLoader
          condition={!loading} //falsey shows loader
          message="Finding File"
        >
          {props.file && props.file.ZUID ? (
            <>
              {isLocked && (
                <LockedFile
                  timestamp={lockState.timestamp}
                  userFirstName={lockState.firstName}
                  userLastName={lockState.lastName}
                  userEmail={lockState.email}
                  itemName={props.file.fileName}
                  handleUnlock={forceUnlock}
                  handleCancel={(evt) => {
                    evt.stopPropagation();
                    props.history.goBack();
                  }}
                  isLocked={isLocked}
                />
              )}
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
