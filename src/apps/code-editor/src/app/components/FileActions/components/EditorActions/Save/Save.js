import { useState } from "react";

import { useMetaKey } from "shell/hooks/useMetaKey";

import SaveIcon from "@mui/icons-material/Save";
import LoadingButton from "@mui/lab/LoadingButton";

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
    <LoadingButton
      variant="contained"
      color="success"
      onClick={onSave}
      startIcon={<SaveIcon />}
      sx={{ mx: 0.5 }}
      loading={saving}
    >
      Save&nbsp;
      <span className={styles.HideSmall}>{metaShortcut}</span>
    </LoadingButton>
  );
}
