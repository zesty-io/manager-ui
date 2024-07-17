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
  DeleteRounded,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useParams as useRouterParams } from "react-router";
import { useStagedChanges } from "./StagedChangesContext";
import { LoadingButton } from "@mui/lab";
import {
  useCreateItemsPublishingMutation,
  useDeleteContentItemsMutation,
  useUpdateContentItemsMutation,
} from "../../../../../../shell/services/instance";
import { useMetaKey } from "../../../../../../shell/hooks/useMetaKey";
import { ConfirmPublishesModal } from "./ConfirmPublishesDialog";
import { useSelectedItems } from "./SelectedItemsContext";
import { SchedulePublishesModal } from "./SchedulePublishesDialog";
import { ConfirmDeletesDialog } from "./ConfirmDeletesDialog";
import { notify } from "../../../../../../shell/store/notifications";
import { useDispatch } from "react-redux";
import { usePermission } from "../../../../../../shell/hooks/use-permissions";
import { ContentItem } from "../../../../../../shell/services/types";
import {
  fetchItem,
  fetchItemPublishings,
} from "../../../../../../shell/store/content";

type UpdateListActionsProps = {
  items: ContentItem[];
};

export const UpdateListActions = ({ items }: UpdateListActionsProps) => {
  const { modelZUID } = useRouterParams<{ modelZUID: string }>();
  const canPublish = usePermission("PUBLISH");
  const canDelete = usePermission("DELETE");
  const canUpdate = usePermission("UPDATE");
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null);
  const [itemsToPublish, setItemsToPublish] = useState<string[]>([]);
  const [itemsToSchedule, setItemsToSchedule] = useState<string[]>([]);
  const [showPublishesModal, setShowPublishesModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDeletesModal, setShowDeletesModal] = useState(false);
  const { stagedChanges, updateStagedChanges, clearStagedChanges } =
    useStagedChanges();
  const [selectedItems, setSelectedItems] = useSelectedItems();

  const [updateContentItems] = useUpdateContentItemsMutation();

  const [createItemsPublishing] = useCreateItemsPublishingMutation();

  const [deleteContentItems, { isLoading: isDeleting }] =
    useDeleteContentItemsMutation();

  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const saveShortcut = useMetaKey("s", () => {
    handleSave();
  });

  const publishShortcut = useMetaKey("p", () => {
    if (!canPublish) return;
    if (hasStagedChanges) {
      handleSaveAndPublish();
    } else {
      setItemsToPublish(selectedItems);
    }
  });

  const hasStagedChanges = Object.keys(stagedChanges).length > 0;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateContentItems({
        modelZUID,
        body: Object.entries(stagedChanges).map(([id, changes]: any) => {
          const item = items.find((item: ContentItem) => item.meta.ZUID === id);
          return {
            ...item,
            data: {
              ...item.data,
              ...changes,
            },
          };
        }),
      });
      await Promise.allSettled([
        Object.keys(stagedChanges).forEach((itemZUID) => {
          dispatch(fetchItem(modelZUID, itemZUID));
        }),
      ]);
      setIsSaving(false);
      clearStagedChanges({});
    } catch (err) {
      setIsSaving(false);
      dispatch(
        notify({
          kind: "error",
          message: `Error saving items: ${err?.data?.error}`,
        })
      );
    }
  };

  const handleSaveAndPublish = async (isSchedule = false) => {
    try {
      setIsSaving(true);
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

      await Promise.allSettled([
        Object.keys(stagedChanges).forEach((itemZUID) => {
          dispatch(fetchItem(modelZUID, itemZUID));
        }),
      ]);
      setIsSaving(false);
      if (isSchedule) {
        // @ts-ignore
        setItemsToSchedule([...response?.data?.data]);
      } else {
        // @ts-ignore
        setItemsToPublish([...response?.data?.data]);
      }
    } catch (err) {
      setIsSaving(false);
      dispatch(
        notify({
          kind: "error",
          message: `Error saving items: ${err?.data?.error}`,
        })
      );
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
            onClick={() => {
              clearStagedChanges({});
              setSelectedItems([]);
            }}
          >
            <CloseRounded sx={{ fontSize: "20px" }} />
          </IconButton>
          <Typography variant="h3" fontWeight={700}>
            {hasStagedChanges
              ? ` Update ${Object.keys(stagedChanges)?.length} Content Items`
              : `${selectedItems?.length} selected`}
          </Typography>
        </Box>
        <Box display="flex" gap={1} alignItems="center">
          {hasStagedChanges && canUpdate ? (
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
          ) : canDelete ? (
            <LoadingButton
              loading={isDeleting}
              onClick={() => {
                setShowDeletesModal(true);
              }}
              startIcon={<DeleteRounded color="action" />}
              size="small"
              variant="outlined"
              color="inherit"
            >
              Delete
            </LoadingButton>
          ) : null}
          {canPublish && canUpdate && (
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
                    {hasStagedChanges
                      ? "Save & Publish Items"
                      : "Publish Items"}{" "}
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
                  data-cy="MultiPageTablePublish"
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
          )}
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
          loading={isPublishing}
          onConfirm={(items) => {
            setIsPublishing(true);
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
            })
              .unwrap()
              .then(async () => {
                await dispatch(fetchItemPublishings());
                setItemsToPublish([]);
                clearStagedChanges({});
                setSelectedItems([]);
                setShowPublishesModal(false);
              })
              .catch((res) => {
                setIsPublishing(false);
                dispatch(
                  notify({
                    kind: "error",
                    message: `Error publishing items: ${res?.data?.error}`,
                  })
                );
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
          loading={isPublishing}
          onConfirm={(items, publishDateTime) => {
            setIsPublishing(true);
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
            })
              .unwrap()
              .then(async (response) => {
                await dispatch(fetchItemPublishings());
                setItemsToSchedule([]);
                clearStagedChanges({});
                setSelectedItems([]);
                setShowScheduleModal(false);
              })
              .catch((res) => {
                setIsPublishing(false);
                dispatch(
                  notify({
                    kind: "error",
                    message: `Error publishing items: ${res?.data?.error}`,
                  })
                );
              });
          }}
        />
      )}
      {showDeletesModal && (
        <ConfirmDeletesDialog
          items={selectedItems?.map((itemZUID: string) =>
            items?.find((item) => item.meta.ZUID === itemZUID)
          )}
          onCancel={() => {
            setShowDeletesModal(false);
          }}
          onConfirm={(items) => {
            deleteContentItems({
              modelZUID,
              body: items?.map((item) => item.meta.ZUID),
            }).then(() => {
              items.forEach((item) => {
                dispatch({
                  type: "REMOVE_ITEM",
                  itemZUID: item.meta.ZUID,
                });
              });
              setShowDeletesModal(false);
            });
          }}
        />
      )}
    </>
  );
};
