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
} from "@mui/icons-material";
import { useHistory } from "react-router";
import { useDrag, useDrop } from "react-dnd";
import { useSelector } from "react-redux";

import { useGetContentModelFieldsQuery } from "../../../services/instance";
import { ContentModel, ContentModelField } from "../../../services/types";
import { ActiveItemLoading } from "./ActiveItemLoading";
import { VersionCell } from "../FieldSelectorDialog/VersionCell";
import { AppState } from "../../../store/types";
import { useGetUsersQuery } from "../../../services/accounts";

type ActiveItemProps = {
  itemZUID: string;
  index: number;
  relatedFieldData: ContentModelField;
  relatedModelData: ContentModel;
  onMoveCard: (draggedItemZUID: string, dropIndex: number) => void;
  onDropCard: () => void;
  draggable?: boolean;
};
export const ActiveItem = memo(
  ({
    itemZUID,
    index,
    relatedFieldData,
    relatedModelData,
    onMoveCard,
    onDropCard,
    draggable,
  }: ActiveItemProps) => {
    const [imageError, setImageError] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const history = useHistory();
    const contentItems = useSelector((state: AppState) => state.content);
    const { data: relatedModelFields, isLoading: isLoadingRelatedModel } =
      useGetContentModelFieldsQuery(relatedModelData?.ZUID, {
        skip: !relatedModelData?.ZUID,
      });
    const { data: users, isLoading: isLoadingUsers } = useGetUsersQuery();

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

    const itemTitle =
      contentItem?.data[relatedFieldData?.name] ||
      contentItem?.web?.metaTitle ||
      contentItem?.web?.metaLinkText ||
      itemZUID;

    if (isLoadingRelatedModel || isLoadingUsers) {
      return <ActiveItemLoading draggable={draggable} />;
    }

    return (
      <>
        <Stack
          ref={(node) => drop(preview(node))}
          direction="row"
          sx={{
            bgcolor: "background.paper",
            height: 64,
            width: "100%",
            border: 1,
            borderColor: "border",
            borderRadius: 2,
            alignItems: "center",
            overflow: "hidden",
            opacity: isDragging ? 0 : 1,
          }}
        >
          <Stack direction="row" alignItems="center" flexGrow={1}>
            {draggable && (
              <IconButton
                ref={drag}
                disableRipple
                disableFocusRipple
                disableTouchRipple
                size="xsmall"
                sx={{ cursor: "grab", mx: 0.5 }}
              >
                <DragIndicatorRounded fontSize="small" />
              </IconButton>
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
              <IconButton
                size="xsmall"
                onClick={() =>
                  history.push(`/content/${relatedModelData?.ZUID}/${itemZUID}`)
                }
              >
                <Edit fontSize="small" />
              </IconButton>
              <IconButton
                size="xsmall"
                onClick={(evt) => setAnchorEl(evt.currentTarget)}
              >
                <MoreHoriz fontSize="small" />
              </IconButton>
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
            <MenuItem>
              <ListItemIcon>
                <CloudUploadRounded />
              </ListItemIcon>
              <ListItemText primary="Publish Now" />
            </MenuItem>
            <MenuItem>
              <ListItemIcon>
                <ScheduleRounded />
              </ListItemIcon>
              <ListItemText primary="Schedule Publish" />
            </MenuItem>
            <MenuItem>
              <ListItemIcon>
                <DesignServicesRounded />
              </ListItemIcon>
              <ListItemText primary="Draft Preview - vXXX" />
            </MenuItem>
            <MenuItem>
              <ListItemIcon>
                <LanguageRounded />
              </ListItemIcon>
              <ListItemText primary="Production Preview - vXXX" />
            </MenuItem>
            <MenuItem>
              <ListItemIcon>
                <WidgetsRounded />
              </ListItemIcon>
              <ListItemText primary="Copy ZUID" />
            </MenuItem>
            <MenuItem>
              <ListItemIcon>
                <CloseRounded />
              </ListItemIcon>
              <ListItemText primary="Remove" />
            </MenuItem>
          </Menu>
        )}
      </>
    );
  }
);

ActiveItem.displayName = "ActiveItem";
