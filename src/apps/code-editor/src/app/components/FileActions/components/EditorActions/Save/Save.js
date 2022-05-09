import { useState } from "react";

import { useMetaKey } from "shell/hooks/useMetaKey";

import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import CircularProgress from "@mui/material/CircularProgress";

import { saveFile } from "../../../../../../store/files";

import styles from "../EditorActions.less";

export function Save(props) {
  const [saving, setSaving] = useState(false);

  const onSave = () => {
    setSaving(true);
    props
      .dispatch(saveFile(props.fileZUID, props.status))
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const metaShortcut = useMetaKey("s", onSave);

  return (
    <Button
      variant="contained"
      color="success"
      onClick={onSave}
      disabled={saving}
      startIcon={saving ? <CircularProgress /> : <SaveIcon />}
      sx={{ my: 0, mx: 0.5 }}
    >
      Save&nbsp;
      <span className={styles.HideSmall}>{metaShortcut}</span>
    </Button>
  );
}
