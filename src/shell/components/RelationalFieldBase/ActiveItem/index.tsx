import { memo, useState, useMemo, useEffect } from "react";
import {
  Typography,
  Stack,
  Box,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  DragIndicatorRounded,
  Edit,
  MoreHoriz,
  ImageRounded,
  CloudUploadRounded,
  ScheduleRounded,
  DesignServicesRounded,
  LanguageRounded,
  WidgetsRounded,
  CloseRounded,
  CheckRounded,
} from "@mui/icons-material";
import { useHistory } from "react-router";
import { useDrag, useDrop } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import { ReplaceContentItem } from "@zesty-io/material";
import {
  useCreateItemPublishingMutation,
  useDeleteItemPublishingMutation,
  useGetContentModelFieldsQuery,
} from "../../../services/instance";
import { ContentModel, ContentModelField } from "../../../services/types";
import { ActiveItemLoading } from "./ActiveItemLoading";
import { VersionCell } from "../FieldSelectorDialog/VersionCell";
import { AppState } from "../../../store/types";
import { useGetUsersQuery } from "../../../services/accounts";
import { ConfirmPublishModal } from "../../ConfirmPublishModal";
import { fetchItem, fetchItemPublishing } from "../../../store/content";
import { SchedulePublish } from "../../SchedulePublish";
import { useDomain } from "../../../hooks/use-domain";

type ActiveItemProps = {
  itemZUID: string;
  index: number;
  relatedFieldData: ContentModelField;
  relatedModelData: ContentModel;
  onMoveCard: (draggedItemZUID: string, dropIndex: number) => void;
  onDropCard: () => void;
  onRemoveCard: (itemZUID: string) => void;
  draggable?: boolean;
  openFieldSelectorDialog?: (evt: React.MouseEvent<HTMLButtonElement>) => void;
};
export const ActiveItem = memo(
  ({
    itemZUID,
    index,
    relatedFieldData,
    relatedModelData,
    onMoveCard,
    onDropCard,
    onRemoveCard,
    draggable,
    openFieldSelectorDialog,
  }: ActiveItemProps) => {
    const [imageError, setImageError] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const history = useHistory();
    const dispatch = useDispatch();
    const domain = useDomain();
    const contentItems = useSelector((state: AppState) => state.content);
    const instance = useSelector((state: AppState) => state.instance);
    const previewLock = useSelector((state: AppState) =>
      state.settings.instance.find(
        (setting: any) =>
          setting.key === "preview_lock_password" && setting.value
      )
    );
    const { data: relatedModelFields, isLoading: isLoadingRelatedModel } =
      useGetContentModelFieldsQuery(
        { modelZUID: relatedModelData?.ZUID },
        {
          skip: !relatedModelData?.ZUID,
        }
      );
    const { data: users, isLoading: isLoadingUsers } = useGetUsersQuery();
    const [createPublishing, { isLoading: isPublishing }] =
      useCreateItemPublishingMutation();
    const [deleteItemPublishing, { isLoading: isUnpublishing }] =
      useDeleteItemPublishingMutation();

    const [{ isDragging }, drag, preview] = useDrag({
      type: "relationalItem",
      item: {
        id: itemZUID,
        index,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });
    const [_, drop] = useDrop({
      accept: "relationalItem",
      hover: ({ id: draggedID, index: draggedIndex }) => {
        if (draggedIndex !== index) {
          onMoveCard(draggedID, index);
        }
      },
      drop: () => {
        onDropCard();
      },
    });

    const resolveUserZUID = (userZUID: string) => {
      const user = users?.find((user) => user.ZUID === userZUID);

      if (!!user) {
        return `${user?.firstName} ${user.lastName}`;
      }

      return userZUID;
    };

    const contentItem = useMemo(() => {
      const item = Object.values(contentItems)?.find(
        (item) =>
          item.meta?.ZUID === itemZUID &&
          item.meta?.contentModelZUID === relatedModelData?.ZUID
      );

      if (!item) {
        return null;
      }

      return {
        ...item,
        createdByName: resolveUserZUID(item.meta?.createdByUserZUID),
        publishing: item?.publishing?.version
          ? {
              ...item.publishing,
              publishedByName: resolveUserZUID(
                item.publishing?.publishedByUserZUID
              ),
            }
          : null,
        scheduling: item?.scheduling?.version
          ? {
              ...item.scheduling,
              scheduledByName: resolveUserZUID(
                item.scheduling?.publishedByUserZUID
              ),
            }
          : null,
      };
    }, [contentItems, itemZUID, relatedModelData, users]);

    // Ensure item is fetched if it wasn't included in the initial 100-item fetch
    useEffect(() => {
      if (contentItem || !relatedModelData?.ZUID || !itemZUID) {
        return;
      }

      dispatch(fetchItem(relatedModelData.ZUID, itemZUID));
    }, [contentItem]);

    const imageFieldName = useMemo(() => {
      if (!relatedModelFields?.length) return null;

      const imageFields = relatedModelFields.filter(
        (field) => !field.deletedAt && field.datatype === "images"
      );

      return imageFields?.[0]?.name || null;
    }, [relatedModelFields]);

    const imageURL = useMemo(() => {
      if (!contentItem?.data || !imageFieldName) return null;

      if (!!contentItem.data[imageFieldName]) {
        const value = String(contentItem.data[imageFieldName]).split(",")?.[0];

        if (value.startsWith("3-")) {
          return `${
            // @ts-ignore
            CONFIG.SERVICE_MEDIA_RESOLVER
          }/resolve/${value}/getimage/?w=64&h=64&type=crop`;
        } else {
          return value;
        }
      }

      return null;
    }, [contentItem, imageFieldName]);

    const handlePublish = async () => {
      if (contentItem?.scheduling?.isScheduled) {
        await deleteItemPublishing({
          modelZUID: relatedModelData?.ZUID,
          itemZUID,
          publishingZUID: contentItem?.scheduling?.ZUID,
        });
      }
      createPublishing({
        modelZUID: relatedModelData?.ZUID,
        itemZUID,
        body: {
          version: contentItem?.meta.version,
          publishAt: "now",
          unpublishAt: "never",
        },
      }).then(() => {
        // Retain non rtk-query fetch of item publishing for legacy code
        dispatch(fetchItemPublishing(relatedModelData?.ZUID, itemZUID));
        setIsPublishModalOpen(false);
        setIsScheduleModalOpen(false);
      });
    };

    const handleCopyZUID = () => {
      if (isCopied) return;

      navigator?.clipboard
        ?.writeText(itemZUID)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => {
            setIsCopied(false);
          }, 1500);
        })
        .catch((err) => {
          console.error(err);
        });
    };

    const itemTitle = !!contentItem
      ? contentItem?.data[relatedFieldData?.name] ||
        contentItem?.web?.metaTitle ||
        contentItem?.web?.metaLinkText
      : `${itemZUID} (Deleted)`;
    const isPublishable =
      contentItem?.meta?.version > (contentItem?.publishing?.version || 0);

    if (isLoadingRelatedModel || isLoadingUsers) {
      return <ActiveItemLoading draggable={draggable} />;
    }

    return (
      <>
        <Stack
          data-cy="active-relational-item"
          ref={(node) => drop(preview(node))}
          direction="row"
          sx={{
            bgcolor: "background.paper",
            height: !!imageFieldName ? 62 : 58,
            width: "100%",
            border: 1,
            borderColor: "border",
            borderRadius: 2,
            alignItems: "center",
            overflow: "hidden",
            opacity: isDragging ? 0 : 1,
            transform: "translate(0, 0)",
          }}
        >
          <Stack direction="row" alignItems="center" flexGrow={1}>
            {draggable && (
              <Tooltip
                enterDelay={1000}
                disableInteractive
                title="Drag and Drop to Reorder"
                open={showTooltip}
                onOpen={() => setShowTooltip(true)}
                onClose={() => setShowTooltip(false)}
              >
                <IconButton
                  ref={drag}
                  disableRipple
                  disableFocusRipple
                  disableTouchRipple
                  size="xsmall"
                  sx={{ cursor: "grab", mx: 0.25 }}
                  onClick={() => setShowTooltip(false)}
                >
                  <DragIndicatorRounded fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {!!imageFieldName &&
              (!!imageURL && !imageError ? (
                <Box
                  component="img"
                  loading="lazy"
                  width={64}
                  height={64}
                  src={imageURL}
                  sx={{
                    flexShrink: 0,
                    bgcolor: "grey.100",
                    objectFit: "contain",
                    overflow: "hidden",
                  }}
                  onError={() => setImageError(true)}
                />
              ) : (
                <Stack
                  sx={{
                    flexShrink: 0,
                    bgcolor: "grey.100",
                    width: 64,
                    height: 64,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <ImageRounded color="action" />
                </Stack>
              ))}
            <Stack
              gap={0.5}
              justifyContent="center"
              flexGrow={1}
              ml={!!imageFieldName || (!imageFieldName && !draggable) ? 2 : 0}
            >
              <Typography
                color="text.primary"
                fontWeight={600}
                variant="body2"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: "1",
                  WebkitBoxOrient: "vertical",
                  wordBreak: "break-word",
                  wordWrap: "break-word",
                  hyphens: "auto",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {itemTitle}
              </Typography>
              {contentItem?.web?.metaDescription && (
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: "1",
                    WebkitBoxOrient: "vertical",
                    wordBreak: "break-word",
                    wordWrap: "break-word",
                    hyphens: "auto",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {contentItem?.web?.metaDescription}
                </Typography>
              )}
            </Stack>
          </Stack>

          <Stack direction="row" gap={2} mx={2} alignItems="center">
            {!!contentItem && (
              <VersionCell
                itemData={contentItem}
                publishData={contentItem.publishing}
                scheduleData={contentItem.scheduling}
              />
            )}
            <Stack direction="row" gap={1}>
              <Tooltip
                enterDelay={1000}
                disableInteractive
                title="Replace Item"
              >
                <IconButton
                  size="xsmall"
                  onClick={openFieldSelectorDialog}
                  disabled={!contentItem}
                >
                  <ReplaceContentItem fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip
                enterDelay={1000}
                disableInteractive
                title="Edit Content Item"
              >
                <IconButton
                  size="xsmall"
                  onClick={() =>
                    history.push(
                      `/content/${relatedModelData?.ZUID}/${itemZUID}`
                    )
                  }
                  disabled={!contentItem}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip
                enterDelay={1000}
                disableInteractive
                title="More Options"
              >
                <IconButton
                  data-cy="active-relational-item-more-button"
                  size="xsmall"
                  onClick={(evt) => setAnchorEl(evt.currentTarget)}
                >
                  <MoreHoriz fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
        {!!anchorEl && (
          <Menu
            open
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            {isPublishable && (
              <MenuItem
                data-cy="active-relational-item-publish-now-button"
                onClick={() => {
                  setAnchorEl(null);
                  setIsPublishModalOpen(true);
                }}
              >
                <ListItemIcon>
                  <CloudUploadRounded />
                </ListItemIcon>
                <ListItemText primary="Publish Now" />
              </MenuItem>
            )}
            {isPublishable && (
              <MenuItem
                data-cy="active-relational-item-schedule-publish-button"
                onClick={() => {
                  setAnchorEl(null);
                  setIsScheduleModalOpen(true);
                }}
              >
                <ListItemIcon>
                  <ScheduleRounded />
                </ListItemIcon>
                <ListItemText primary="Schedule Publish" />
              </MenuItem>
            )}
            {!!contentItem?.meta?.version && (
              <MenuItem
                onClick={() => {
                  // @ts-expect-error Config not typed
                  let devUrl = `${CONFIG.URL_PREVIEW_PROTOCOL}${instance.randomHashID}${CONFIG.URL_PREVIEW}${contentItem?.web?.path}`;

                  if (previewLock) {
                    devUrl = `${devUrl}?zpw=${previewLock.value}`;
                  }

                  setAnchorEl(null);
                  window.open(devUrl, "_blank");
                }}
              >
                <ListItemIcon>
                  <DesignServicesRounded />
                </ListItemIcon>
                <ListItemText
                  primary={`Draft Preview - v${contentItem?.meta?.version}`}
                />
              </MenuItem>
            )}
            {!!contentItem?.publishing?.version && (
              <MenuItem
                onClick={() => {
                  const prodUrl =
                    domain + contentItem?.web?.pathPart !== "zesty_home"
                      ? contentItem?.web?.path
                      : "";

                  setAnchorEl(null);
                  window.open(prodUrl, "_blank");
                }}
              >
                <ListItemIcon>
                  <LanguageRounded />
                </ListItemIcon>
                <ListItemText
                  primary={`Production Preview - v${contentItem?.publishing?.version}`}
                />
              </MenuItem>
            )}

            {!!contentItem && (
              <MenuItem onClick={handleCopyZUID}>
                <ListItemIcon>
                  {isCopied ? <CheckRounded /> : <WidgetsRounded />}
                </ListItemIcon>
                <ListItemText primary="Copy ZUID" />
              </MenuItem>
            )}
            <MenuItem
              data-cy="active-relational-item-remove-item-button"
              onClick={() => onRemoveCard(itemZUID)}
            >
              <ListItemIcon>
                <CloseRounded />
              </ListItemIcon>
              <ListItemText primary="Remove" />
            </MenuItem>
          </Menu>
        )}
        {isPublishModalOpen && (
          <ConfirmPublishModal
            contentTitle={String(itemTitle)}
            contentVersion={contentItem?.web?.version}
            onCancel={() => setIsPublishModalOpen(false)}
            onConfirm={() => handlePublish()}
            isPublishing={isPublishing || isUnpublishing}
          />
        )}
        {isScheduleModalOpen && (
          <SchedulePublish
            item={contentItem}
            onPublishNow={() => handlePublish()}
            onClose={() => setIsScheduleModalOpen(false)}
            onScheduleSuccess={() => setIsScheduleModalOpen(false)}
            onUnscheduleSuccess={() => setIsScheduleModalOpen(true)}
          />
        )}
      </>
    );
  }
);

ActiveItem.displayName = "ActiveItem";
