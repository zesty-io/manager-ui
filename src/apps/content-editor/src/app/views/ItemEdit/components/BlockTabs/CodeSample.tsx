import { Stack, Typography, Tooltip, Box, Skeleton } from "@mui/material";
import { InfoRounded } from "@mui/icons-material";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";

import { CopyTextField } from "../../../../../../../../shell/components/CopyTextField";
import {
  useGetContentItemQuery,
  useGetContentModelQuery,
} from "../../../../../../../../shell/services/instance";

export const CodeSample = () => {
  const { t } = useTranslation();
  const { modelZUID, itemZUID } = useParams<{
    itemZUID: string;
    modelZUID: string;
  }>();
  const { data: model, isLoading: isLoadingModel } =
    useGetContentModelQuery(modelZUID);
  const { data: item, isLoading: isLoadingItem } =
    useGetContentItemQuery(itemZUID);

  return (
    <Stack gap={2} my={2} height="calc(100% - 80px)" sx={{ overflowY: "auto" }}>
      <Box>
        <Stack direction="row" alignItems="center" gap={1} pb={0.5}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "14px",
              lineHeight: "20px",
            }}
          >
            {t("content.codeSampleBlockSelector")}
          </Typography>
          <Tooltip title={t("content.codeSampleBlockSelectorTip")}>
            <InfoRounded color="action" sx={{ width: 12, height: 12 }} />
          </Tooltip>
        </Stack>
        <CopyTextField value="{{ block({this.block_selector_field}) }}" />
      </Box>

      <Box>
        <Stack direction="row" alignItems="center" gap={1} pb={0.5}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "14px",
              lineHeight: "20px",
            }}
          >
            {t("content.codeSampleBaseTemplate")}
          </Typography>
          <Tooltip title={t("content.codeSampleBaseTemplateTip")}>
            <InfoRounded color="action" sx={{ width: 12, height: 12 }} />
          </Tooltip>
        </Stack>
        {isLoadingModel ? (
          <Skeleton variant="rounded" width="100%" height={36} />
        ) : (
          <CopyTextField
            value={`{{ block('/-/block/${model?.name}.html') }}`}
          />
        )}
      </Box>

      <Box>
        <Stack direction="row" alignItems="center" gap={1} pb={0.5}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "14px",
              lineHeight: "20px",
            }}
          >
            {t("content.codeSampleBaseTemplateVersion")}
          </Typography>
          <Tooltip title={t("content.codeSampleBaseTemplateVersionTip")}>
            <InfoRounded color="action" sx={{ width: 12, height: 12 }} />
          </Tooltip>
        </Stack>
        {isLoadingModel || isLoadingItem ? (
          <Skeleton variant="rounded" width="100%" height={36} />
        ) : (
          <CopyTextField
            value={`{{ block('/-/block/${model?.name}.html?version=${item?.web?.version}') }}`}
          />
        )}
      </Box>

      <Box>
        <Stack direction="row" alignItems="center" gap={1} pb={0.5}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "14px",
              lineHeight: "20px",
            }}
          >
            {t("content.codeSampleSpecificVariant")}
          </Typography>
          <Tooltip title={t("content.codeSampleSpecificVariantTip")}>
            <InfoRounded color="action" sx={{ width: 12, height: 12 }} />
          </Tooltip>
        </Stack>
        {isLoadingModel ? (
          <Skeleton variant="rounded" width="100%" height={36} />
        ) : (
          <CopyTextField
            value={`{{ block('/-/block/${model?.name}.html?variant=${itemZUID}') }}`}
          />
        )}
      </Box>
    </Stack>
  );
};
