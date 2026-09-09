import { Stack, Typography, Tooltip, Box, Skeleton } from "@mui/material";
import { InfoRounded } from "@mui/icons-material";
import { useParams } from "react-router";

import { CopyTextField } from "../../../../../../../../shell/components/CopyTextField";
import {
  useGetContentItemQuery,
  useGetContentModelQuery,
} from "../../../../../../../../shell/services/instance";

export const CodeSample = () => {
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
            variant="body2"
            sx={{
              fontWeight: 600,
            }}
          >
            Block Selector
          </Typography>
          <Tooltip title='Uses the value of a block selector field. Replace "block_selector_field" with the actual name of the block selector field during model creation.'>
            <InfoRounded color="action" sx={{ width: 12, height: 12 }} />
          </Tooltip>
        </Stack>
        <CopyTextField value="{{ block({this.block_selector_field}) }}" />
      </Box>

      <Box>
        <Stack direction="row" alignItems="center" gap={1} pb={0.5}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
            }}
          >
            Base Template
          </Typography>
          <Tooltip title="Uses the base template for rendering the block. This is the default template applied when no specific template is selected.">
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
            variant="body2"
            sx={{
              fontWeight: 600,
            }}
          >
            Base Template with Version
          </Typography>
          <Tooltip title="Uses the base template for rendering the block with a specific version number. Adding the version parameter allows you to target a particular version of the template.">
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
            variant="body2"
            sx={{
              fontWeight: 600,
            }}
          >
            Specific Block Variant
          </Typography>
          <Tooltip title="Uses a specific variant of the block. The variant parameter targets a particular variation of the block by its ZUID.">
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
