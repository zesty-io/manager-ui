import { memo } from "react";

import { Save } from "./Save";
import { Publish } from "./Publish";

import { usePermission } from "../../../../../../../../shell/hooks/use-permissions";
import { Box } from "@mui/material";
export const EditorActions = memo(function EditorActions(props) {
  const canPublish = usePermission("PUBLISH");
  return (
    <Box
      display="flex"
      flexDirection="roe"
      justifyContent="space-between"
      alignItems="center"
      columnGap={1}
    >
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
    </Box>
  );
});
