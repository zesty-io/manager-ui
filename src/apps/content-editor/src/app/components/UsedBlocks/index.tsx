import { Typography, Stack, Skeleton } from "@mui/material";
import { ContentItem } from "shell/services/types";
import { BlockPreview } from "./BlockPreview";

type UsedBlocksProps = {
  blockReferences: ContentItem[];
  isBuildingReferences: boolean;
};

export const UsedBlocks = ({
  blockReferences,
  isBuildingReferences,
}: UsedBlocksProps) => {
  if (isBuildingReferences) {
    return (
      <Stack py={1.5} gap={1}>
        <Typography variant="body2" fontWeight={600} color="text.primary">
          Blocks Referenced in Code or Freestyle
        </Typography>
        <Skeleton variant="rounded" height={392} width="100%" />
      </Stack>
    );
  }

  if (!blockReferences.length) {
    return <></>;
  }

  return (
    <Stack py={1.5} gap={1} data-cy="UsedBlocks">
      <Typography variant="body2" fontWeight={600} color="text.primary">
        Blocks Referenced in Code or Freestyle
      </Typography>
      {blockReferences.map((ref) => (
        <BlockPreview key={ref.meta.ZUID} variantData={ref} />
      ))}
    </Stack>
  );
};
