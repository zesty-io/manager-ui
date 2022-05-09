import { memo, useState } from "react";

import Button from "@mui/material/Button";
import UploadIcon from "@mui/icons-material/Upload";
import CircularProgress from "@mui/material/CircularProgress";

import { publishFile, fetchFiles } from "../../../../../../store/files";

import styles from "../EditorActions.less";

export const Publish = memo(function Publish(props) {
  const [publishing, setPublishing] = useState(false);

  return (
    <Button
      variant="contained"
      color="secondary"
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
      startIcon={publishing ? <CircularProgress /> : <UploadIcon />}
    >
      Publish
      <span className={styles.HideSmall}>&nbsp;Version {props.version}</span>
    </Button>
  );
});
