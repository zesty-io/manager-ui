import { FC, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../../store/types";
import { useTranslation } from "react-i18next";

import { DirtyCodeModal } from "../../DirtyCodeModal";

import {
  saveFile,
  fetchFile,
} from "../../../../apps/code-editor/src/store/files";
import { unpinTab } from "../../../../shell/store/ui";
import { actions } from "../../../../shell/store/ui";

export const GlobalDirtyCodeModal: FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
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
    <DirtyCodeModal
      title={t("common.unsavedChanges", { defaultValue: "Unsaved Changes" })}
      content={t("shell.unsavedChangesBody", {
        defaultValue:
          "Please save or discard your changes before unpinning this tab",
      })}
      loading={loading}
      open={Boolean(dirtyCodeZuid)}
      onDiscard={async () => {
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
      onCancel={() => dispatch(actions.closeCodeChangesModal())}
      onSave={async () => {
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
    />
  );
};
