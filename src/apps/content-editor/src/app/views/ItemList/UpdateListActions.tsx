import { Button, Box, ButtonGroup, Typography, Tooltip } from "@mui/material";
import { Database, IconButton } from "@zesty-io/material";
import {
  SaveRounded,
  CloseRounded,
  CloudUploadRounded,
} from "@mui/icons-material";
import { forwardRef, useState } from "react";
import { useHistory, useParams as useRouterParams } from "react-router";
import { useFilePath } from "../../../../../../shell/hooks/useFilePath";
import { useParams } from "../../../../../../shell/hooks/useParams";
import { useStagedChanges } from "./StagedChangesContext";
import { LoadingButton } from "@mui/lab";
import {
  useGetContentModelItemsQuery,
  useUpdateContentItemsMutation,
} from "../../../../../../shell/services/instance";
import { useMetaKey } from "../../../../../../shell/hooks/useMetaKey";

export const UpdateListActions = () => {
  const { modelZUID } = useRouterParams<{ modelZUID: string }>();
  const { data: items, isFetching: isModelItemsFetching } =
    useGetContentModelItemsQuery(modelZUID);
  const { stagedChanges, updateStagedChanges, clearStagedChanges } =
    useStagedChanges();

  const [updateContentItems, { isLoading: isSaving }] =
    useUpdateContentItemsMutation();

  const saveShortcut = useMetaKey("s", () => {
    handleSave();
  });

  const handleSave = async () => {
    try {
      await updateContentItems({
        modelZUID,
        body: Object.entries(stagedChanges).map(([id, changes]: any) => {
          const item = items.find((item) => item.meta.ZUID === id);
          return {
            ...item,
            data: {
              ...item.data,
              ...changes,
            },
          };
        }),
      });
      clearStagedChanges({});
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
    >
      <Box display={"flex"} gap={1.5} alignItems="center">
        <IconButton
          size="small"
          sx={{
            width: "20px",
            height: "20px",
          }}
          onClick={() => {
            clearStagedChanges({});
          }}
        >
          <CloseRounded />
        </IconButton>
        <Typography variant="h3" fontWeight={700}>
          Update {Object.keys(stagedChanges)?.length} Content Items
        </Typography>
      </Box>
      <Box>
        <Tooltip
          enterDelay={1000}
          enterNextDelay={1000}
          title={
            <div>
              Save Item <br />
              {saveShortcut}
            </div>
          }
        >
          <LoadingButton
            variant="contained"
            startIcon={<SaveRounded />}
            size="small"
            onClick={handleSave}
            loading={isSaving}
          >
            Save
          </LoadingButton>
        </Tooltip>
        {/* <ButtonGroup
          variant="contained"
          color="success"
          size="small"
          sx={{
            "& .MuiButtonGroup-grouped:not(:last-of-type)": {
              borderColor: "green.600",
            },
          }}
        >
          <LoadingButton
            startIcon={<CloudUploadRounded />}
            sx={{
              color: "common.white",
              whiteSpace: "nowrap",
            }}
            onClick={() => {
             
            }}
            loading={publishing || publishAfterSave || isFetching}
            color="success"
            variant="contained"
            id="PublishButton"
            data-cy="PublishButton"
          >
            {itemState === ITEM_STATES.dirty ? "Save & Publish" : "Publish"}
          </LoadingButton>
          <Button
            sx={{
              color: "common.white",
              width: 32,
              // Override MUI default minWidth of 40px one-off
              minWidth: "unset !important",
            }}
            onClick={(e) => {
              setPublishMenu(e.currentTarget);
            }}
            disabled={publishing || publishAfterSave || isFetching}
            data-cy="PublishMenuButton"
          >
            <ArrowDropDownRounded fontSize="small" />
          </Button>
        </ButtonGroup> */}
      </Box>
    </Box>
  );
};
