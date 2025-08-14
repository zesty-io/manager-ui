import {
  memo,
  useState,
  forwardRef,
  useRef,
  ForwardedRef,
  useMemo,
  useCallback,
} from "react";
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
  Tooltip,
} from "@mui/material";
import {
  ScheduleRounded,
  LanguageRounded,
  AddRounded,
  SearchRounded,
  EditRounded,
  Check,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useDebounce, useUnmount } from "react-use";
import { useHistory, useParams } from "react-router";
import { areEqual } from "react-window";
import { isEqual } from "lodash";

import {
  useGetWorkflowStatusLabelsQuery,
  useUpdateItemWorkflowStatusMutation,
} from "../../../../../../../../../shell/services/instance";
import {
  User,
  WorkflowStatusLabel,
} from "../../../../../../../../../shell/services/types";
import { AppState } from "../../../../../../../../../shell/store/types";
import { useGetUsersRolesQuery } from "../../../../../../../../../shell/services/accounts";
import { NoResults } from "./NoResults";

export const BG_COLOR_MAPPING: Record<string, string> = {
  "#0ba5ec": "blue.100",
  "#12b76a": "green.100",
  "#f79009": "yellow.100",
  "#4e5ba6": "deepPurple.100",
  "#7a5af8": "purple.100",
  "#ee46bc": "pink.100",
  "#ff5c08": "deepOrange.100",
  "#f04438": "red.100",
  "#f63d68": "#ffe4e8",
  "#667085": "grey.100",
} as const;
export type Version = {
  itemZUID: string;
  modelZUID: string;
  itemVersionZUID: string;
  itemVersion: number;
  itemWorkflowZUID: string;
  labels: WorkflowStatusLabel[];
  createdAt: string;
  isPublished: boolean;
  isScheduled: boolean;
};
type VersionItemProps = {
  data: Version;
  isActive: boolean;
};
export const VersionItem = memo(
  forwardRef(
    (
      { data, isActive }: VersionItemProps,
      ref: ForwardedRef<HTMLDivElement>
    ) => {
      const history = useHistory();
      const { modelZUID, itemZUID } = useParams<{
        modelZUID: string;
        itemZUID: string;
      }>();
      const user: User = useSelector((state: AppState) => state.user);
      const addNewLabelRef = useRef<HTMLDivElement>(null);
      const searchRef = useRef<HTMLDivElement>(null);
      const { data: statusLabels } = useGetWorkflowStatusLabelsQuery();
      const { data: usersRoles } = useGetUsersRolesQuery();
      const [updateItemWorkflowStatus] = useUpdateItemWorkflowStatusMutation();
      const [isAddNewLabelOpen, setIsAddNewLabelOpen] = useState(false);
      const [filterKeyword, setFilterKeyword] = useState("");
      const [debouncedFilterKeyword, setDebouncedFilterKeyword] = useState("");
      const [activeLabels, setActiveLabels] = useState(
        data?.labels?.map((label) => label?.ZUID)?.filter((label) => !!label)
      );
      const lastSavedLabels = useRef(activeLabels);

      const currentUserRoleZUID = usersRoles?.find(
        (userWithRole) => userWithRole.ZUID === user.ZUID
      )?.role?.ZUID;

      useDebounce(() => setDebouncedFilterKeyword(filterKeyword), 200, [
        filterKeyword,
      ]);

      useUnmount(() => saveLabelChanges());

      const filteredStatusLabels = useMemo(() => {
        if (!statusLabels?.length) return [];

        const sortedStatusLabels = [...statusLabels]?.sort(
          (a, b) => a.sort - b.sort
        );

        if (!debouncedFilterKeyword) return sortedStatusLabels;

        return sortedStatusLabels
          ?.filter((label) =>
            label.name
              ?.toLowerCase()
              .includes(debouncedFilterKeyword?.toLowerCase()?.trim())
          )
          .sort((a, b) => a.sort - b.sort);
      }, [statusLabels, debouncedFilterKeyword]);

      const handleOpenAddNewLabel = (evt: any) => {
        evt.stopPropagation();

        if (isActive) {
          setIsAddNewLabelOpen((prev) => !prev);

          setTimeout(() => {
            searchRef.current?.querySelector("input").focus();
          });
        }
      };

      const handleToggleLabel = (ZUID: string) => {
        if (activeLabels?.includes(ZUID)) {
          setActiveLabels(activeLabels.filter((label) => label !== ZUID));
        } else {
          setActiveLabels([...activeLabels, ZUID]);
        }
      };

      const saveLabelChanges = useCallback(() => {
        if (!isEqual(lastSavedLabels.current, activeLabels)) {
          updateItemWorkflowStatus({
            modelZUID,
            itemZUID,
            itemWorkflowZUID: data?.itemWorkflowZUID,
            labelZUIDs: activeLabels,
          });
          lastSavedLabels.current = activeLabels;
        }
      }, [activeLabels, modelZUID, itemZUID, data?.itemWorkflowZUID]);

      return (
        <Stack ref={ref} width="100%" data-cy="VersionItem">
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
          <Stack
            direction="row"
            gap={1}
            width="100%"
            flexWrap="wrap"
            px={2}
            pt={1.25}
            pb={2}
          >
            {activeLabels?.map((labelZUID) => {
              const labelData = statusLabels?.find(
                (status) => status.ZUID === labelZUID
              );

              return (
                <Chip
                  id="content-active-status-abel-item"
                  data-cy="ActiveWorkflowStatusLabel"
                  key={labelData.ZUID}
                  clickable
                  onClick={handleOpenAddNewLabel}
                  label={labelData.name}
                  size="small"
                  sx={{
                    color: labelData.color,
                    bgcolor: BG_COLOR_MAPPING[labelData.color.toLowerCase()],

                    "&:hover": {
                      bgcolor: BG_COLOR_MAPPING[labelData.color.toLowerCase()],
                    },
                    "&:focus": {
                      bgcolor: BG_COLOR_MAPPING[labelData.color.toLowerCase()],
                    },
                  }}
                />
              );
            })}
            {isActive && (
              <Chip
                id="content-status-label-add-button"
                data-cy="AddWorkflowStatusLabel"
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
          {isAddNewLabelOpen && (
            <Box
              id="content-status-label-add-menu"
              ref={addNewLabelRef}
              onClick={(evt) => evt.stopPropagation()}
              borderTop={1}
              borderColor="border"
              width="100%"
              overflow="hidden"
            >
              <TextField
                id="content-status-label-add-menu-search-input"
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
              {!filteredStatusLabels?.length && filterKeyword && (
                <NoResults
                  query={filterKeyword}
                  onSearchAgain={() => {
                    setFilterKeyword("");
                    searchRef.current?.querySelector("input").focus();
                  }}
                />
              )}
              {filteredStatusLabels?.map((label, index) => {
                let title = "";
                const canRemove =
                  label.removePermissionRoles?.includes(currentUserRoleZUID);
                const canAdd =
                  label.addPermissionRoles?.includes(currentUserRoleZUID);

                if (!canAdd && !activeLabels.includes(label.ZUID)) {
                  title = "Do not have permission to add this status";
                }

                if (!canRemove && activeLabels.includes(label.ZUID)) {
                  title = "Do not have permission to remove this status";
                }

                return (
                  <Tooltip key={label.ZUID} followCursor title={title}>
                    <MenuItem
                      id="content-status-label-add-menu-item"
                      component="div"
                      data-cy="WorkflowStatusLabelOption"
                      key={label.ZUID}
                      sx={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                        px: 1,
                        py: 1.5,
                        borderBottom: index + 1 < statusLabels?.length ? 1 : 0,
                        borderColor: "border",
                      }}
                      onClick={() => {
                        if (
                          (activeLabels.includes(label.ZUID) && canRemove) ||
                          (!activeLabels.includes(label.ZUID) && canAdd)
                        ) {
                          handleToggleLabel(label.ZUID);
                        }
                      }}
                    >
                      <Stack direction="row" gap={1}>
                        <Check
                          id="content-status-label-add-menu-item-select"
                          fontSize="small"
                          color="action"
                          sx={{
                            visibility: activeLabels?.includes(label.ZUID)
                              ? "visible"
                              : "hidden",
                          }}
                        />
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
                  </Tooltip>
                );
              })}
              <MenuItem
                id="content-status-label-add-menu-edit-button"
                component="div"
                sx={{
                  pr: 1,
                  pl: 4,
                  borderTop: 1,
                  borderColor: "border",
                  height: 44,
                }}
                onClick={() => history.push("/settings/user/workflows")}
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
  ),
  areEqual
);

VersionItem.displayName = "VersionItem";
