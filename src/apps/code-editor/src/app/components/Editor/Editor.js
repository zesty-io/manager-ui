import { memo } from "react";

import { FileActions } from "../FileActions";
import { MemoizedEditor } from "./components/MemoizedEditor/MemoizedEditor";

/**
 * We memoize this component because we need to short circuit the redux->react->component update cycle
 * This is done for performance reasons. Constantly re-rendering slows down the editor typing experience.
 * But we still want to broadcast store updates `onChange`
 */
import { Box } from "@mui/material";
export const Editor = memo(function Editor(props) {
  return (
    <>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          flexGrow: 0,
        }}
      >
        <FileActions
          contentModelZUID={props.contentModelZUID}
          fileZUID={props.fileZUID}
          fileType={props.fileType}
          fileName={props.fileName}
          publishedVersion={props.publishedVersion}
          version={props.version}
          synced={props.synced}
          status={props.status}
          dispatch={props.dispatch}
        />
      </Box>
      <Box
        sx={{
          position: "relative",
          width: "100%",
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
          <MemoizedEditor
            dispatch={props.dispatch}
            code={props.code}
            fileName={props.fileName}
            fileZUID={props.fileZUID}
            contentModelZUID={props.contentModelZUID}
            fields={props.fields}
            status={props.status}
            lineNumber={props.lineNumber}
          />
        </Box>
      </Box>
    </>
  );
});
