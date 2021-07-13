import React, { useState } from "react";
import { MonacoDiffEditor } from "react-monaco-editor";

import { resolveMonacoLang } from "../../../store/files";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { FileActions } from "../FileActions";

/**
 * We memoize this component because we need to short circuit the redux->react->component update cycle
 * This is done for performance reasons. Constantly re-rendering slows down the editor typing experience.
 * But we still want to broadcast store updates `onChange`
 */
import styles from "./Differ.less";
export const Differ = React.memo(
  function Differ(props) {
    const [loading, setLoading] = useState(false);
    const [versionCodeLeft, setVersionCodeLeft] = useState(
      props.currentCode || ""
    );
    const [versionCodeRight, setVersionCodeRight] = useState(
      props.versionCode || ""
    );

    return (
      <main className={styles.Differ}>
        <FileActions
          contentModelZUID={props.contentModelZUID}
          fileZUID={props.fileZUID}
          fileType={props.fileType}
          fileName={props.fileName}
          status={props.status}
          dispatch={props.dispatch}
          publishedVersion={props.publishedVersion}
          setVersionCodeLeft={setVersionCodeLeft}
          setVersionCodeRight={setVersionCodeRight}
          setLoading={setLoading}
          synced={props.synced}
          currentCode={props.currentCode}
        />

        <WithLoader condition={!loading} message="Finding File Versions">
          <div className={styles.EditorLayout}>
            <MonacoDiffEditor
              theme="vs-dark"
              original={versionCodeLeft}
              value={versionCodeRight}
              language={resolveMonacoLang(props.fileName)}
              options={{
                selectOnLineNumbers: true,
              }}
            />
          </div>
        </WithLoader>
      </main>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if open fileZUID changed
    if (prevProps.fileZUID !== nextProps.fileZUID) {
      return false;
    }

    return true;
  }
);
