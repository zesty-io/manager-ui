import { memo, useState, useRef } from "react";
import { MonacoDiffEditor } from "react-monaco-editor";

import { resolveMonacoLang } from "../../../store/files";

import { WithLoader } from "@zesty-io/core/WithLoader";

/**
 * We memoize this component because we need to short circuit the redux->react->component update cycle
 * This is done for performance reasons. Constantly re-rendering slows down the editor typing experience.
 * But we still want to broadcast store updates `onChange`
 */
import { Box } from "@mui/system";
import { TopBar } from "../TopBar";

export const Differ = memo(
  function Differ(props) {
    const editorContainerRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [editorWidth, setEditorWidth] = useState("100%");
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
      <>
        <TopBar
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
          isDiffer={true}
        />
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "calc(100% - 84px)",
            flexGrow: 1,
            boxSizing: "border-box",
          }}
        >
          <Box
            ref={editorContainerRef}
            position="absolute"
            width="100%"
            height="100%"
            boxSizing="border-box"
          >
            <WithLoader condition={!loading} message="Finding File Versions">
              <MonacoDiffEditor
                theme="vs-dark"
                width={editorWidth}
                original={versionCodeLeft}
                value={versionCodeRight}
                language={resolveMonacoLang(props.fileName)}
                options={{
                  selectOnLineNumbers: true,
                }}
              />
            </WithLoader>
          </Box>
        </Box>
      </>
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
