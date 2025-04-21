import { memo } from "react";
import { Box } from "@mui/material";
import { MemoizedEditor } from "./components/MemoizedEditor/MemoizedEditor";
import { TopBar } from "../TopBar";
/**
 * We memoize this component because we need to short circuit the redux->react->component update cycle
 * This is done for performance reasons. Constantly re-rendering slows down the editor typing experience.
 * But we still want to broadcast store updates `onChange`
 */

export const Editor = memo(function Editor(props) {
  return (
    <>
      <TopBar
        contentModelZUID={props.contentModelZUID}
        fileZUID={props.fileZUID}
        fileType={props.fileType}
        fileName={props.fileName}
        publishedVersion={props.publishedVersion}
        version={props.version}
        synced={props.synced}
        status={props.status}
        isLive={props.isLive}
        isDirty={props.isDirty}
        code={props.code}
        updatedAt={props.updatedAt}
        updatedBy={props.updatedBy}
        publishedAt={props.publishedAt}
        publishedBy={props.publishedBy}
        icon={props.icon}
        isDiffer={false}
      />

      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "calc(100% - 64px)",
          flexGrow: 1,
          boxSizing: "border-box",
        }}
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
    </>
  );
});
