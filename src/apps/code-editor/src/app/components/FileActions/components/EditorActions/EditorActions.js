import { memo } from "react";

import { Save } from "./Save";
import { Publish } from "./Publish";

import styles from "./EditorActions.less";
export const EditorActions = memo(function EditorActions(props) {
  return (
    <div className={styles.EditorActions}>
      <Save
        dispatch={props.dispatch}
        fileZUID={props.fileZUID}
        fileType={props.fileType}
        status={props.status}
      />
      <Publish
        dispatch={props.dispatch}
        fileZUID={props.fileZUID}
        version={props.version}
        status={props.status}
      />
    </div>
  );
});
