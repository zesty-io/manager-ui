import { memo, useEffect, useState, ReactNode } from "react";
import { usePermission } from "../../../../../../shell/hooks/use-permissions";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { Box, ButtonGroup, Button, Tooltip } from "@mui/material";
import { CheckCircleRounded } from "@mui/icons-material";
import { useMetaKey } from "../../../../../../shell/hooks/useMetaKey";
import { fetchFiles, publishFile, saveFile } from "../../../store/files";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import { useDispatch } from "react-redux";
import { ReactElement } from "react";

interface EditorActionsProps {
  fileZUID: string;
  fileType: string;
  version: string;
  synced: boolean;
  status: string;
  isLive: boolean;
  code: string;
  contentModelZUID?: string;
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

  const isNotSaved = initialCode !== props.code;
  const isUnpublished = !props?.isLive || isNotSaved;
  const saveButtonVariant = isNotSaved ? "contained" : "text";
  const publishButtonVariant =
    isUnpublished || isNotSaved ? "contained" : "text";
  const saveShortcut = useMetaKey("s", () => onSave());
  const publishShortcut = useMetaKey("p", () => onPublish());

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
    >
      <Tooltip
        enterDelay={500}
        enterNextDelay={500}
        title={saveButtonVariant === "text" ? "" : `Save File ${saveShortcut}`}
        placement="bottom"
      >
        <div>
          <LoadingButton
            variant={saveButtonVariant}
            startIcon={
              isNotSaved ? (
                <SaveRoundedIcon fontSize="small" />
              ) : (
                <CheckCircleRounded fontSize="small" />
              )
            }
            color={isNotSaved ? "primary" : "inherit"}
            size="small"
            onClick={onSave}
            loading={isNotSaved && (isSaving || isPublishing)}
            sx={{
              color: isNotSaved ? "primary.contrastText" : "grey.400",
              pointerEvents: isNotSaved ? "auto" : "none",
            }}
            disabled={!canUpdate}
          >
            {isNotSaved ? "Save" : "Saved"}
          </LoadingButton>
        </div>
      </Tooltip>
      <Tooltip
        enterDelay={500}
        enterNextDelay={500}
        title={
          publishButtonVariant === "text"
            ? ""
            : `Publish File ${publishShortcut}`
        }
        placement="bottom"
      >
        <div>
          <ButtonGroup
            variant={publishButtonVariant}
            color="success"
            size="small"
            disabled={isPublishing || !canPublish || !canUpdate}
            sx={{
              "& .MuiButtonGroup-grouped:not(:last-of-type)": {
                ...(!isUnpublished && {
                  border: "none!important",
                  color: "success.main",
                }),
              },
            }}
          >
            <LoadingButton
              variant={publishButtonVariant}
              startIcon={
                isUnpublished ? (
                  <CloudUploadRoundedIcon fontSize="small" />
                ) : (
                  <CheckCircleRounded fontSize="small" />
                )
              }
              size="small"
              onClick={onPublish}
              loading={isPublishing}
              sx={{ pl: 1 }}
              disabled={!isUnpublished}
            >
              {!isUnpublished ? "Published" : "Publish"}
            </LoadingButton>

            <Button
              variant={publishButtonVariant}
              color={isUnpublished ? "success" : "inherit"}
              size="small"
              sx={{
                width: "32px",
              }}
            >
              <ArrowDropDownRoundedIcon fontSize="small" />
            </Button>
          </ButtonGroup>
        </div>
      </Tooltip>
    </Box>
  );
});
