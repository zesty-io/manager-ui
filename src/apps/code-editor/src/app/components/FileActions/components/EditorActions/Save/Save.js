import { useState } from "react";

import { useMetaKey } from "shell/hooks/useMetaKey";

import SaveIcon from "@mui/icons-material/Save";
import { Button } from "@mui/material";

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
      color="primary"
      size="small"
      onClick={onSave}
      loadingPosition="start"
      startIcon={<SaveIcon fontSize="small" />}
      sx={{ mx: 0.5 }}
      loading={saving}
    >
      Save&nbsp;
      <span className={styles.HideSmall}>{metaShortcut}</span>
    </Button>
  );
}
