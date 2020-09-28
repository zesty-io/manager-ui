import React, { useState } from "react";

import { Button } from "@zesty-io/core/Button";

import { publishFile, fetchFiles } from "../../../../../../store/files";

import styles from "../EditorActions.less";

export const Publish = React.memo(function Publish(props) {
  const [publishing, setPublishing] = useState(false);

  return (
    <Button
      kind="secondary"
      disabled={publishing}
      onClick={() => {
        setPublishing(true);
        props
          .dispatch(publishFile(props.fileZUID, props.status))
          .finally(() => {
            setPublishing(false);

            props.dispatch(fetchFiles("views"));
            props.dispatch(fetchFiles("stylesheets"));
            props.dispatch(fetchFiles("scripts"));
          });
      }}
    >
      {publishing ? (
        <i className="fas fa-spinner"></i>
      ) : (
        <i className="fas fa-cloud-upload-alt"></i>
      )}
      Publish{" "}
      <span className={styles.HideSmall}>&nbsp;Version {props.version}</span>
    </Button>
  );
});
