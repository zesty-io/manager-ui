import { Stack, Typography, Tooltip, Box } from "@mui/material";
import { InfoRounded } from "@mui/icons-material";

import { CopyTextField } from "../../../../../../../../shell/components/CopyTextField";

export const CodeSample = () => {
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
            Block Selector
          </Typography>
          <Tooltip
            title='Uses the value of a block selector field. Replace "block_selector_field" with the actual name of the block selector field during model creation.'
            sx={{
              fontSize: "12px",
            }}
          >
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
            Base Template
          </Typography>
          <Tooltip
            title="Uses the base template for rendering the block. This is the default template applied when no specific template is selected."
            sx={{
              fontSize: "12px",
            }}
          >
            <InfoRounded color="action" sx={{ width: 12, height: 12 }} />
          </Tooltip>
        </Stack>
        <CopyTextField value="{{ block('/-/block/tests_blocks.html') }}" />
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
            Base Template with Version
          </Typography>
          <Tooltip
            title="Uses the base template for rendering the block with a specific version number. Adding the version parameter allows you to target a particular version of the template."
            sx={{
              fontSize: "12px",
            }}
          >
            <InfoRounded color="action" sx={{ width: 12, height: 12 }} />
          </Tooltip>
        </Stack>
        <CopyTextField value="{{ block('/-/block/test_block_3.html?version=5') }}" />
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
            Specific Block Variant
          </Typography>
          <Tooltip
            title="Uses a specific variant of the block. The variant parameter targets a particular variation of the block by its ZUID."
            sx={{
              fontSize: "12px",
            }}
          >
            <InfoRounded color="action" sx={{ width: 12, height: 12 }} />
          </Tooltip>
        </Stack>
        <CopyTextField value="{{ block('/-/block/test_block_3.html?variant=7-e694b0d995-dngkkt') }}" />
      </Box>
    </Stack>
  );
};
