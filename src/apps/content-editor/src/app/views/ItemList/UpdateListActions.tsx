import { Button, Box, ButtonGroup, Typography, Tooltip } from "@mui/material";
import { Database, IconButton } from "@zesty-io/material";
import {
  SaveRounded,
  CloseRounded,
  CloudUploadRounded,
} from "@mui/icons-material";
import { forwardRef, useEffect, useState } from "react";
import { useHistory, useParams as useRouterParams } from "react-router";
import { useFilePath } from "../../../../../../shell/hooks/useFilePath";
import { useParams } from "../../../../../../shell/hooks/useParams";
import { useStagedChanges } from "./StagedChangesContext";
import { LoadingButton } from "@mui/lab";
import {
  useCreateItemsPublishingMutation,
  useGetContentModelItemsQuery,
  useUpdateContentItemsMutation,
} from "../../../../../../shell/services/instance";
import { useMetaKey } from "../../../../../../shell/hooks/useMetaKey";
import { ConfirmPublishesModal } from "./ConfirmPublishesModal";

export const UpdateListActions = () => {
  const { modelZUID } = useRouterParams<{ modelZUID: string }>();
  const [params, setParams] = useParams();
  const langCode = params.get("lang");
  const [itemsToPublish, setItemsToPublish] = useState<string[]>([]);
  const { data: items } = useGetContentModelItemsQuery({
    modelZUID,
    params: {
      lang: langCode,
    },
  });
  const [showPublishesModal, setShowPublishesModal] = useState(false);
  const { stagedChanges, updateStagedChanges, clearStagedChanges } =
    useStagedChanges();

  const [updateContentItems, { isLoading: isSaving }] =
    useUpdateContentItemsMutation();

  const [createItemsPublishing, { isLoading: isPublishing }] =
    useCreateItemsPublishingMutation();

  const saveShortcut = useMetaKey("s", () => {
    handleSave();
  });

  const publishShortcut = useMetaKey("p", () => {
    handlePublish();
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

  const handlePublish = async () => {
    try {
      const response = await updateContentItems({
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
      // @ts-ignore
      setItemsToPublish([...response?.data?.data]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (itemsToPublish.length) {
      setShowPublishesModal(true);
    }
  }, [itemsToPublish, items]);

  return (
    <>
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
            Update {Object.keys(stagedChanges)?.length} Content Item
          </Typography>
        </Box>
        <Box display="flex" gap={1} alignItems="center">
          <Tooltip
            enterDelay={1000}
            enterNextDelay={1000}
            title={
              <div>
                Save Items <br />
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
          <ButtonGroup
            variant="contained"
            color="success"
            size="small"
            sx={{
              "& .MuiButtonGroup-grouped:not(:last-of-type)": {
                borderColor: "green.600",
              },
            }}
          >
            <Tooltip
              enterDelay={1000}
              enterNextDelay={1000}
              title={
                <div>
                  Save & Publish Items <br />
                  {publishShortcut}
                </div>
              }
            >
              <LoadingButton
                startIcon={<CloudUploadRounded />}
                sx={{
                  color: "common.white",
                  whiteSpace: "nowrap",
                }}
                onClick={() => {
                  handlePublish();
                }}
                loading={isPublishing || isSaving}
                color="success"
                variant="contained"
                id="PublishButton"
                data-cy="PublishButton"
              >
                Save & Publish
              </LoadingButton>
            </Tooltip>
            {/* <Button
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
          </Button> */}
          </ButtonGroup>
        </Box>
      </Box>
      {showPublishesModal && (
        <ConfirmPublishesModal
          items={itemsToPublish?.map((itemZUID) =>
            items?.find((item) => item.meta.ZUID === itemZUID)
          )}
          onCancel={() => {
            setItemsToPublish([]);
            clearStagedChanges({});
            setShowPublishesModal(false);
          }}
          onConfirm={(items) => {
            createItemsPublishing({
              modelZUID,
              body: items?.map((item) => {
                return {
                  ZUID: item.meta.ZUID,
                  version: item.meta.version,
                  publishAt: "now",
                  unpublishAt: "never",
                };
              }),
            }).then(() => {
              setItemsToPublish([]);
              clearStagedChanges({});
              setShowPublishesModal(false);
            });
          }}
        />
      )}
    </>
  );
};
