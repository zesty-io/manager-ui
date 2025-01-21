import { Stack } from "@mui/material";

import { ContentItem, Publishing } from "../../../services/types";
import { VersionChip } from "../VersionChip";

type VersionCellProps = {
  itemData: ContentItem & { createdByName: string };
  publishData: Publishing & { publishedByName: string };
  scheduleData: Publishing & { scheduledByName: string };
};
export const VersionCell = ({
  itemData,
  publishData,
  scheduleData,
}: VersionCellProps) => {
  return (
    <Stack gap={0.25}>
      {itemData?.meta?.version > (publishData?.version || 0) && (
        <VersionChip
          type="draft"
          version={itemData?.meta?.version}
          publisher={itemData?.createdByName}
          dateTime={itemData?.meta?.updatedAt}
        />
      )}
      {!!scheduleData ? (
        <VersionChip
          type="scheduled"
          version={scheduleData.version}
          publisher={scheduleData.scheduledByName}
          dateTime={scheduleData.publishAt}
        />
      ) : publishData ? (
        <VersionChip
          type="published"
          version={publishData.version}
          publisher={publishData.publishedByName}
          dateTime={publishData.publishAt}
        />
      ) : (
        <></>
      )}
    </Stack>
  );
};
