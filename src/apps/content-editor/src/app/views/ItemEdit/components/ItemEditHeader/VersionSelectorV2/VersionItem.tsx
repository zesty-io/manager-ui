import { useState } from "react";
import {
  Box,
  MenuItem,
  Stack,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  ScheduleRounded,
  LanguageRounded,
  AddRounded,
  SearchRounded,
  EditRounded,
} from "@mui/icons-material";

import { ContentItem } from "../../../../../../../../../shell/services/types";
import {
  useGetItemWorkflowStatusQuery,
  useGetWorkflowStatusLabelsQuery,
} from "../../../../../../../../../shell/services/instance";

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
  // const { data: statusLabels  } = useGetItemWorkflowStatusQuery()
  const { data: statusLabels } = useGetWorkflowStatusLabelsQuery();
  const [isAddNewLabelOpen, setIsAddNewLabelOpen] = useState(false);
  const [filterKeyword, setFilterKeyword] = useState("");

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        width="100%"
        pt={2}
        px={2}
      >
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
        <Stack
          direction="row"
          gap={1}
          width="100%"
          flexWrap="wrap"
          px={2}
          pt={1.25}
          pb={2}
        >
          {data.labels.map((label) => (
            <Chip
              clickable
              onClick={(evt: any) => {
                evt.stopPropagation();
                if (isActive) {
                  setIsAddNewLabelOpen((prev) => !prev);
                }
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
                if (isActive) {
                  setIsAddNewLabelOpen((prev) => !prev);
                }
              }}
              // Note: onDelete needs to be here for the custom deleteIcon to be visible
              onDelete={() => {}}
              deleteIcon={<AddRounded />}
            />
          )}
        </Stack>
      )}
      {isAddNewLabelOpen && (
        <Box
          onClick={(evt) => evt.stopPropagation()}
          borderTop={1}
          borderColor="border"
          width="100%"
        >
          <TextField
            value={filterKeyword}
            onChange={(evt) => setFilterKeyword(evt.currentTarget.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded />
                </InputAdornment>
              ),
            }}
            placeholder="Search status"
            size="small"
            fullWidth
            autoFocus
            sx={{
              my: 1.5,
              px: 1,
            }}
          />
          <MenuItem
            sx={{
              pr: 1,
              pl: 4,
              borderTop: 1,
              borderColor: "border",
              height: 44,
            }}
          >
            <ListItemIcon>
              <EditRounded />
            </ListItemIcon>
            <ListItemText>Edit Statuses</ListItemText>
          </MenuItem>
        </Box>
      )}
    </>
  );
};
