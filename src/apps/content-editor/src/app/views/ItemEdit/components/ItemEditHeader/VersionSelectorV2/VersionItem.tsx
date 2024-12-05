import { useState, forwardRef, useEffect, useRef } from "react";
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
  Check,
} from "@mui/icons-material";

import { ContentItem } from "../../../../../../../../../shell/services/types";
import {
  useGetItemWorkflowStatusQuery,
  useGetWorkflowStatusLabelsQuery,
} from "../../../../../../../../../shell/services/instance";
import { ForwardedRef } from "react-chartjs-2/dist/types";

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
  onUpdateElementHeight: () => void;
};
export const VersionItem = forwardRef(
  (
    { data, isActive, onUpdateElementHeight }: VersionItemProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const addNewLabelRef = useRef<HTMLDivElement>(null);
    // const { data: statusLabels  } = useGetItemWorkflowStatusQuery()
    // const { data: statusLabels } = useGetWorkflowStatusLabelsQuery();
    const [isAddNewLabelOpen, setIsAddNewLabelOpen] = useState(false);
    const [filterKeyword, setFilterKeyword] = useState("");

    const handleOpenAddNewLabel = (evt: any) => {
      evt.stopPropagation();

      if (isActive) {
        setIsAddNewLabelOpen((prev) => !prev);
        onUpdateElementHeight();

        // HACK: Prevents the dropdowm elements from flickering due to delayed height adjustment
        setTimeout(() => {
          addNewLabelRef.current.style.visibility = "visible";
        });
      }
    };

    return (
      <Stack ref={ref} width="100%">
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
                <Typography
                  variant="body2"
                  color="success.dark"
                  fontWeight={600}
                >
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
                <Typography
                  variant="body2"
                  color="warning.main"
                  fontWeight={600}
                >
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
                onClick={handleOpenAddNewLabel}
                label={label}
                // color={generateRandomChipColor()}
                color="primary"
                size="small"
              />
            ))}
            {isActive && (
              <Chip
                clickable
                label="Add Status"
                color="default"
                size="small"
                onClick={handleOpenAddNewLabel}
                // Note: onDelete needs to be here for the custom deleteIcon to be visible
                onDelete={() => {}}
                deleteIcon={<AddRounded />}
              />
            )}
          </Stack>
        )}
        {isAddNewLabelOpen && (
          <Box
            ref={addNewLabelRef}
            onClick={(evt) => evt.stopPropagation()}
            borderTop={1}
            borderColor="border"
            width="100%"
            // HACK: Prevents the dropdowm elements from flickering due to delayed height adjustment
            visibility="hidden"
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
                flexDirection: "column",
              }}
            >
              <Stack direction="row">
                <Check />{" "}
                <Typography variant="body2" fontWeight={700}>
                  Draft
                </Typography>
              </Stack>
              <Typography
                variant="body3"
                fontWeight={600}
                color="text.secondary"
              >
                Draft is ready for editor to check before sending to legal
              </Typography>
            </MenuItem>
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
      </Stack>
    );
  }
);

VersionItem.displayName = "VersionItem";
