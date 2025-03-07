import { useState } from "react";

import { useMetaKey } from "shell/hooks/useMetaKey";

import SaveIcon from "@mui/icons-material/Save";
import LoadingButton from "@mui/lab/LoadingButton";

import { saveFile } from "../../../../../../store/files";
import { Tooltip } from "@mui/material";

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
    <Tooltip title={metaShortcut}>
      <LoadingButton
        variant="contained"
        color="primary"
        size="small"
        onClick={onSave}
        loadingPosition="start"
        startIcon={<SaveIcon fontSize="small" />}
        sx={{ px: 1 }}
        loading={saving}
      >
        Save
      </LoadingButton>
    </Tooltip>
  );
}
