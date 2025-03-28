import { memo, useEffect, useState, ReactNode } from "react";
import { usePermission } from "../../../../../../shell/hooks/use-permissions";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { Box } from "@mui/material";
import { CheckCircleRounded } from "@mui/icons-material";
import { useMetaKey } from "../../../../../../shell/hooks/useMetaKey";
import { fetchFiles, publishFile, saveFile } from "../../../store/files";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import { useDispatch } from "react-redux";
import { ReactElement } from "react";
import { ActionButton } from "./ActionButton";
import { formatDate } from "../../../../../../utility/formatDate";

interface EditorActionsProps {
  fileZUID: string;
  fileType: string;
  version?: number;
  synced: boolean;
  status: string;
  isLive: boolean;
  code?: string;
  contentModelZUID?: string;
  publishedVersion?: number;
  isDirty: boolean;
  updatedAt?: string;
  publishedAt?: string;
  lastEditedBy?: {
    ID: string;
    name: string;
    ZUID: string;
    email: string;
  } | null;
}

export const EditorActions = memo(function EditorActions(
  props: EditorActionsProps
) {
  const dispatch = useDispatch();
  const canPublish = usePermission("PUBLISH");
  const canUpdate = usePermission("UPDATE", props?.fileZUID);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [fileZUID, setFileZUID] = useState(null);
  const [initialCode, setInitialCode] = useState(props.code);

  const isNotSaved = initialCode !== props.code || !!props?.isDirty;
  const isUnpublished = !props?.isLive || isNotSaved;
  const saveShortcut = useMetaKey("s", () => onSave());
  const publishShortcut = useMetaKey("p", () => onPublish());

  const fileLastUpdate =
    formatDate(props?.updatedAt).includes("Today") ||
    formatDate(props?.updatedAt).includes("Yesterday");

  const getUpdatedFiles = () => {
    dispatch(fetchFiles("views"));
    dispatch(fetchFiles("stylesheets"));
    dispatch(fetchFiles("scripts"));
  };

  const onSave = async () => {
    setIsSaving(true);

    try {
      await Promise.resolve(dispatch(saveFile(props.fileZUID, props.status)));
    } finally {
      getUpdatedFiles();
      setInitialCode(props.code);
      setIsSaving(false);
    }
  };
  const onPublish = async () => {
    setIsPublishing(true);

    try {
      if (isNotSaved) {
        await Promise.resolve(dispatch(saveFile(props.fileZUID, props.status)));
      }
      await Promise.resolve(
        dispatch(publishFile(props.fileZUID, props.status))
      );
    } finally {
      getUpdatedFiles();
      setInitialCode(props.code);
      setIsPublishing(false);
    }
  };
  useEffect(() => {
    if (props.fileZUID !== fileZUID) {
      setInitialCode(props?.code);
      setFileZUID(props.fileZUID);
    }
  }, [props.fileZUID, props?.code, fileZUID]);

  return (
    <Box
      display="flex"
      gap={1}
      alignItems="center"
      sx={{ color: "grey.300" }}
      color="grey.300"
      pl={isNotSaved ? 1 : 0}
    >
      <ActionButton
        label={isNotSaved ? "Save" : "Saved"}
        color="primary"
        variant="contained"
        size="small"
        startIcon={<SaveRoundedIcon fontSize="small" />}
        tooltip={
          isNotSaved
            ? `Save File ${saveShortcut}`
            : `v${props?.version} saved ${!fileLastUpdate ? "" : "on"}
              ${formatDate(props?.updatedAt)}
              by ${props?.lastEditedBy?.name || "Unknown"}
           `
        }
        isActive={isNotSaved}
        isLoading={isNotSaved && (isSaving || isPublishing)}
        onClick={onSave}
        isDisabled={!canUpdate}
      />

      <ActionButton
        label={isUnpublished ? "Publish" : "Published"}
        color="success"
        inActiveColor="success.main"
        variant="contained"
        size="small"
        startIcon={<CloudUploadRoundedIcon fontSize="small" />}
        tooltip={
          isUnpublished
            ? `Publish File ${publishShortcut}`
            : `v${props?.version} published ${!props?.publishedAt ? "" : "on"}
              ${formatDate(props?.publishedAt)}
              by ${props?.lastEditedBy?.name || "Unknown"}
           `
        }
        isActive={isUnpublished}
        isLoading={isUnpublished && isPublishing}
        onClick={onPublish}
        isDisabled={!canPublish}
      />
    </Box>
  );
});
