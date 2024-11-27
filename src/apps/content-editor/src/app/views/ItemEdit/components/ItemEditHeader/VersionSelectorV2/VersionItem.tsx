import { Box, MenuItem, Stack, Typography, Chip } from "@mui/material";
import {
  ScheduleRounded,
  LanguageRounded,
  AddRounded,
} from "@mui/icons-material";

import { ContentItem } from "../../../../../../../../../shell/services/types";
import { MouseEventHandler } from "react";

const chipColors = [
  "default",
  "error",
  "success",
  "info",
  "primary",
  "secondary",
  "warning",
];
const generateRandomChipColor = () => {
  return chipColors[Math.floor(Math.random() * chipColors.length)];
};

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
};
export const VersionItem = ({ data, isActive }: VersionItemProps) => {
  return (
    <>
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
      {!!data?.labels?.length && (
        <Stack direction="row" gap={1} width="100%" mt={1.25} flexWrap="wrap">
          {data.labels.map((label) => (
            <Chip
              clickable
              onClick={(evt: any) => {
                evt.stopPropagation();
                console.log("open add label dropdown");
              }}
              label={label}
              // @ts-expect-error
              color={generateRandomChipColor()}
              size="small"
            />
          ))}
          {isActive && (
            <Chip
              clickable
              label="Add Status"
              color="default"
              size="small"
              onClick={(evt) => {
                evt.stopPropagation();
                console.log("open add label dropdown");
              }}
              // Note: onDelete needs to be here for the custom deleteIcon to be visible
              onDelete={() => {}}
              deleteIcon={<AddRounded />}
            />
          )}
        </Stack>
      )}
    </>
  );
};
