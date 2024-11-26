import { Box, MenuItem, Stack, Typography } from "@mui/material";
import { ScheduleRounded, LanguageRounded } from "@mui/icons-material";

import { ContentItem } from "../../../../../../../../../shell/services/types";

export type Version = {
  itemZUID: string;
  modelZUID: string;
  itemVersionZUID: string;
  itemVersion: number;
  labels: any[];
  createdAt: string;
  isPublished: boolean;
  isScheduled: boolean;
};
type VersionItemProps = {
  data: Version;
  isActive: boolean;
  withBottomBorder: boolean;
};
export const VersionItem = ({
  data,
  isActive,
  withBottomBorder,
}: VersionItemProps) => {
  return (
    <MenuItem
      sx={{
        borderColor: "border",
        bgcolor: isActive ? "background.paper" : "transparent",
        p: 2,
      }}
      divider={withBottomBorder}
    >
      <Stack direction="row" justifyContent="space-between" width="100%">
        <Stack direction="row" gap={1}>
          <Typography variant="body1" color="text.primary" fontWeight={700}>
            v{data?.itemVersion}
          </Typography>
          {data?.isPublished && (
            <Stack direction="row" gap={0.25} alignItems="center">
              <LanguageRounded color="success" fontSize="small" />
              <Typography variant="body2" color="success.dark" fontWeight={600}>
                Published
              </Typography>
            </Stack>
          )}
          {data?.isScheduled && (
            <Stack direction="row" gap={0.25} alignItems="center">
              <ScheduleRounded
                color="warning"
                fontSize="small"
                sx={{ mr: 0.25 }}
              />
              <Typography variant="body2" color="warning.main" fontWeight={600}>
                Scheduled
              </Typography>
            </Stack>
          )}
        </Stack>
        <Typography variant="body1" color="text.secondary">
          {data?.createdAt}
        </Typography>
      </Stack>
    </MenuItem>
  );
};
