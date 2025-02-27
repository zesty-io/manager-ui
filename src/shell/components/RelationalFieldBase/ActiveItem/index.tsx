import { memo, useState, useMemo } from "react";
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
  SvgIcon,
  SvgIconProps,
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
import { fetchItemPublishing } from "../../../store/content";
import { SchedulePublish } from "../../SchedulePublish";
import { useDomain } from "../../../hooks/use-domain";

const ReplaceContentIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none">
        <path
          d="M2 16.9691V14.6661H13.4191V16.9691H2ZM2 10.636V8.33307H19.8899V10.636H2ZM2 4.30293V2H19.8899V4.30293H2Z"
          fill="currentColor"
        />
        <path
          d="M18 19C17.337 19 16.7011 18.7366 16.2322 18.2678C15.7634 17.7989 15.5 17.163 15.5 16.5C15.5 16.1 15.59 15.72 15.76 15.38L14.67 14.29C14.25 14.92 14 15.68 14 16.5C14 18.71 15.79 20.5 18 20.5V22L20.25 19.75L18 17.5V19ZM18 12.5V11L15.75 13.25L18 15.5V14C18.663 14 19.2989 14.2634 19.7678 14.7322C20.2366 15.2011 20.5 15.837 20.5 16.5C20.5 16.9 20.41 17.28 20.24 17.62L21.33 18.71C21.75 18.08 22 17.32 22 16.5C22 14.29 20.21 12.5 18 12.5Z"
          fill="currentColor"
        />
      </svg>
    </SvgIcon>
  );
};

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
      useGetContentModelFieldsQuery(relatedModelData?.ZUID, {
        skip: !relatedModelData?.ZUID,
      });
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
                  "-webkit-line-clamp": "1",
                  "-webkit-box-orient": "vertical",
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
                    "-webkit-line-clamp": "1",
                    "-webkit-box-orient": "vertical",
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
                  <ReplaceContentIcon fontSize="small" />
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
