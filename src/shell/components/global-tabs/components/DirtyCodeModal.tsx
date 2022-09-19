import { useState, FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ConfirmDialog } from "@zesty-io/material";
import Button from "@mui/material/Button";
import { unpinTab } from "../../../../shell/store/ui";
import { actions } from "../../../../shell/store/ui";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import {
  saveFile,
  fetchFile,
} from "../../../../apps/code-editor/src/store/files";
export type DirtyCodeModal = {
  dirtyCodeZuid: string;
  dirtyCodeStatus: string;
  dirtyCodeFileType: string;
};
export const DirtyCodeModal: FC<DirtyCodeModal> = ({
  dirtyCodeZuid,
  dirtyCodeStatus,
  dirtyCodeFileType,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  return (
    <ConfirmDialog
      title="Unsaved Changes"
      open={Boolean(dirtyCodeZuid)}
      content="Please save or discard your changes before navigating away"
      callback={(data) => console.log(data)}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "flex-start",
          flexDirection: "row",
          justifyContent: "space-between",
          flex: 1,
        }}
      >
        <Button
          variant="text"
          onClick={() => dispatch(actions.closeCodeChangesModal())}
          color="primary"
          disabled={loading}
          sx={{ alignSelf: "flex-start" }}
        >
          Escape
        </Button>
        <Box>
          <Button
            variant="text"
            color="error"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await dispatch(
                fetchFile(dirtyCodeZuid, dirtyCodeFileType, {
                  forceSync: true,
                })
              );
              await dispatch({
                type: "UNMARK_FILE_DIRTY",
                payload: { ZUID: dirtyCodeZuid },
              });
              await dispatch(
                unpinTab(
                  {
                    pathname: `/code/file/${dirtyCodeFileType}/${dirtyCodeZuid}`,
                    search: "",
                  },
                  true
                )
              );
              setLoading(false);
              await dispatch(actions.closeCodeChangesModal());
            }}
          >
            Discard
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={loading}
            onClick={async () => {
              await dispatch(saveFile(dirtyCodeZuid, dirtyCodeStatus));
              await dispatch(
                unpinTab(
                  {
                    pathname: `/code/file/${dirtyCodeFileType}/${dirtyCodeZuid}`,
                    search: "",
                  },
                  true
                )
              );
              setLoading(false);
              await dispatch(actions.closeCodeChangesModal());
            }}
          >
            Save
          </Button>
        </Box>
      </Stack>
    </ConfirmDialog>
  );
};
