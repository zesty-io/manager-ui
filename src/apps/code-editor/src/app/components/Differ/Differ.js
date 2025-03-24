import { memo, useState } from "react";
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
    const [loading, setLoading] = useState(false);
    const [versionCodeLeft, setVersionCodeLeft] = useState(
      props.currentCode || ""
    );
    const [versionCodeRight, setVersionCodeRight] = useState(
      props.versionCode || ""
    );

    return (
      <>
        <TopBar
          contentModelZUID={props?.contentModelZUID}
          fileZUID={props?.fileZUID}
          fileType={props?.fileType}
          fileName={props?.fileName}
          status={props.status}
          dispatch={props?.dispatch}
          publishedVersion={props?.publishedVersion}
          setVersionCodeLeft={setVersionCodeLeft}
          setVersionCodeRight={setVersionCodeRight}
          setLoading={setLoading}
          synced={props?.synced}
          currentCode={props?.currentCode}
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
            position="absolute"
            width="100%"
            height="100%"
            boxSizing="border-box"
          >
            <WithLoader condition={!loading} message="Finding File Versions">
              <MonacoDiffEditor
                theme="vs-dark"
                width="100%"
                original={versionCodeLeft}
                value={versionCodeRight}
                language={resolveMonacoLang(props?.fileName)}
                options={{
                  selectOnLineNumbers: true,
                  automaticLayout: true,
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
