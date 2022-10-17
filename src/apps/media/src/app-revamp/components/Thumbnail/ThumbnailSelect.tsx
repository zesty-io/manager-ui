import { useDispatch, useSelector } from "react-redux";

import { Checkbox } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import {
  deselectFile,
  selectFile,
  State,
} from "../../../../../../shell/store/media-revamp";

import { File } from "../../../../../../shell/services/types";

export function ThumbnailSelect({ file }: { file: File }) {
  const dispatch = useDispatch();

  const selectedFiles = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.selectedFiles
  );
  const checked = selectedFiles.some((f) => f.id === file.id);

  const isSelectDialog = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.isSelectDialog
  );

  console.log("selection", isSelectDialog);

  return isSelectDialog ? (
    <Checkbox
      sx={{
        // display: checked ? "block" : "none",
        position: "absolute",
        top: 8,
        right: 8,
        padding: 0,
      }}
      checked={checked}
      icon={<CheckCircleIcon sx={{ color: "common.white" }} />}
      checkedIcon={
        <CheckCircleIcon
          sx={{ backgroundColor: "common.white", borderRadius: "100%" }}
          color="primary"
        />
      }
      onChange={(evt, checked) => {
        if (checked) {
          dispatch(selectFile(file));
        } else {
          dispatch(deselectFile(file));
        }
      }}
      onClick={(evt) => evt.stopPropagation()}
    />
  ) : null;
}
