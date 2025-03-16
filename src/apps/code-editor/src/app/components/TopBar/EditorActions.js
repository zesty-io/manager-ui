import { memo, useState } from "react";
import { usePermission } from "../../../../../../shell/hooks/use-permissions";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { Box, ButtonGroup, Button, Tooltip } from "@mui/material";
import { CheckCircleRounded } from "@mui/icons-material";
import { useMetaKey } from "../../../../../../shell/hooks/useMetaKey";
import { fetchFiles, publishFile, saveFile } from "../../../store/files";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import Divider from "@mui/material/Divider";

const EditorActions = memo(function EditorActions(props) {
  const canPublish = usePermission("PUBLISH");
  const canUpdate = usePermission("UPDATE", props?.fileZUID);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [initialCode, setInitialCode] = useState(props.code);

  const isNotSaved = initialCode !== props.code;
  const isUnpublished = !props?.isLive || isNotSaved;
  const saveButtonVariant = isNotSaved ? "contained" : "text";
  const publishButtonVariant =
    isUnpublished || isNotSaved ? "contained" : "text";
  const saveShortcut = useMetaKey("s", () => onSave());
  const publishShortcut = useMetaKey("p", () => onPublish());

  const getUpdatedFiles = () => {
    props.dispatch(fetchFiles("views"));
    props.dispatch(fetchFiles("stylesheets"));
    props.dispatch(fetchFiles("scripts"));
  };

  const onSave = () => {
    setIsSaving(true);
    props
      .dispatch(saveFile(props.fileZUID, props.status))
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        getUpdatedFiles();
        setInitialCode(props.code);
        setIsSaving(false);
      });
  };

  const onPublish = () => {
    setIsPublishing(true);
    props.dispatch(publishFile(props.fileZUID, props.status)).finally(() => {
      getUpdatedFiles();
      setInitialCode(props.code);
      setIsPublishing(false);
    });
  };

  return (
    <>
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
          title={`Save File ${saveShortcut}`}
          placement="bottom"
        >
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
        </Tooltip>

        <ButtonGroup
          variant={publishButtonVariant}
          color="success"
          size="small"
          disabled={isPublishing || !canPublish || !canUpdate}
          sx={{
            "& .MuiButtonGroup-grouped:not(:last-of-type)": {
              ...(!isUnpublished && { border: "none" }),
            },
          }}
        >
          <Tooltip
            enterDelay={500}
            enterNextDelay={500}
            title={`Publish File ${publishShortcut}`}
            placement="bottom"
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
              sx={{
                pointerEvents: isUnpublished ? "auto" : "none",
                pl: 1,
              }}
            >
              {!isUnpublished ? "Published" : "Publish"}
            </LoadingButton>
          </Tooltip>
          <Button
            variant={publishButtonVariant}
            color={isUnpublished ? "success" : "inherit"}
            size={isUnpublished ? "xsmall" : "small"}
            sx={{
              width: 32,
              minWidth: "unset !important",
            }}
          >
            <ArrowDropDownRoundedIcon fontSize="small" />
          </Button>
        </ButtonGroup>
      </Box>
    </>
  );
});

export default EditorActions;
