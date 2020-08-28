import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import { Button } from "@zesty-io/core/Button";

import { saveFile } from "../../../../../../store/files";

export default connect(state => {
  return {
    platform: state.platform
  };
})(
  React.memo(function Save(props) {
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
      if (
        ((props.platform.isMac && evt.metaKey) ||
          (!props.platform.isMac && evt.ctrlKey)) &&
        evt.key == "s"
      ) {
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
        Save ({props.platform.isMac ? "CMD" : "CTRL"} + S)
      </Button>
    );
  })
);
