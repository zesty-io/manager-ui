import moment from "moment";
import { useMemo } from "react";
import { Stack, Skeleton } from "@mui/material";

import { useGetUsersQuery } from "../../../services/accounts";
import { useGetItemPublishingsQuery } from "../../../services/instance";
import { ContentItem } from "../../../services/types";
import { VersionChip } from "../VersionChip";

type VersionCellProps = {
  modelZUID: string;
  itemZUID: string;
  itemData: ContentItem;
};
export const VersionCell = ({
  modelZUID,
  itemZUID,
  itemData,
}: VersionCellProps) => {
  const { data: users, isLoading: isLoadingUsers } = useGetUsersQuery();
  const {
    data: contentItemPublishings,
    isLoading: isLoadingContentItemPublishings,
  } = useGetItemPublishingsQuery(
    {
      modelZUID: modelZUID,
      itemZUID,
    },
    {
      skip: !modelZUID || !itemZUID,
    }
  );

  const resolveUserZUID = (userZUID: string) => {
    const user = users?.find((user) => user.ZUID === userZUID);

    if (!!user) {
      return `${user?.firstName} ${user.lastName}`;
    }

    return userZUID;
  };

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
        itemData?.meta?.version > (publishedVersion?.version || 0)
          ? {
              version: itemData?.meta?.version,
              publisher: resolveUserZUID(itemData?.meta?.createdByUserZUID),
              dateTime: itemData?.meta?.updatedAt,
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
  }, [itemData, contentItemPublishings, users]);

  if (isLoadingUsers || isLoadingContentItemPublishings) {
    return (
      <Stack gap={0.25}>
        <Stack
          height={20}
          width={28}
          bgcolor="grey.100"
          alignItems="center"
          justifyContent="center"
          borderRadius={1}
        >
          <Skeleton variant="rounded" height={10} width={20} />
        </Stack>
        <Stack
          height={20}
          width={28}
          bgcolor="grey.100"
          alignItems="center"
          justifyContent="center"
          borderRadius={1}
        >
          <Skeleton variant="rounded" height={10} width={20} />
        </Stack>
      </Stack>
    );
  }

  return (
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
  );
};
