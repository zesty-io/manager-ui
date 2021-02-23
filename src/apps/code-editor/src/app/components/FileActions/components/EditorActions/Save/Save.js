import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faSave } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";

import { saveFile } from "../../../../../../store/files";

import styles from "../EditorActions.less";

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
          <FontAwesomeIcon icon={faSpinner} />
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
