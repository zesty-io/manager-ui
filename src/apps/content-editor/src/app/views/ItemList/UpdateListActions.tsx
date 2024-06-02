import {
  Box,
  ButtonGroup,
  Button,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { IconButton } from "@zesty-io/material";
import {
  SaveRounded,
  CloseRounded,
  CloudUploadRounded,
  ArrowDropDownRounded,
  CalendarTodayRounded,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useParams as useRouterParams } from "react-router";
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
import { useSelectedItems } from "./SelectedItemsContext";
import { SchedulePublishesModal } from "./SchedulePublishesModal";

export const UpdateListActions = () => {
  const { modelZUID } = useRouterParams<{ modelZUID: string }>();
  const [params, setParams] = useParams();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null);
  const langCode = params.get("lang");
  const [itemsToPublish, setItemsToPublish] = useState<string[]>([]);
  const [itemsToSchedule, setItemsToSchedule] = useState<string[]>([]);
  const { data: items } = useGetContentModelItemsQuery({
    modelZUID,
    params: {
      lang: langCode,
    },
  });
  const [showPublishesModal, setShowPublishesModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const { stagedChanges, updateStagedChanges, clearStagedChanges } =
    useStagedChanges();
  const [selectedItems, setSelectedItems] = useSelectedItems();

  const [updateContentItems, { isLoading: isSaving }] =
    useUpdateContentItemsMutation();

  const [createItemsPublishing, { isLoading: isPublishing }] =
    useCreateItemsPublishingMutation();

  const saveShortcut = useMetaKey("s", () => {
    handleSave();
  });

  const publishShortcut = useMetaKey("p", () => {
    if (hasStagedChanges) {
      handleSaveAndPublish();
    } else {
      setItemsToPublish(selectedItems);
    }
  });

  const hasStagedChanges = Object.keys(stagedChanges).length > 0;

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

  const handleSaveAndPublish = async (isSchedule = false) => {
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

      if (isSchedule) {
        // @ts-ignore
        setItemsToSchedule([...response?.data?.data]);
      } else {
        // @ts-ignore
        setItemsToPublish([...response?.data?.data]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (itemsToPublish.length) {
      setShowPublishesModal(true);
    }
  }, [itemsToPublish]);

  useEffect(() => {
    if (itemsToSchedule.length) {
      setShowScheduleModal(true);
    }
  }, [itemsToSchedule]);

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
              setSelectedItems([]);
            }}
          >
            <CloseRounded />
          </IconButton>
          <Typography variant="h3" fontWeight={700}>
            {hasStagedChanges
              ? ` Update ${Object.keys(stagedChanges)?.length} Content Items`
              : `${selectedItems?.length} selected`}
          </Typography>
        </Box>
        <Box display="flex" gap={1} alignItems="center">
          {hasStagedChanges ? (
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
                data-cy="MultiPageTableSaveChanges"
                variant="contained"
                startIcon={<SaveRounded />}
                size="small"
                onClick={handleSave}
                loading={isSaving}
              >
                Save
              </LoadingButton>
            </Tooltip>
          ) : (
            <Button>delete</Button>
          )}
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
                  {hasStagedChanges ? "Save & Publish Items" : "Publish Items"}{" "}
                  <br />
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
                  if (hasStagedChanges) {
                    handleSaveAndPublish();
                  } else {
                    setItemsToPublish(selectedItems);
                  }
                }}
                loading={isPublishing || isSaving}
                color="success"
                variant="contained"
                id="PublishButton"
                data-cy="PublishButton"
              >
                {hasStagedChanges ? "Save & Publish" : "Publish"}
              </LoadingButton>
            </Tooltip>
            <Button
              sx={{
                color: "common.white",
                width: 32,
                // Override MUI default minWidth of 40px one-off
                minWidth: "unset !important",
              }}
              onClick={(event) => {
                setAnchorEl(event.currentTarget);
              }}
              disabled={isPublishing || isSaving}
            >
              <ArrowDropDownRounded fontSize="small" />
            </Button>
          </ButtonGroup>
          <Menu
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: -8,
              horizontal: "right",
            }}
            anchorEl={anchorEl}
            open={!!anchorEl}
          >
            <MenuItem
              onClick={() => {
                if (hasStagedChanges) {
                  handleSaveAndPublish();
                } else {
                  setItemsToPublish(selectedItems);
                }
                setAnchorEl(null);
              }}
            >
              <ListItemIcon>
                <CloudUploadRounded fontSize="small" />
              </ListItemIcon>
              {hasStagedChanges ? "Save & Publish Now" : "Publish Now"}
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (hasStagedChanges) {
                  handleSaveAndPublish(true);
                } else {
                  setItemsToSchedule(selectedItems);
                }
                setAnchorEl(null);
              }}
            >
              <ListItemIcon>
                <CalendarTodayRounded fontSize="small" />
              </ListItemIcon>
              {hasStagedChanges
                ? "Save & Schedule Publish"
                : "Schedule Publish"}
            </MenuItem>
          </Menu>
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
              setSelectedItems([]);
              setShowPublishesModal(false);
            });
          }}
        />
      )}
      {showScheduleModal && (
        <SchedulePublishesModal
          items={itemsToSchedule?.map((itemZUID) =>
            items?.find((item) => item.meta.ZUID === itemZUID)
          )}
          onCancel={() => {
            setItemsToSchedule([]);
            clearStagedChanges({});
            setShowScheduleModal(false);
          }}
          onConfirm={(items, publishDateTime) => {
            createItemsPublishing({
              modelZUID,
              body: items?.map((item) => {
                return {
                  ZUID: item.meta.ZUID,
                  version: item.meta.version,
                  publishAt: publishDateTime ? publishDateTime : "now",
                  unpublishAt: "never",
                };
              }),
            }).then(() => {
              setItemsToSchedule([]);
              clearStagedChanges({});
              setSelectedItems([]);
              setShowScheduleModal(false);
            });
          }}
        />
      )}
    </>
  );
};
