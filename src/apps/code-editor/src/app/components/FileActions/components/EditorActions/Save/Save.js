import { useState } from "react";

import { useMetaKey } from "shell/hooks/useMetaKey";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faSave } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";

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
    <Button kind="save" onClick={onSave} disabled={saving}>
      {saving ? (
        <FontAwesomeIcon spin icon={faSpinner} />
      ) : (
        <FontAwesomeIcon icon={faSave} />
      )}
      Save&nbsp;
      <span className={styles.HideSmall}>{metaShortcut}</span>
    </Button>
  );
}
