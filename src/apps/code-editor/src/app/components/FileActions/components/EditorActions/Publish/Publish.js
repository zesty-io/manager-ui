import { memo, useState } from "react";

import UploadIcon from "@mui/icons-material/Upload";
import LoadingButton from "@mui/lab/LoadingButton";

import { publishFile, fetchFiles } from "../../../../../../store/files";

import styles from "../EditorActions.less";

export const Publish = memo(function Publish(props) {
  const [publishing, setPublishing] = useState(false);

  return (
    <LoadingButton
      variant="contained"
      color="secondary"
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
      loading={publishing}
      startIcon={<UploadIcon />}
    >
      Publish
      <span className={styles.HideSmall}>&nbsp;Version {props.version}</span>
    </LoadingButton>
  );
});
