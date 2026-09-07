import { Typography, Stack, Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  if (isBuildingReferences) {
    return (
      <Stack py={1.5} gap={1}>
        <Typography variant="body2" fontWeight={600} color="text.primary">
          {t("content.blocksReferencedInCodeOrFreestyle")}
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
        {t("content.blocksReferencedInCodeOrFreestyle")}
      </Typography>
      {blockReferences.map((ref) => (
        <BlockPreview key={ref.meta.ZUID} variantData={ref} />
      ))}
    </Stack>
  );
};
