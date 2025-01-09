import { memo, useState, useMemo, useEffect } from "react";
import { Typography, Stack, Box, Skeleton, IconButton } from "@mui/material";
import {
  DragIndicatorRounded,
  Edit,
  MoreHoriz,
  ImageRounded,
} from "@mui/icons-material";
import moment from "moment-timezone";
import { useHistory } from "react-router";

import {
  useGetContentItemQuery,
  useGetContentModelFieldsQuery,
  useGetItemPublishingsQuery,
} from "../../../services/instance";
import { useGetUsersQuery } from "../../../services/accounts";
import { ContentModel, ContentModelField } from "../../../services/types";
import { useLazyGetFileQuery } from "../../../services/mediaManager";
import { fileExtension } from "../../../../apps/media/src/app/utils/fileUtils";
import { ActiveItemLoading } from "./ActiveItemLoading";
import { VersionChip } from "../VersionChip";

type ActiveItemProps = {
  itemZUID: string;
  relatedFieldData: ContentModelField;
  relatedModelData: ContentModel;
  draggable?: boolean;
};
export const ActiveItem = memo(
  ({
    itemZUID,
    relatedFieldData,
    relatedModelData,
    draggable,
  }: ActiveItemProps) => {
    const [imageURL, setImageURL] = useState(null);
    const history = useHistory();
    const { data: contentItem, isLoading: isLoadingContentItem } =
      useGetContentItemQuery(itemZUID, {
        skip: !itemZUID,
      });
    const {
      data: contentItemPublishings,
      isLoading: isLoadingContentItemPublishings,
    } = useGetItemPublishingsQuery(
      {
        modelZUID: relatedModelData?.ZUID,
        itemZUID,
      },
      {
        skip: !relatedModelData || !itemZUID,
      }
    );
    const { data: relatedModelFields, isLoading: isLoadingRelatedModel } =
      useGetContentModelFieldsQuery(relatedModelData?.ZUID, {
        skip: !relatedModelData?.ZUID,
      });
    const [getFile, { isLoading: isLoadingImage }] = useLazyGetFileQuery();
    const { data: users, isLoading: isLoadingUsers } = useGetUsersQuery();

    const itemTitle =
      contentItem?.data[relatedFieldData?.name] ||
      contentItem?.web?.metaTitle ||
      contentItem?.web?.metaLinkText;

    const isLoading =
      isLoadingContentItem ||
      isLoadingRelatedModel ||
      isLoadingImage ||
      isLoadingContentItemPublishings ||
      isLoadingUsers;

    const resolveUserZUID = (userZUID: string) => {
      const user = users?.find((user) => user.ZUID === userZUID);

      if (!!user) {
        return `${user?.firstName} ${user.lastName}`;
      }

      return userZUID;
    };

    const imageFields = useMemo(() => {
      if (!relatedModelFields?.length) return [];

      return relatedModelFields.filter(
        (field) => !field.deletedAt && field.datatype === "images"
      );
    }, [relatedModelFields]);

    const publishStatus = useMemo(() => {
      const publishedVersion = contentItemPublishings?.find(
        (publishing) => publishing._active
      );
      const scheduledVersion = contentItemPublishings?.find(
        (publishing) =>
          !publishing._active && moment.utc().isBefore(publishing.publishAt)
      );

      return {
        draft:
          contentItem?.meta?.version > (publishedVersion?.version || 0)
            ? {
                version: contentItem?.meta?.version,
                publisher: resolveUserZUID(
                  contentItem?.meta?.createdByUserZUID
                ),
                dateTime: contentItem?.meta?.updatedAt,
              }
            : null,
        published: !!publishedVersion
          ? {
              version: publishedVersion.version,
              publisher: resolveUserZUID(publishedVersion.publishedByUserZUID),
              dateTime: publishedVersion.publishAt,
            }
          : null,
        scheduled: !!scheduledVersion
          ? {
              version: scheduledVersion.version,
              publisher: resolveUserZUID(scheduledVersion.publishedByUserZUID),
              dateTime: scheduledVersion.publishAt,
            }
          : null,
      };
    }, [contentItem, contentItemPublishings, users]);

    useEffect(() => {
      if (!imageFields?.length || !contentItem) return;

      const images = imageFields.map(async (field) => {
        if (!!contentItem?.data?.[field.name]) {
          const value = String(contentItem?.data?.[field.name])?.split(
            ","
          )?.[0];

          if (value.startsWith("3-")) {
            const res = await getFile(value).unwrap();
            if (
              ["png", "jpg", "jpeg", "svg", "gif", "tif", "webp"].includes(
                fileExtension(res.url)
              )
            ) {
              return res.url;
            }
          } else {
            return value;
          }
        }
      });

      Promise.all(images).then((_images) => setImageURL(_images?.[0]));
    }, [imageFields, contentItem]);

    if (isLoading) {
      return <ActiveItemLoading draggable={draggable} />;
    }

    return (
      <Stack
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
        }}
      >
        <Stack direction="row" alignItems="center" flexGrow={1}>
          {draggable && (
            <IconButton
              disableRipple
              disableFocusRipple
              disableTouchRipple
              size="xsmall"
              sx={{ cursor: "grab", mx: 0.5 }}
            >
              <DragIndicatorRounded fontSize="small" />
            </IconButton>
          )}
          {!!imageFields?.length &&
            (!!imageURL ? (
              <Box
                component="img"
                loading="lazy"
                width={64}
                height={64}
                src={`${imageURL}?width=64&fit=contain`}
                sx={{
                  flexShrink: 0,
                  bgcolor: "grey.100",
                  objectFit: "contain",
                  overflow: "hidden",
                }}
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
            ml={
              !!imageFields?.length || (!imageFields?.length && !draggable)
                ? 2
                : 0
            }
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
          <Stack gap={0.25}>
            {!!publishStatus?.draft && (
              <VersionChip
                type="draft"
                version={publishStatus.draft.version}
                publisher={publishStatus.draft.publisher}
                dateTime={publishStatus.draft.dateTime}
              />
            )}
            {!!publishStatus?.scheduled ? (
              <VersionChip
                type="scheduled"
                version={publishStatus.scheduled.version}
                publisher={publishStatus.scheduled.publisher}
                dateTime={publishStatus.scheduled.dateTime}
              />
            ) : publishStatus?.published ? (
              <VersionChip
                type="published"
                version={publishStatus.published.version}
                publisher={publishStatus.published.publisher}
                dateTime={publishStatus.published.dateTime}
              />
            ) : (
              <></>
            )}
          </Stack>
          <Stack direction="row" gap={1}>
            <IconButton
              size="xsmall"
              onClick={() =>
                history.push(`/content/${relatedModelData?.ZUID}/${itemZUID}`)
              }
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="xsmall">
              <MoreHoriz fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    );
  }
);

ActiveItem.displayName = "ActiveItem";
