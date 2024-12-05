import { useState, forwardRef, useRef, ForwardedRef } from "react";
import {
  Box,
  MenuItem,
  Stack,
  Typography,
  Chip,
  TextField,
  InputAdornment,
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

const DUMMY_LABELS: any[] = [
  {
    ZUID: "36-14b315-4pp20v3d",
    name: "Approved",
    description: "Approved",
    color: "#12b76a",
    allowPublish: false,
    sort: 3,
    addPermissionRoles: [],
    removePermissionRoles: [],
    createdByUserZUID: "55-8094cbd789-42sw0c",
    updatedByUserZUID: "55-8094cbd789-42sw0c",
    createdAt: "2024-11-19T17:18:15Z",
    updatedAt: "2024-11-25T06:21:22Z",
  },
  {
    ZUID: "36-14b315-d24ft",
    name: "Draft",
    description: "Content item is only available to preview in stage",
    color: "#0BA5EC",
    allowPublish: false,
    sort: 1,
    addPermissionRoles: [],
    removePermissionRoles: [],
    createdByUserZUID: "55-8094cbd789-42sw0c",
    updatedByUserZUID: "55-8094cbd789-42sw0c",
    createdAt: "2024-11-19T17:18:02Z",
    updatedAt: "2024-11-25T06:21:22Z",
  },
  {
    ZUID: "36-n33d5-23v13w",
    name: "Needs Review",
    description: "Ready for review",
    color: "#ff5c08",
    allowPublish: false,
    sort: 2,
    addPermissionRoles: [],
    removePermissionRoles: [],
    createdByUserZUID: "55-8094cbd789-42sw0c",
    updatedByUserZUID: "55-8094cbd789-42sw0c",
    createdAt: "2024-11-19T17:18:08Z",
    updatedAt: "2024-11-25T06:21:23Z",
  },
];

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
    const searchRef = useRef<HTMLDivElement>(null);
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
          searchRef.current?.querySelector("input").focus();
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
              ref={searchRef}
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
              sx={{
                my: 1.5,
                px: 1,
              }}
            />
            {DUMMY_LABELS?.map((label: any, index) => (
              <MenuItem
                key={label.ZUID}
                sx={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  px: 1,
                  py: 1.5,
                  borderBottom: index + 1 < DUMMY_LABELS?.length ? 1 : 0,
                  borderColor: "border",
                }}
              >
                <Stack direction="row" gap={1}>
                  <Check fontSize="small" color="action" />
                  <Stack gap={0.5} direction="row" alignItems="baseline">
                    <Box
                      width={12}
                      height={12}
                      borderRadius="50%"
                      bgcolor={label.color}
                      flexShrink={0}
                    ></Box>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{
                        wordBreak: "break-word",
                        whiteSpace: "wrap",
                      }}
                    >
                      {label.name}
                    </Typography>
                  </Stack>
                </Stack>
                <Typography
                  variant="body3"
                  fontWeight={600}
                  color="text.secondary"
                  sx={{
                    pt: 0.25,
                    pl: 3.5,
                    wordBreak: "break-word",
                    whiteSpace: "wrap",
                  }}
                >
                  {label.description}
                </Typography>
              </MenuItem>
            ))}
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
