import { memo, useState, useEffect } from "react";
import { connect } from "react-redux";
import { useKeyboardShortcut } from "shell/hooks/useKeyboardShortcut";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faSave } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";

import { saveFile } from "../../../../../../store/files";

import styles from "../EditorActions.less";

export default connect((state) => {
  return {
    platform: state.platform,
  };
})(
  memo(function Save(props) {
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
    // Handle keyboard shortcut Save
    useKeyboardShortcut("s", () => onSave());

    return (
      <Button kind="save" onClick={onSave} disabled={saving}>
        {saving ? (
          <FontAwesomeIcon spin icon={faSpinner} />
        ) : (
          <FontAwesomeIcon icon={faSave} />
        )}
        Save&nbsp;
        <span className={styles.HideSmall}>
          {" "}
          ({props.platform.isMac ? "CMD" : "CTRL"} + S)
        </span>
      </Button>
    );
  })
);
