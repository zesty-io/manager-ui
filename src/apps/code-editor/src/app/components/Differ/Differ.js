import { memo, useRef, useState } from "react";
import { MonacoDiffEditor } from "react-monaco-editor";

import { resolveMonacoLang } from "../../../store/files";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { FileActions } from "../FileActions";

/**
 * We memoize this component because we need to short circuit the redux->react->component update cycle
 * This is done for performance reasons. Constantly re-rendering slows down the editor typing experience.
 * But we still want to broadcast store updates `onChange`
 */
import Box from "@mui/material/Box";
export const Differ = memo(
  function Differ(props) {
    const editorContainerRef = useRef(null);
    const [editorWidth, setEditorWidth] = useState("100%");
    const [loading, setLoading] = useState(false);
    const [versionCodeLeft, setVersionCodeLeft] = useState(
      props.currentCode || ""
    );
    const [versionCodeRight, setVersionCodeRight] = useState(
      props.versionCode || ""
    );

    window.onresize = () => {
      const rects = editorContainerRef.current.getBoundingClientRect();
      setEditorWidth(rects?.width);
    };

    return (
      <Box
        position="relative"
        width="100%"
        height="100%"
        boxSizing="border-box"
      >
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
          <Box
            ref={editorContainerRef}
            position="absolute"
            width="100%"
            height="100%"
            bgcolor="grey.900"
            boxSizing="border-box"
          >
            <MonacoDiffEditor
              width={editorWidth}
              theme="vs-dark"
              original={versionCodeLeft}
              value={versionCodeRight}
              language={resolveMonacoLang(props.fileName)}
              options={{
                selectOnLineNumbers: true,
              }}
            />
          </Box>
        </WithLoader>
      </Box>
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
