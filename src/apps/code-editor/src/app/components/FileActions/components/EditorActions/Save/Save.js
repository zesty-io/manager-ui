import React, { useState, useEffect } from "react";

import { Button } from "@zesty-io/core/Button";

import { saveFile, fetchFileVersions } from "../../../../../../store/files";

export const Save = React.memo(function Save(props) {
  const [saving, setSaving] = useState(false);

  const onSave = () => {
    setSaving(true);
    props
      .dispatch(saveFile(props.fileZUID, props.status))
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        setSaving(false);
      });
  };
  const onKeydownSave = evt => {
    if ((evt.metaKey || evt.ctrlKey) && evt.keyCode == 83) {
      evt.preventDefault();
      onSave();
    }
  };
  useEffect(() => {
    window.addEventListener("keydown", onKeydownSave);
    return () => {
      window.removeEventListener("keydown", onKeydownSave);
    };
  });

  return (
    <Button kind="save" onClick={onSave} disabled={saving}>
      {saving ? (
        <i className="fas fa-spinner"></i>
      ) : (
        <i className="fas fa-save"></i>
      )}
      Save (CTL + S)
    </Button>
  );
});
