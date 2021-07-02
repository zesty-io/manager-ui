import { memo, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt, faSpinner } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";

import { publishFile, fetchFiles } from "../../../../../../store/files";

import styles from "../EditorActions.less";

export const Publish = memo(function Publish(props) {
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
        <FontAwesomeIcon spin icon={faSpinner} />
      ) : (
        <FontAwesomeIcon icon={faCloudUploadAlt} />
      )}
      Publish{" "}
      <span className={styles.HideSmall}>&nbsp;Version {props.version}</span>
    </Button>
  );
});
