import { FC } from "react";
import { useSelector } from "react-redux";
import { AppState } from "../../../store/types";

import { DirtyCodeModal } from "./DirtyCodeModal";
export const GlobalDirtyCodeModal: FC = () => {
  const dirtyCodeZuid = useSelector(
    (state: AppState) => state.ui.codeChangesModal?.ZUID
  );
  const dirtyCodeStatus = useSelector(
    (state: AppState) => state.ui.codeChangesModal?.status
  );
  const dirtyCodeFileType = useSelector(
    (state: AppState) => state.ui.codeChangesModal?.fileType
  );

  const props = {
    dirtyCodeFileType,
    dirtyCodeStatus,
    dirtyCodeZuid,
  };
  return <DirtyCodeModal {...props} />;
};
