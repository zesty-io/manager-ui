import { memo, useEffect, useLayoutEffect, useRef, useState, FC } from "react";
import { createDispatchHook, useDispatch, useSelector } from "react-redux";
import { ConfirmDialog } from "@zesty-io/material";
import Button from "@mui/material/Button";
import {
  unpinTab,
  unpinManyTabs,
  loadTabs,
  rebuildTabs,
  tabLocationEquality,
  setDocumentTitle,
} from "../../../../shell/store/ui";
import { actions } from "../../../../shell/store/ui";
import { AppState } from "../../../store/types";

import {
  saveFile,
  fetchFile,
} from "../../../../apps/code-editor/src/store/files";
export const DirtyCodeModal: FC = () => {
  const dispatch = useDispatch();
  const dirtyCodeZuid = useSelector(
    (state: AppState) => state.ui.codeChangesModal?.ZUID
  );
  const dirtyCodeStatus = useSelector(
    (state: AppState) => state.ui.codeChangesModal?.status
  );
  const dirtyCodeFileType = useSelector(
    (state: AppState) => state.ui.codeChangesModal?.fileType
  );

  return (
    <ConfirmDialog
      title="Unsaved Changes"
      open={Boolean(dirtyCodeZuid)}
      content="Please save or discard your changes before navigating away"
      callback={(data) => console.log(data)}
    >
      <Button
        variant="text"
        onClick={() => dispatch(actions.closeCodeChangesModal())}
        color="primary"
      >
        Escape
      </Button>
      <Button
        variant="text"
        color="error"
        onClick={() => {
          dispatch(
            fetchFile(dirtyCodeZuid, dirtyCodeFileType, {
              forceSync: true,
            })
          )
            //@ts-ignore
            .then(() => {
              dispatch({
                type: "UNMARK_FILE_DIRTY",
                payload: { ZUID: dirtyCodeZuid },
              });
            })
            .then(() => {
              dispatch(
                unpinTab(
                  {
                    pathname: `/code/file/${dirtyCodeFileType}/${dirtyCodeZuid}`,
                    search: "",
                  },
                  true
                )
              );
            })
            .then(() => {
              dispatch(actions.closeCodeChangesModal());
            });
        }}
      >
        Discard
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={() => {
          dispatch(saveFile(dirtyCodeZuid, dirtyCodeStatus))
            //@ts-ignore
            .catch((err: Error) => {
              console.error(err);
            })
            .then(() => {
              dispatch(
                unpinTab(
                  {
                    pathname: `/code/file/${dirtyCodeFileType}/${dirtyCodeZuid}`,
                    search: "",
                  },
                  true
                )
              );
            })
            .then(() => {
              dispatch(actions.closeCodeChangesModal());
            });
        }}
      >
        Save
      </Button>
    </ConfirmDialog>
  );
};
