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
  Stack,
  List,
  Skeleton,
} from "@mui/material";
import {
  useCreateItemPublishingMutation,
  useDeleteItemPublishingMutation,
  useGetAuditsQuery,
  useGetContentItemVersionsQuery,
  useGetContentModelFieldsQuery,
  useGetItemPublishingsQuery,
  useGetItemWorkflowStatusQuery,
  useGetWorkflowStatusLabelsQuery,
} from "../../../../../../../../shell/services/instance";
import { useHistory, useParams } from "react-router";
import { useEffect, useMemo, useState } from "react";

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
import {
  fetchAllModelPublishings,
  fetchItemPublishing,
} from "../../../../../../../../shell/store/content";
import { useGetUsersQuery } from "../../../../../../../../shell/services/accounts";
import { formatDate } from "../../../../../../../../utility/formatDate";
import { UnpublishDialog } from "./UnpublishDialog";
import { usePermission } from "../../../../../../../../shell/hooks/use-permissions";
import {
  ContentItemWithDirtyAndPublishing,
  ContentModel,
  RedirectsCodes,
  RedirectsTargetType,
} from "../../../../../../../../shell/services/types";
import { SchedulePublish } from "../../../../../../../../shell/components/SchedulePublish";
import { notify } from "../../../../../../../../shell/store/notifications";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import { ConfirmPublishModal } from "../../../../../../../../shell/components/ConfirmPublishModal";
import { UnpublishedRelatedItem } from "./UnpublishedRelatedItem";
import { uniqBy } from "lodash";
import { useRedirectsDialog } from "../../../../../../../seo/src/app/components/RedirectsDialogProvider";
import * as amplitude from "@amplitude/analytics-browser";
import {
  PUBLISH_ATTEMPT_WITHOUT_ALLOW_PUBLISH_STATUS,
  SCHEDULE_PUBLISH_ATTEMPT_WITHOUT_ALLOW_PUBLISH_STATUS,
} from "../../../../../../../../amplitude-events";
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
  isLoadingItem?: boolean;
  modelZUIDOverride?: string;
  itemZUIDOverride?: string;
};

export const ItemEditHeaderActions = ({
  saving,
  onSave,
  hasError,
  isLoadingItem,
  modelZUIDOverride,
  itemZUIDOverride,
}: ItemEditHeaderActionsProps) => {
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const resolvedModelZUID = modelZUIDOverride || modelZUID;
  const resolvedItemZUID = itemZUIDOverride || itemZUID;
  const { openChangeDialog } = useRedirectsDialog();
  const dispatch = useDispatch();
  const canPublish = usePermission("PUBLISH", resolvedItemZUID);
  const canUpdate = usePermission("UPDATE", resolvedItemZUID);
  const [publishMenu, setPublishMenu] = useState<null | HTMLElement>(null);
  const [publishAfterSave, setPublishAfterSave] = useState(false);
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false);
  const [scheduledPublishDialogOpen, setScheduledPublishDialogOpen] =
    useState(false);
  const [scheduleAfterSave, setScheduleAfterSave] = useState(false);
  const [publishAfterUnschedule, setPublishAfterUnschedule] = useState(false);
  const [isConfirmPublishModalOpen, setIsConfirmPublishModalOpen] =
    useState(false);
  const [relatedItemsToPublish, setRelatedItemsToPublish] = useState<
    ContentItemWithDirtyAndPublishing[]
  >([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCheckingPathUpdate, setIsCheckingPathUpdate] = useState(false);
  const item = useSelector(
    (state: AppState) =>
      state.content[resolvedItemZUID] as ContentItemWithDirtyAndPublishing
  );

  const [scheduledAction, setScheduledAction] = useState<
    "publish" | "unpublish" | null
  >(null);

  const items = useSelector((state: AppState) => state.content);
  const model = useSelector(
    (state: AppState) => state.models[resolvedModelZUID]
  ) as ContentModel;
  const { data: fields, isLoading: isLoadingFields } =
    useGetContentModelFieldsQuery(
      { modelZUID: resolvedModelZUID },
      {
        skip: !resolvedModelZUID,
      }
    );
  const { data: users, isLoading: isLoadingUsers } = useGetUsersQuery();
  const { data: itemAudit, isLoading: isLoadingAudit } = useGetAuditsQuery({
    affectedZUID: resolvedItemZUID,
  });
  const [createPublishing] = useCreateItemPublishingMutation();
  const [deleteItemPublishing, { isLoading: unpublishing }] =
    useDeleteItemPublishingMutation();
  const lastItemUpdateAudit = itemAudit?.find(
    (audit) => audit.action === 2 || audit.action === 1
  );
  const { data: itemPublishings, isFetching } = useGetItemPublishingsQuery({
    modelZUID: resolvedModelZUID,
    itemZUID: resolvedItemZUID,
  });

  const {
    data: itemVersions,
    isFetching: isFetchingVersions,
    isLoading: isLoadingVersions,
    refetch: refetchVersions,
  } = useGetContentItemVersionsQuery({
    modelZUID: resolvedModelZUID,
    itemZUID: resolvedItemZUID,
  });

  const activePublishing = itemPublishings?.find(
    (itemPublishing) => itemPublishing._active
  );

  const hasScheduledPublish =
    !!item?.scheduling?.isScheduled &&
    new Date(item?.scheduling?.publishAt).getTime() > Date.now();

  const hasScheduledUnpublish =
    item?.publishing?.version === item?.meta?.version &&
    !!item?.publishing?.unpublishAt &&
    new Date(item?.publishing?.unpublishAt).getTime() > Date.now();

  const { data: statusLabels } = useGetWorkflowStatusLabelsQuery();
  const { data: itemWorkflowStatus, isLoading: isLoadingItemWorkflowStatus } =
    useGetItemWorkflowStatusQuery(
      { itemZUID: resolvedItemZUID, modelZUID: resolvedModelZUID },
      { skip: !resolvedItemZUID || !resolvedModelZUID }
    );

  const getUserFullName = (userZUID: string) => {
    if (!userZUID) {
      return "";
    }
    const user = users?.find((user: any) => user.ZUID === userZUID);
    return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  };

  const publishedByUser = users?.find(
    (user: any) => user.ZUID === activePublishing?.publishedByUserZUID
  );
  const publisherFullName = `${publishedByUser?.firstName || ""} ${
    publishedByUser?.lastName || ""
  }`.trim();

  const scheduledByUser = users?.find(
    (user: any) => user.ZUID === item?.scheduling?.publishedByUserZUID
  );
  const scheduledByFullName = `${scheduledByUser?.firstName || ""} ${
    scheduledByUser?.lastName || ""
  }`.trim();

  useEffect(() => {
    // Automatically opens the create redirect modal
    // when there are changes to the url path part
    if (
      !isLoadingVersions &&
      !isFetchingVersions &&
      !isFetching &&
      !!isCheckingPathUpdate &&
      Array.isArray(itemVersions)
    ) {
      const publishedItemVersions = itemVersions
        ?.filter((ver) => !!ver?.publishAt)
        ?.map((ver) => ({
          ZUID: ver?.meta?.ZUID,
          publishedAt: ver?.publishAt,
          path: ver?.web?.path,
          version: ver?.web?.version,
          isActive: ver?.web?.versionZUID === activePublishing?.versionZUID,
        }))
        .sort((a, b) => {
          return (
            new Date(b?.publishedAt).getTime() -
            new Date(a?.publishedAt).getTime()
          );
        });

      if (publishedItemVersions?.length < 2) {
        return;
      }

      const activeVersion = publishedItemVersions[0];
      const previousVersion = publishedItemVersions[1];
      const pathHasChanged =
        activeVersion?.path?.trim() !== previousVersion?.path?.trim();
      if (pathHasChanged) {
        const redirect = {
          targetType: "page" as RedirectsTargetType,
          target: item?.meta?.ZUID,
          path: previousVersion?.path,
          code: 301 as RedirectsCodes,
        };
        openChangeDialog(redirect, activeVersion?.path);
      }
      setIsCheckingPathUpdate(false);
    }
  }, [
    itemVersions,
    isLoadingVersions,
    isFetchingVersions,
    isFetching,
    activePublishing,
    isCheckingPathUpdate,
  ]);

  const saveShortcut = useMetaKey("s", () => {
    if (!canUpdate) return;
    if (itemState === ITEM_STATES.dirty) {
      onSave();
    }
  });

  const publishShortcut = useMetaKey("p", () => {
    if (!canPublish) return;
    if (itemState === ITEM_STATES.dirty) {
      setPublishAfterSave(true);
      onSave();
    } else {
      setIsConfirmPublishModalOpen(true);
    }
  });

  const unpublishedRelatedItems = useMemo(() => {
    if (!fields || !item || !item.data || !items) return [];

    const relatedFieldZUIDs = Object.entries(item.data)?.reduce(
      (
        acc: {
          itemZUIDs: string[];
          relatedFieldZUID: string;
          relatedModelZUID: string;
        }[],
        [key, value]
      ) => {
        const field = fields.find((field) => field.name === key);

        if (
          !!value &&
          (field?.datatype === "one_to_many" ||
            field?.datatype === "one_to_one")
        ) {
          acc = [
            ...acc,
            {
              relatedFieldZUID: field.relatedFieldZUID,
              relatedModelZUID: field.relatedModelZUID,
              itemZUIDs: (value as string)?.split(","),
            },
          ];
        }

        return acc;
      },
      []
    );

    const unpublishedRelatedItems = Object.values(relatedFieldZUIDs)
      ?.map(({ relatedFieldZUID, relatedModelZUID, itemZUIDs }) => {
        const relatedItems = itemZUIDs?.map((ZUID) => {
          const item = Object.values(items)?.find(
            (item) =>
              item.meta.ZUID === ZUID &&
              item.meta.contentModelZUID === relatedModelZUID
          );

          if (!!item) {
            const draftVersion = item?.meta?.version;
            const publishedVersion = item?.publishing?.version || 0;
            const scheduledVersion = item?.scheduling?.version || 0;

            if (
              draftVersion > publishedVersion ||
              scheduledVersion > publishedVersion
            ) {
              return {
                ...item,
                relatedFieldZUID,
                relatedModelZUID,
              };
            }
          }
        });

        return relatedItems;
      })
      ?.flat()
      ?.filter((item) => !!item);

    const uniqueItems = uniqBy(unpublishedRelatedItems, "meta.ZUID");

    // Make sure that unpublished related items are checked by default
    setRelatedItemsToPublish(uniqueItems);

    return uniqueItems;
  }, [fields, item, items]);

  const itemState = (() => {
    if (item?.dirty) {
      return ITEM_STATES.dirty;
    } else if (
      item?.scheduling?.isScheduled &&
      item?.scheduling?.version === item?.meta.version
    ) {
      return ITEM_STATES.scheduled;
    } else if (
      item?.publishing?.isPublished &&
      item?.publishing?.version === item?.meta.version
    ) {
      return ITEM_STATES.published;
    } else {
      return ITEM_STATES.draft;
    }
  })();

  const publishButtonTooltipLabel =
    itemState === ITEM_STATES.dirty ? "Save & Publish Item" : "Publish Item";

  const datePreposition = (date?: string) => {
    if (!date) return "on";
    const formatted = formatDate(date);
    return formatted.includes("Today") || formatted.includes("Yesterday")
      ? ""
      : "on";
  };

  const allowPublish = useMemo(() => {
    const allowPublishLabelZUIDs = statusLabels?.reduce((acc, next) => {
      if (next.allowPublish) {
        return (acc = [...acc, next.ZUID]);
      }

      return acc;
    }, []);

    if (!allowPublishLabelZUIDs?.length) return true;

    const itemWorkflowLabelZUIDs = itemWorkflowStatus?.find(
      (i) => i.itemVersion === item?.meta?.version
    )?.labelZUIDs;

    return itemWorkflowLabelZUIDs?.some((labelZUID) =>
      allowPublishLabelZUIDs?.includes(labelZUID)
    );
  }, [statusLabels, itemWorkflowStatus, item?.meta?.version]);

  const handlePublish = async () => {
    if (allowPublish) {
      setIsPublishing(true);
      try {
        // Delete scheduled publishings first
        const deleteScheduledPromises = [
          // Delete main item's scheduled publishing if it exists
          hasScheduledPublish &&
            deleteItemPublishing({
              modelZUID: resolvedModelZUID,
              itemZUID: resolvedItemZUID,
              publishingZUID: item?.scheduling?.ZUID,
            }),
          // Delete related items' scheduled publishings if they exist
          ...relatedItemsToPublish
            .filter((item) => !!item.scheduling?.ZUID)
            .map((item) =>
              deleteItemPublishing({
                modelZUID: item.meta.contentModelZUID,
                itemZUID: item.meta.ZUID,
                publishingZUID: item.scheduling.ZUID,
              })
            ),
        ].filter((item) => !!item);

        await Promise.all(deleteScheduledPromises);

        // Proceed with publishing
        const publishPromises = await Promise.allSettled([
          createPublishing({
            modelZUID: resolvedModelZUID,
            itemZUID: resolvedItemZUID,
            body: {
              version: item?.meta.version,
              publishAt: "now",
              unpublishAt: "never",
            },
          }),
          ...relatedItemsToPublish.map((item) =>
            createPublishing({
              modelZUID: item.meta.contentModelZUID,
              itemZUID: item.meta.ZUID,
              body: {
                version: item.meta.version,
                publishAt: "now",
                unpublishAt: "never",
              },
            })
          ),
        ]);

        // Loop through all publish results and dispatch error notification if any failed
        publishPromises.forEach((promise: any) => {
          if ("error" in promise.value) {
            const message =
              promise.value.error.data?.error ||
              promise.value.error.data?.message ||
              "An error occurred while publishing. Please try again.";
            dispatch(notify({ message, kind: "error" }));
          }
        });

        // Retain non rtk-query fetch of item publishing for legacy code
        await dispatch(
          fetchAllModelPublishings({
            modelZUID: resolvedModelZUID,
          })
        );
        refetchVersions();
      } finally {
        setIsCheckingPathUpdate(true);
        setIsPublishing(false);
        setIsConfirmPublishModalOpen(false);
      }
    } else {
      dispatch(
        notify({
          message: `Cannot Publish: "${item.web.metaTitle}". Does not have a status that allows publishing`,
          kind: "error",
        })
      );
      amplitude.track(PUBLISH_ATTEMPT_WITHOUT_ALLOW_PUBLISH_STATUS);
    }
  };

  const handleUnpublish = async () => {
    deleteItemPublishing({
      modelZUID: resolvedModelZUID,
      itemZUID: resolvedItemZUID,
      publishingZUID: activePublishing?.ZUID,
    }).then(() => {
      // Retain non rtk-query fetch of item publishing for legacy code
      dispatch(fetchItemPublishing(resolvedModelZUID, resolvedItemZUID));
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

  if (
    (isLoadingItem &&
      (!item ||
        !Object.keys(item.web).length ||
        !Object.keys(item.meta).length)) ||
    isLoadingFields ||
    isLoadingUsers ||
    isLoadingAudit
  ) {
    return (
      <Stack direction="row" gap={1} height="100%">
        <Skeleton variant="rounded" width={91} height="100%" />
        <Skeleton variant="rounded" width={142} height="100%" />
      </Stack>
    );
  }

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
              by {getUserFullName(item?.meta.createdByUserZUID || "")}
            </div>
          )
        }
        placement="bottom-start"
      >
        {itemState === ITEM_STATES.dirty ? (
          <Button
            variant="contained"
            startIcon={<SaveRounded />}
            size="small"
            onClick={() => {
              onSave();
            }}
            loading={saving}
            disabled={!canUpdate}
            id="SaveItemButton"
            data-cy="SaveItemButton"
          >
            Save
          </Button>
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
        <Box position="relative">
          <Tooltip
            enterDelay={1000}
            enterNextDelay={1000}
            title={
              itemState === ITEM_STATES.draft ||
              itemState === ITEM_STATES.dirty ? (
                <div>
                  {publishButtonTooltipLabel} <br />
                  {publishShortcut}
                </div>
              ) : (
                <div>
                  v{activePublishing?.version} published{" "}
                  {datePreposition(activePublishing?.publishAt)}
                  <br />
                  {!!activePublishing &&
                    formatDate(activePublishing?.publishAt)}
                  <br />
                  by{" "}
                  {getUserFullName(activePublishing?.publishedByUserZUID || "")}
                </div>
              )
            }
            placement="bottom-start"
          >
            {itemState === ITEM_STATES.draft ||
            itemState === ITEM_STATES.dirty ||
            publishAfterSave ||
            isFetching ||
            saving ? (
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
                <Button
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
                  loading={isPublishing || saving || isFetching}
                  color="success"
                  variant="contained"
                  id="PublishButton"
                  data-cy="PublishButton"
                >
                  {itemState === ITEM_STATES.dirty
                    ? "Save & Publish"
                    : "Publish"}
                </Button>
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
                  disabled={isPublishing || saving || isFetching}
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
                    data-cy={
                      hasScheduledUnpublish
                        ? "ScheduledUnpublishIndicator"
                        : undefined
                    }
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
        </Box>
      )}
      {itemState === ITEM_STATES.scheduled && canPublish && (
        <Tooltip
          enterDelay={1000}
          enterNextDelay={1000}
          title={
            <div>
              v{item?.scheduling?.version} published on <br />
              {formatDate(item?.scheduling?.publishAt)} <br />
              by {getUserFullName(item?.scheduling?.publishedByUserZUID || "")}
            </div>
          }
          placement="bottom-start"
        >
          {item?.scheduling?.version !== item?.meta?.version ? (
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
              <Button
                startIcon={<CloudUploadRounded />}
                sx={{
                  color: "common.white",
                  whiteSpace: "nowrap",
                }}
                onClick={() => {
                  setIsConfirmPublishModalOpen(true);
                }}
                loading={isPublishing || publishAfterSave || isFetching}
                color="success"
                variant="contained"
                id="PublishButton"
                data-cy="PublishButton"
              >
                Publish
              </Button>
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
                disabled={isPublishing || publishAfterSave || isFetching}
                data-cy="PublishMenuButton"
              >
                <ArrowDropDownRounded fontSize="small" />
              </Button>
            </ButtonGroup>
          ) : (
            <Box display="flex" alignItems="center" pl="10px" pr="4px">
              <Box
                display="flex"
                gap={1}
                alignItems="center"
                data-cy="ContentScheduledIndicator"
              >
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

      <PublishingMenu
        itemState={itemState}
        onSave={onSave}
        onClose={() => setPublishMenu(null)}
        anchorEl={publishMenu}
        setPublishAfterSave={setPublishAfterSave}
        setScheduleAfterSave={setScheduleAfterSave}
        setUnpublishDialogOpen={setUnpublishDialogOpen}
        hasScheduledUnpublish={hasScheduledUnpublish}
        setScheduledPublishDialogOpen={(open, action = "publish") => {
          if (!allowPublish) {
            dispatch(
              notify({
                message: `Cannot Publish: "${item.web.metaTitle}". Does not have a status that allows publishing`,
                kind: "error",
              })
            );
            amplitude.track(
              SCHEDULE_PUBLISH_ATTEMPT_WITHOUT_ALLOW_PUBLISH_STATUS
            );
          } else {
            setScheduledPublishDialogOpen(open);
            setScheduledAction(action);
          }
        }}
        setPublishAfterUnschedule={() => {
          setScheduledPublishDialogOpen(true);
          setPublishAfterUnschedule(true);
        }}
        handlePublish={() => setIsConfirmPublishModalOpen(true)}
        modelZUID={resolvedModelZUID}
        itemZUID={resolvedItemZUID}
      />
      {unpublishDialogOpen && (
        <UnpublishDialog
          onClose={() => setUnpublishDialogOpen(false)}
          onConfirm={handleUnpublish}
          itemName={item?.web?.metaTitle || item?.web?.metaLinkText}
          loading={unpublishing}
        />
      )}
      {scheduledPublishDialogOpen && (
        <SchedulePublish
          item={item}
          onClose={() => {
            setScheduledPublishDialogOpen(false);
            setScheduledAction(null);
          }}
          onPublishNow={() => {
            handlePublish();
            setScheduledPublishDialogOpen(false);
          }}
          onUnpublishNow={() => {
            setScheduledPublishDialogOpen(false);
            setUnpublishDialogOpen(true);
          }}
          onUnscheduleSuccess={() => {
            if (publishAfterUnschedule) {
              setIsConfirmPublishModalOpen(true);
            }
          }}
          scheduledAction={scheduledAction}
        />
      )}
      {isConfirmPublishModalOpen && (
        <ConfirmPublishModal
          contentTitle={item?.web?.metaTitle}
          contentVersion={item?.web?.version}
          onCancel={() => {
            setIsConfirmPublishModalOpen(false);
            setPublishAfterUnschedule(false);
          }}
          onConfirm={() => {
            // setIsConfirmPublishModalOpen(false);
            setPublishAfterUnschedule(false);
            handlePublish();
          }}
          altText={model?.type === "block" && "Variant"}
          relatedItemsToPublishCount={relatedItemsToPublish.length}
          isPublishing={isPublishing}
        >
          {unpublishedRelatedItems?.length > 0 && (
            <Stack mt={2}>
              <Typography variant="body2" fontWeight={600}>
                Also publish related items
              </Typography>
              <Typography variant="body3" color="text.secondary">
                This will publish all items selected in the list below
              </Typography>
              <List disablePadding sx={{ mt: 1 }}>
                {unpublishedRelatedItems.map((item, index) => (
                  <UnpublishedRelatedItem
                    key={item.meta.ZUID}
                    contentItem={item}
                    divider
                    selected={relatedItemsToPublish.some(
                      (i) => i.meta.ZUID === item.meta.ZUID
                    )}
                    onChange={({ action, contentItem }) => {
                      if (action === "add") {
                        setRelatedItemsToPublish([
                          ...relatedItemsToPublish,
                          contentItem,
                        ]);
                      } else {
                        setRelatedItemsToPublish(
                          relatedItemsToPublish.filter(
                            (item) => item.meta.ZUID !== contentItem.meta.ZUID
                          )
                        );
                      }
                    }}
                  />
                ))}
              </List>
            </Stack>
          )}
        </ConfirmPublishModal>
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
  setScheduledPublishDialogOpen: (
    value: boolean,
    action?: "publish" | "unpublish" | null
  ) => void;
  setPublishAfterUnschedule: () => void;
  handlePublish: () => void;
  hasScheduledUnpublish?: boolean;
  modelZUID: string;
  itemZUID: string;
};

const MENU_ACTION_LABELS: Record<string, string> = {
  [ITEM_STATES.dirty]: "Save & Publish",
  [ITEM_STATES.scheduled]: "Publish Now",
  [ITEM_STATES.published]: "Unpublish Now",
  [ITEM_STATES.draft]: "Publish Now",
};

const SCHEDULE_ACTION_LABELS: Record<string, string> = {
  [ITEM_STATES.dirty]: "Save & Schedule Publish",
  [ITEM_STATES.scheduled]: "Unschedule Publish",
  [ITEM_STATES.published]: "Schedule Unpublish",
  [ITEM_STATES.draft]: "Schedule Publish",
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
  setPublishAfterUnschedule,
  handlePublish,
}: PublishingMenuProps) => {
  const history = useHistory();
  const menuActionIcon =
    itemState === ITEM_STATES.published ? (
      <UnpublishedRounded fontSize="small" />
    ) : (
      <CloudUploadRounded fontSize="small" />
    );
  return (
    <Menu
      data-cy="publishingMenu"
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
              setPublishAfterUnschedule();
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
        <ListItemIcon>{menuActionIcon}</ListItemIcon>
        {MENU_ACTION_LABELS[itemState]}
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
                setScheduledPublishDialogOpen(true, "publish");
                break;
              case ITEM_STATES.draft:
                setScheduledPublishDialogOpen(true, "publish");
                break;
            }
            onClose();
          }}
          data-cy="PublishScheduleButton"
        >
          <ListItemIcon>
            <CalendarTodayRounded fontSize="small" />
          </ListItemIcon>
          {SCHEDULE_ACTION_LABELS[itemState]}
        </MenuItem>
      )}
      {itemState === ITEM_STATES.published && (
        <MenuItem
          onClick={() => {
            setScheduledPublishDialogOpen(true, "unpublish");
            onClose();
          }}
          data-cy="UnpublishScheduleButton"
        >
          <ListItemIcon>
            <CalendarTodayRounded fontSize="small" />
          </ListItemIcon>
          {hasScheduledUnpublish
            ? "Unschedule Unpublish"
            : "Schedule Unpublish"}
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
