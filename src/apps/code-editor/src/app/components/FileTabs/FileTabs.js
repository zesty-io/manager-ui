import React, { useEffect } from "react";
import cx from "classnames";

import { AppLink } from "@zesty-io/core/AppLink";

import { fileOpen, resolvePathPart } from "../../../store/files";

import styles from "./FileTabs.less";
export const FileTabs = React.memo(
  function FileTabs(props) {
    useEffect(() => {
      props.dispatch(fileOpen(props.openFileZUID, props.status, true));
    }, [props.openFileZUID]);

    const openFiles = props.files
      .filter(file => file.open && file.status === props.status)
      .sort((a, b) => {
        let fileNameA = a.fileName.toLowerCase().trim(); // ignore upper and lowercase
        let fileNameB = b.fileName.toLowerCase().trim(); // ignore upper and lowercase
        if (fileNameA < fileNameB) {
          return -1;
        }
        if (fileNameA > fileNameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });

    const handleClose = file => {
      props.dispatch(fileOpen(file.ZUID, file.status, false));

      if (file.dirty) {
        // console.log("// TODO alert there are unsaved changes");
      }

      // Determine what file should be opened after closing this one
      if (file.ZUID === props.openFileZUID) {
        let nextActiveFile = openFiles.find(f => f.ZUID !== file.ZUID);
        if (nextActiveFile) {
          window.location = `/#!/code/file/${resolvePathPart(
            nextActiveFile.type
          )}/${nextActiveFile.ZUID}`;
        } else {
          window.location = "/#!/code";
        }
      }
    };

    return (
      <div className={styles.OpenFiles}>
        {openFiles.map(file => {
          return (
            <span
              key={file.ZUID}
              className={cx(
                styles.File,
                file.ZUID === props.openFileZUID ? styles.Active : null
              )}
            >
              <AppLink
                className={styles.Link}
                autoFocus={file.ZUID === props.openFileZUID}
                to={`/code/file/${resolvePathPart(file.type)}/${file.ZUID}`}
              >
                <span className={styles.FileName}>{file.fileName}</span>

                <span
                  className={cx(styles.Close, file.dirty ? styles.Dirty : null)}
                  title="Close File"
                  onClick={evt => {
                    evt.preventDefault(); // otherwise the link is clicked and the file is reloaded
                    handleClose(file);
                  }}
                >
                  {/* Figure out which icon to display */}
                  {file.synced && !file.dirty && (
                    <i className="far fa-times-circle" title="Close file"></i>
                  )}
                  {file.synced && file.dirty && (
                    <i
                      className="fas fa-circle"
                      title="You have un-saved changes"
                    ></i>
                  )}
                  {!file.synced && (
                    <i
                      className={cx(styles.Sync, "fas fa-circle")}
                      title="Your local file changes differ from the remote files"
                    ></i>
                  )}
                </span>
              </AppLink>
            </span>
          );
        })}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // console.log("FileTabs:shouldMemoUpdate", prevProps, nextProps);

    /**
     * Re-render
     * 1) If the files length changes
     * 2) If the current open file zuid changes
     * 3) If the status changed
     * 4) If the current open file properties change
     * 5) If the open files count changed
     */

    // 1
    if (prevProps.files.length !== nextProps.files.length) {
      return false;
    }

    // 2
    if (prevProps.openFileZUID !== nextProps.openFileZUID) {
      return false;
    }

    // 3
    if (prevProps.status !== nextProps.status) {
      return false;
    }

    // 4
    const prevFile = prevProps.files.find(
      file =>
        file.ZUID === prevProps.openFileZUID && file.status === prevProps.status
    );
    const nextFile = nextProps.files.find(
      file =>
        file.ZUID === nextProps.openFileZUID && file.status === nextProps.status
    );
    if (
      prevFile &&
      nextFile &&
      (prevFile.open !== nextFile.open ||
        prevFile.dirty !== nextFile.dirty ||
        prevFile.synced !== nextFile.synced)
    ) {
      return false;
    }

    //5
    if (
      prevProps.files.filter(
        file => file.open && file.status === prevProps.status
      ).length !==
      nextProps.files.filter(
        file => file.open && file.status === nextProps.status
      ).length
    ) {
      return false;
    }

    // console.log("FileTabs:memo:true");

    return true;
  }
);
