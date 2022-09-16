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
    (state: AppState) => state.ui.codeChangesModalZUID
  );
  // TODO fix this
  const fileType = "views";
  return (
    <ConfirmDialog
      title="test"
      open={Boolean(dirtyCodeZuid)}
      content="string"
      callback={(data) => console.log(data)}
    >
      <Button onClick={() => dispatch(actions.closeCodeChangesModal())}>
        Escape
      </Button>
      <Button
        onClick={() => {
          // TODO fix this magic string
          dispatch(saveFile(dirtyCodeZuid, "dev"))
            //@ts-ignore
            .catch((err: Error) => {
              console.error(err);
            })
            .then(() => {
              console.log("unpin");
              dispatch(
                unpinTab(
                  {
                    pathname: `/code/file/${fileType}/${dirtyCodeZuid}`,
                    search: "",
                  },
                  true
                )
              );
            })
            .then(() => {
              console.log("close");
              dispatch(actions.closeCodeChangesModal());
            });
        }}
      >
        Save
      </Button>
      <Button
        onClick={() => {
          dispatch(
            fetchFile(dirtyCodeZuid, fileType, {
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
                    pathname: `/code/file/${fileType}/${dirtyCodeZuid}`,
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
    </ConfirmDialog>
  );
};
