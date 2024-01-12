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
import { UnpublishDialog } from "./UnpublishDialog";
import { usePermission } from "../../../../../../../../shell/hooks/use-permissions";
import { ContentItemWithDirtyAndPublishing } from ".";
import { ConfirmPublishModal } from "./ConfirmPublishModal";

const ITEM_STATES = {
  dirty: "dirty",
  published: "published",
  scheduled: "scheduled",
  draft: "draft",
} as const;

type ItemEditHeaderActionsProps = {
  saving: boolean;
  onSave: () => void;
  hasError: boolean;
};

export const ItemEditHeaderActions = ({
  saving,
  onSave,
  hasError,
}: ItemEditHeaderActionsProps) => {
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const dispatch = useDispatch();
  const canPublish = usePermission("PUBLISH");
  const canUpdate = usePermission("UPDATE");
  const [publishMenu, setPublishMenu] = useState<null | HTMLElement>(null);
  const [publishAfterSave, setPublishAfterSave] = useState(false);
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false);
  const [scheduledPublishDialogOpen, setScheduledPublishDialogOpen] =
    useState(false);
  const [scheduleAfterSave, setScheduleAfterSave] = useState(false);
  const [isConfirmPublishModalOpen, setIsConfirmPublishModalOpen] =
    useState(false);
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

  const saveShortcut = useMetaKey("s", () => {
    if (itemState === ITEM_STATES.dirty) {
      onSave();
    }
  });

  const publishShortcut = useMetaKey("p", () => {
    if (itemState === ITEM_STATES.dirty) {
      setPublishAfterSave(true);
      onSave();
    } else {
      setIsConfirmPublishModalOpen(true);
    }
  });

  const itemState = (() => {
    if (item?.dirty) {
      return ITEM_STATES.dirty;
    } else if (item?.scheduling?.isScheduled) {
      return ITEM_STATES.scheduled;
    } else if (activePublishing?.version === item?.meta.version) {
      return ITEM_STATES.published;
    } else {
      return ITEM_STATES.draft;
    }
  })();

  const handlePublish = async () => {
    // If item is scheduled, delete the scheduled publishing first
    if (itemState === ITEM_STATES.scheduled) {
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
      setIsConfirmPublishModalOpen(true);
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

  useEffect(() => {
    if (!saving && hasError) {
      setPublishAfterSave(false);
    }
  }, [hasError, saving]);

  return (
    <>
      <Tooltip
        enterDelay={1000}
        enterNextDelay={1000}
        title={
          itemState === ITEM_STATES.dirty ? (
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
        {itemState === ITEM_STATES.dirty ? (
          <LoadingButton
            variant="contained"
            startIcon={<SaveRounded />}
            size="small"
            onClick={() => {
              onSave();
            }}
            loading={saving && !publishAfterSave}
            disabled={!canUpdate}
            id="SaveItemButton"
          >
            Save
          </LoadingButton>
        ) : (
          <Box display="flex" gap={1} alignItems="center" px="10px">
            <CheckCircleRounded fontSize="small" color="action" />
            <Typography variant="body2" color="text.disabled" fontWeight={500}>
              Saved
            </Typography>
          </Box>
        )}
      </Tooltip>
      {itemState !== ITEM_STATES.scheduled && canPublish && (
        <Tooltip
          enterDelay={1000}
          enterNextDelay={1000}
          title={
            itemState === ITEM_STATES.draft ||
            itemState === ITEM_STATES.dirty ? (
              <div>
                {itemState === ITEM_STATES.dirty
                  ? "Save & Publish Item"
                  : "Publish Item"}{" "}
                <br />
                {publishShortcut}
              </div>
            ) : (
              <div>
                v{activePublishing?.version} published{" "}
                {formatDate(activePublishing?.publishAt).includes("Today") ||
                formatDate(activePublishing?.publishAt).includes("Yesterday")
                  ? ""
                  : "on"}
                <br />
                {formatDate(activePublishing?.publishAt)} <br />
                by{" "}
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
          {itemState === ITEM_STATES.draft ||
          itemState === ITEM_STATES.dirty ||
          publishAfterSave ||
          isFetching ? (
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
              <LoadingButton
                startIcon={<CloudUploadRounded />}
                sx={{
                  color: "common.white",
                  whiteSpace: "nowrap",
                }}
                onClick={() => {
                  if (itemState === ITEM_STATES.dirty) {
                    setPublishAfterSave(true);
                    onSave();
                  } else {
                    setIsConfirmPublishModalOpen(true);
                  }
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
            </ButtonGroup>
          ) : (
            <Box
              data-cy="ContentPublishedIndicator"
              display="flex"
              alignItems="center"
              pl="10px"
              pr="4px"
            >
              <Box display="flex" gap={1} alignItems="center">
                <CheckCircleRounded fontSize="small" color="success" />
                <Typography
                  variant="body2"
                  color="success.main"
                  fontWeight={500}
                  letterSpacing="0.46px"
                >
                  Published
                </Typography>
              </Box>
              <IconButton
                data-cy="PublishMenuButton"
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

      {itemState === ITEM_STATES.scheduled && canPublish && (
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
              <Typography variant="body2" color="warning.main" fontWeight={500}>
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

      <PublishingMenu
        itemState={itemState}
        onSave={onSave}
        onClose={() => setPublishMenu(null)}
        anchorEl={publishMenu}
        setPublishAfterSave={setPublishAfterSave}
        setScheduleAfterSave={setScheduleAfterSave}
        setUnpublishDialogOpen={setUnpublishDialogOpen}
        setScheduledPublishDialogOpen={setScheduledPublishDialogOpen}
        handlePublish={() => setIsConfirmPublishModalOpen(true)}
      />
      {unpublishDialogOpen && (
        <UnpublishDialog
          onClose={() => setUnpublishDialogOpen(false)}
          onConfirm={handleUnpublish}
          itemName={item?.web?.metaTitle || item?.web?.metaLinkText}
          loading={unpublishing}
        />
      )}
      <ScheduleFlyout
        isOpen={scheduledPublishDialogOpen}
        item={item}
        dispatch={dispatch}
        toggleOpen={() => setScheduledPublishDialogOpen(false)}
      />
      {isConfirmPublishModalOpen && (
        <ConfirmPublishModal
          contentTitle={item?.web?.metaTitle}
          onCancel={() => setIsConfirmPublishModalOpen(false)}
          onConfirm={() => {
            setIsConfirmPublishModalOpen(false);
            handlePublish();
          }}
        />
      )}
    </>
  );
};

type PublishingMenuProps = {
  itemState: string;
  onSave: () => void;
  onClose: () => void;
  anchorEl: null | HTMLElement;
  setPublishAfterSave: (value: boolean) => void;
  setScheduleAfterSave: (value: boolean) => void;
  setUnpublishDialogOpen: (value: boolean) => void;
  setScheduledPublishDialogOpen: (value: boolean) => void;
  handlePublish: () => void;
};

const PublishingMenu = ({
  itemState,
  onSave,
  onClose,
  anchorEl,
  setPublishAfterSave,
  setScheduleAfterSave,
  setUnpublishDialogOpen,
  setScheduledPublishDialogOpen,
  handlePublish,
}: PublishingMenuProps) => {
  const history = useHistory();
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  return (
    <Menu
      onClose={() => onClose()}
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
          switch (itemState) {
            case ITEM_STATES.dirty:
              setPublishAfterSave(true);
              onSave();
              break;
            case ITEM_STATES.published:
              setUnpublishDialogOpen(true);
              break;
            case ITEM_STATES.scheduled:
              setScheduledPublishDialogOpen(true);
              break;
            case ITEM_STATES.draft:
              handlePublish();
              break;
          }

          onClose();
        }}
        data-cy={
          itemState === ITEM_STATES.published ? "UnpublishContentButton" : ""
        }
      >
        <ListItemIcon>
          {itemState === ITEM_STATES.dirty ? (
            <CloudUploadRounded fontSize="small" />
          ) : itemState === ITEM_STATES.scheduled ? (
            <CloudUploadRounded fontSize="small" />
          ) : itemState === ITEM_STATES.published ? (
            <UnpublishedRounded fontSize="small" />
          ) : (
            <CloudUploadRounded fontSize="small" />
          )}
        </ListItemIcon>
        {itemState === ITEM_STATES.dirty
          ? "Save & Publish"
          : itemState === ITEM_STATES.scheduled
          ? "Publish Now"
          : itemState === ITEM_STATES.published
          ? "Unpublish Now"
          : "Publish Now"}
      </MenuItem>
      {itemState !== ITEM_STATES.published && (
        <MenuItem
          onClick={() => {
            switch (itemState) {
              case ITEM_STATES.dirty:
                setScheduleAfterSave(true);
                onSave();
                break;
              case ITEM_STATES.scheduled:
                setScheduledPublishDialogOpen(true);
                break;
              case ITEM_STATES.published:
                console.log("schedule unpublish");
                break;
              case ITEM_STATES.draft:
                setScheduledPublishDialogOpen(true);
                break;
            }
            onClose();
          }}
          data-cy="PublishScheduleButton"
        >
          <ListItemIcon>
            <CalendarTodayRounded fontSize="small" />
          </ListItemIcon>
          {itemState === ITEM_STATES.dirty
            ? "Save & Schedule Publish"
            : itemState === ITEM_STATES.scheduled
            ? "Unschedule Publish"
            : itemState === ITEM_STATES.published
            ? "Schedule Unpublish"
            : "Schedule Publish"}
        </MenuItem>
      )}

      <MenuItem
        onClick={() => {
          history.push(`/content/${modelZUID}/${itemZUID}/publishings`);
          onClose();
        }}
      >
        <ListItemIcon>
          <ManageAccountsRounded fontSize="small" />
        </ListItemIcon>
        Manage Publish Status
      </MenuItem>
    </Menu>
  );
};
