import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import {
  useCreateItemPublishingMutation,
  useDeleteItemPublishingMutation,
  useGetAuditsQuery,
  useGetItemPublishingsQuery,
} from "../../../../../../../../shell/services/instance";
import { useHistory, useParams } from "react-router";
import { useEffect, useState } from "react";
import {
  ContentItem,
  Publishing,
} from "../../../../../../../../shell/services/types";
import {
  SaveRounded,
  MoreHorizRounded,
  ContentCopyRounded,
  ArrowDropDownRounded,
  CloudUploadRounded,
  CheckCircleRounded,
  UnpublishedRounded,
  CalendarTodayRounded,
  ManageAccountsRounded,
  ScheduleRounded,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../../../../../../../shell/store/types";
import { useMetaKey } from "../../../../../../../../shell/hooks/useMetaKey";
import { fetchItemPublishing } from "../../../../../../../../shell/store/content";
import { LoadingButton } from "@mui/lab";
import { useGetUsersQuery } from "../../../../../../../../shell/services/accounts";
import { formatDate } from "../../../../../../../../utility/formatDate";
import { ScheduleFlyout } from "../Header/ItemVersioning/ScheduleFlyout";

type ContentItemWithDirtyAndPublishing = ContentItem & {
  dirty: boolean;
  publishing: Publishing;
  scheduling: any;
};

type ItemEditHeaderActionsProps = {
  saving: boolean;
  onSave: () => void;
};

export const ItemEditHeaderActions = ({
  saving,
  onSave,
}: ItemEditHeaderActionsProps) => {
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const dispatch = useDispatch();
  const history = useHistory();
  const [publishMenu, setPublishMenu] = useState<null | HTMLElement>(null);
  const [publishAfterSave, setPublishAfterSave] = useState(false);
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false);
  const [scheduledPublishDialogOpen, setScheduledPublishDialogOpen] =
    useState(false);
  const [scheduleAfterSave, setScheduleAfterSave] = useState(false);
  const item = useSelector(
    (state: AppState) =>
      state.content[itemZUID] as ContentItemWithDirtyAndPublishing
  );
  const { data: users } = useGetUsersQuery();
  const { data: itemAudit } = useGetAuditsQuery({
    affectedZUID: itemZUID,
  });
  const [createPublishing, { isLoading: publishing }] =
    useCreateItemPublishingMutation();
  const [deleteItemPublishing, { isLoading: unpublishing }] =
    useDeleteItemPublishingMutation();
  const lastItemUpdateAudit = itemAudit?.find((audit) => audit.action === 2);
  const { data: itemPublishings, isFetching } = useGetItemPublishingsQuery({
    modelZUID,
    itemZUID,
  });
  const activePublishing = itemPublishings?.find(
    (itemPublishing) => itemPublishing._active
  );

  const isPublished = activePublishing?.version === item?.meta.version;
  const isScheduled = item?.scheduling?.isScheduled;

  const saveShortcut = useMetaKey("s", undefined, () => {
    if (item?.dirty) {
      onSave();
    }
  });

  const publishShortcut = useMetaKey("p", undefined, () => {
    if (item?.dirty) {
      setPublishAfterSave(true);
      onSave();
    } else {
      handlePublish();
    }
  });

  const handlePublish = async () => {
    // If item is scheduled, delete the scheduled publishing first
    if (isScheduled) {
      await deleteItemPublishing({
        modelZUID,
        itemZUID,
        publishingZUID: item?.scheduling?.ZUID,
      });
    }
    createPublishing({
      modelZUID,
      itemZUID,
      body: {
        version: item?.meta.version,
        publishAt: "now",
        unpublishAt: "never",
      },
    }).then(() => {
      // Retain non rtk-query fetch of item publishing for legacy code
      dispatch(fetchItemPublishing(modelZUID, itemZUID));
    });
  };

  const handleUnpublish = async () => {
    deleteItemPublishing({
      modelZUID,
      itemZUID,
      publishingZUID: activePublishing?.ZUID,
    }).then(() => {
      // Retain non rtk-query fetch of item publishing for legacy code
      dispatch(fetchItemPublishing(modelZUID, itemZUID));
      setUnpublishDialogOpen(false);
    });
  };

  useEffect(() => {
    // If publish after save is queued and the item was successfully saved, publish
    if (
      publishAfterSave &&
      activePublishing?.version !== item?.meta.version &&
      !saving
    ) {
      handlePublish();
      setPublishAfterSave(false);
    }
  }, [item, publishAfterSave, saving, activePublishing]);

  useEffect(() => {
    // If schedule after save is queued and the item was successfully saved, schedule
    if (
      scheduleAfterSave &&
      activePublishing?.version !== item?.meta.version &&
      !saving
    ) {
      setScheduledPublishDialogOpen(true);
      setScheduleAfterSave(false);
    }
  }, [item, scheduleAfterSave, saving, activePublishing]);

  console.log("tesint data", item?.publishing);

  return (
    <>
      <Box display="flex" gap={1} alignItems="center" height="32px">
        <IconButton
          size="small"
          onClick={(e) => setPublishMenu(e.currentTarget)}
        >
          <MoreHorizRounded fontSize="small" />
        </IconButton>
        <IconButton size="small">
          <ContentCopyRounded fontSize="small" />
        </IconButton>
        <IconButton size="small">
          <ContentCopyRounded fontSize="small" />
        </IconButton>

        <Tooltip
          enterDelay={1000}
          enterNextDelay={1000}
          title={
            item?.dirty ? (
              <div>
                Save Item <br />
                {saveShortcut}
              </div>
            ) : (
              <div>
                v{item?.meta?.version} saved on <br />
                {formatDate(item?.meta?.updatedAt)} <br />
                by {lastItemUpdateAudit?.firstName}{" "}
                {lastItemUpdateAudit?.lastName}
              </div>
            )
          }
          placement="bottom"
        >
          {item?.dirty ? (
            <LoadingButton
              variant="contained"
              startIcon={<SaveRounded />}
              size="small"
              onClick={() => {
                onSave();
              }}
              loading={saving && !publishAfterSave}
            >
              Save
            </LoadingButton>
          ) : (
            <Box display="flex" gap={1} alignItems="center" px="10px">
              <CheckCircleRounded fontSize="small" color="action" />
              <Typography
                variant="body2"
                color="text.disabled"
                fontWeight={500}
              >
                Saved
              </Typography>
            </Box>
          )}
        </Tooltip>
        {!isScheduled && (
          <Tooltip
            enterDelay={1000}
            enterNextDelay={1000}
            title={
              !isPublished || item?.dirty ? (
                <div>
                  {item?.dirty ? "Save & Publish Item" : "Publish Item"} <br />
                  {publishShortcut}
                </div>
              ) : (
                <div>
                  v{activePublishing?.version} published on <br />
                  by {formatDate(activePublishing?.publishAt)} <br />
                  {
                    users?.find(
                      (user: any) =>
                        user.ZUID === activePublishing?.publishedByUserZUID
                    )?.firstName
                  }{" "}
                  {
                    users?.find(
                      (user: any) =>
                        user.ZUID === activePublishing?.publishedByUserZUID
                    )?.lastName
                  }
                </div>
              )
            }
            placement="bottom"
          >
            {!isPublished || item?.dirty || publishAfterSave || isFetching ? (
              <ButtonGroup variant="contained" color="success" size="small">
                <LoadingButton
                  startIcon={<CloudUploadRounded />}
                  sx={{
                    color: "common.white",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => {
                    if (item?.dirty) {
                      setPublishAfterSave(true);
                      onSave();
                    } else {
                      handlePublish();
                    }
                  }}
                  loading={publishing || publishAfterSave || isFetching}
                  color="success"
                  variant="contained"
                >
                  {item?.dirty ? "Save & Publish" : "Publish"}
                </LoadingButton>
                <Button
                  sx={{
                    color: "common.white",
                  }}
                  onClick={(e) => {
                    setPublishMenu(e.currentTarget);
                  }}
                >
                  <ArrowDropDownRounded fontSize="small" />
                </Button>
              </ButtonGroup>
            ) : (
              <Box display="flex" alignItems="center" pl="10px" pr="4px">
                <Box display="flex" gap={1} alignItems="center">
                  <CheckCircleRounded fontSize="small" color="success" />
                  <Typography
                    variant="body2"
                    color="success.main"
                    fontWeight={500}
                  >
                    Published
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    setPublishMenu(e.currentTarget);
                  }}
                >
                  <ArrowDropDownRounded fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Tooltip>
        )}
        {isScheduled && (
          <Tooltip
            enterDelay={1000}
            enterNextDelay={1000}
            title={
              <div>
                v{item?.scheduling?.version} published on <br />
                {formatDate(item?.scheduling?.publishAt)} <br />
                by{" "}
                {
                  users?.find(
                    (user: any) =>
                      user.ZUID === item?.scheduling?.publishedByUserZUID
                  )?.firstName
                }{" "}
                {
                  users?.find(
                    (user: any) =>
                      user.ZUID === item?.scheduling?.publishedByUserZUID
                  )?.lastName
                }
              </div>
            }
            placement="bottom"
          >
            <Box display="flex" alignItems="center" pl="10px" pr="4px">
              <Box display="flex" gap={1} alignItems="center">
                <ScheduleRounded fontSize="small" color="warning" />
                <Typography
                  variant="body2"
                  color="warning.main"
                  fontWeight={500}
                >
                  Scheduled
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={(e) => {
                  setPublishMenu(e.currentTarget);
                }}
              >
                <ArrowDropDownRounded fontSize="small" />
              </IconButton>
            </Box>
          </Tooltip>
        )}
      </Box>
      <Menu
        onClose={() => setPublishMenu(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: -8,
          horizontal: "right",
        }}
        anchorEl={publishMenu}
        open={!!publishMenu}
      >
        <MenuItem
          onClick={() => {
            if (item?.dirty) {
              setPublishAfterSave(true);
              onSave();
            } else if (isScheduled) {
              handlePublish();
            } else if (isPublished) {
              setUnpublishDialogOpen(true);
            } else {
              handlePublish();
            }
            setPublishMenu(null);
          }}
        >
          <ListItemIcon>
            {item?.dirty ? (
              <CloudUploadRounded fontSize="small" />
            ) : isScheduled ? (
              <CloudUploadRounded fontSize="small" />
            ) : isPublished ? (
              <UnpublishedRounded fontSize="small" />
            ) : (
              <CloudUploadRounded fontSize="small" />
            )}
          </ListItemIcon>
          {item?.dirty
            ? "Save & Publish"
            : isScheduled
            ? "Publish Now"
            : isPublished
            ? "Unpublish Now"
            : "Publish Now"}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (item?.dirty) {
              setScheduleAfterSave(true);
              onSave();
            } else if (isScheduled) {
              setScheduledPublishDialogOpen(true);
            } else if (isPublished) {
              console.log("schedule unpublish");
              //setUnpublishDialogOpen(true);
            } else {
              setScheduledPublishDialogOpen(true);
            }
            setPublishMenu(null);
          }}
        >
          <ListItemIcon>
            <CalendarTodayRounded fontSize="small" />
          </ListItemIcon>
          {item?.dirty
            ? "Save & Schedule Publish"
            : isScheduled
            ? "Unschedule Publish"
            : isPublished
            ? "Schedule Unpublish"
            : "Schedule Publish"}
        </MenuItem>
        <MenuItem onClick={() => history.push("publishings")}>
          <ListItemIcon>
            <ManageAccountsRounded fontSize="small" />
          </ListItemIcon>
          Manage Publish Status
        </MenuItem>
      </Menu>
      {unpublishDialogOpen && (
        <Dialog
          open
          fullWidth
          maxWidth={"xs"}
          onClose={() => setUnpublishDialogOpen(false)}
        >
          <DialogTitle>
            <Box
              sx={{
                backgroundColor: "red.100",
                borderRadius: "100%",
                width: "40px",
                height: "40px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <UnpublishedRounded color="error" />
            </Box>
            <Typography variant="h5" sx={{ mt: 1.5 }}>
              <Typography variant="inherit" display="inline" fontWeight={600}>
                Unpublish Content Item:
              </Typography>{" "}
              {item?.web?.metaTitle || item?.web?.metaLinkText}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This will make the it immediately unavailable on all of your
              platforms. You can always republish this item by clicking on the
              publish button.
            </Typography>
          </DialogTitle>
          <DialogActions>
            <Button
              color="inherit"
              onClick={() => setUnpublishDialogOpen(false)}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="contained"
              color="error"
              aria-label="Delete Button"
              onClick={() => handleUnpublish()}
              loading={unpublishing}
            >
              Unpublish Item
            </LoadingButton>
          </DialogActions>
        </Dialog>
      )}
      <ScheduleFlyout
        isOpen={scheduledPublishDialogOpen}
        item={item}
        dispatch={dispatch}
        toggleOpen={() => setScheduledPublishDialogOpen(false)}
      />
    </>
  );
};
