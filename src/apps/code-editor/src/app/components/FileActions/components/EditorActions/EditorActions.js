import { memo } from "react";

import { Save } from "./Save";
import { Publish } from "./Publish";

import styles from "./EditorActions.less";
import { usePermission } from "../../../../../../../../shell/hooks/use-permissions";
export const EditorActions = memo(function EditorActions(props) {
  const canPublish = usePermission("PUBLISH");
  return (
    <div className={styles.EditorActions}>
      <Save
        dispatch={props.dispatch}
        fileZUID={props.fileZUID}
        fileType={props.fileType}
        status={props.status}
      />
      {canPublish && (
        <Publish
          dispatch={props.dispatch}
          fileZUID={props.fileZUID}
          version={props.version}
          status={props.status}
        />
      )}
    </div>
  );
});
