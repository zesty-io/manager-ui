import { FC, useReducer, useMemo, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  TextField,
  Select,
  Stack,
  InputLabel,
  Autocomplete,
  ListItem,
  MenuItem,
  Tooltip,
  Divider,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import CloseIcon from "@mui/icons-material/Close";
import moment from "moment";
import { upperFirst } from "lodash";
import { useHistory, useLocation } from "react-router";

import { useGetUsersQuery } from "../../../services/accounts";
import {
  PresetType,
  DateFilterModalType,
  DateRangeFilterValue,
  DateFilterValue,
} from "../../../components/Filters/DateFilter/types";
import { DateFilterModal } from "../../../components/Filters/DateFilter/DateFilterModal";
import { DateRangeFilterModal } from "../../../components/Filters/DateFilter/DateRangeFilterModal";
import { PRESET_DATES, CUSTOM_DATES, RESOURCE_TYPES } from "./config";
import { ResourceType } from "../../../services/types";
import { useGetLangsQuery } from "../../../services/instance";
import { useParams } from "../../../hooks/useParams";

interface User {
  firstName: string;
  lastName: string;
  ZUID: string;
  email: string;
}
export interface SearchData {
  keyword: string;
  user: User | null;
  date: DateFilterValue | null;
  resourceType: ResourceType | null;
  language: string | null;
}
interface AdvancedSearch {
  keyword: string;
  onClose: () => void;
  onSearch?: (searchData: SearchData) => void;
  searchAccelerator?: ResourceType | null;
}
export const AdvancedSearch: FC<AdvancedSearch> = ({
  keyword,
  onClose,
  onSearch,
  searchAccelerator = null,
}) => {
  const history = useHistory();
  const location = useLocation();
  const { data: users, isLoading: isLoadingUsers } = useGetUsersQuery();
  const [params, setParams] = useParams();
  const [calendarModalType, setCalendarModalType] =
    useState<DateFilterModalType>("");
  const { data: langs } = useGetLangsQuery({});
  const [searchData, updateSearchData] = useReducer(
    (state: SearchData, payload: Partial<SearchData>) => {
      return {
        ...state,
        ...payload,
      };
    },
    {
      keyword: "",
      user: null,
      date: null,
      resourceType: null,
      language: null,
    }
  );
  const isCustomDate = CUSTOM_DATES.map((d) => d.value).includes(
    searchData.date?.type as DateFilterModalType
  );

  const userOptions = useMemo(() => {
    return users
      ?.map((user) => ({
        firstName: user.firstName,
        lastName: user.lastName,
        ZUID: user.ZUID,
        email: user.email,
      }))
      .sort((a, b) => a.firstName?.localeCompare(b.firstName));
  }, [users]);

  const sortedLangs = useMemo(() => {
    if (langs?.length) {
      return [...langs]?.sort((a, b) => a.code?.localeCompare(b.code));
    }

    return [];
  }, [langs]);

  useEffect(() => {
    const user = params.get("user")
      ? userOptions.find((u) => u.ZUID === params.get("user"))
      : null;
    const datePreset = params.get("datePreset");
    const to = params.get("to");
    const from = params.get("from");
    let date: DateFilterValue;

    // Get proper date value
    if (datePreset) {
      date = {
        type: "preset",
        value: datePreset as PresetType,
      };
    } else if (to && !from) {
      date = {
        type: "before",
        value: to,
      };
    } else if (!to && from) {
      date = {
        type: "after",
        value: from,
      };
    } else if (to && from && to === from) {
      date = {
        type: "on",
        value: to,
      };
    } else if (to && from) {
      date = {
        type: "daterange",
        value: {
          from,
          to,
        },
      };
    } else {
      date = null;
    }

    updateSearchData({
      keyword: params.get("q"),
      user,
      date,
      resourceType: params.get("resource") as ResourceType,
      language: params.get("lang"),
    });
  }, [params]);

  useEffect(() => {
    if (keyword) {
      let _keyword = keyword;
      const regex = /\bin:(media|code|schema|content)\b/gi;
      const match = keyword.match(regex);
      const typedAccelerator = match?.length ? match[0] : null;

      if (!!keyword && !!typedAccelerator) {
        updateSearchData({
          resourceType: typedAccelerator
            .split(":")[1]
            .toLowerCase() as ResourceType,
        });

        _keyword = keyword.replace(regex, "").trim();
      }

      updateSearchData({ keyword: _keyword });
    }
  }, [keyword]);

  useEffect(() => {
    // Automatically set the resource type value when the user has already set
    // a search accelerator on the search box input field
    if (Boolean(searchAccelerator)) {
      updateSearchData({ resourceType: searchAccelerator });
    }
  }, [searchAccelerator]);

  const handleSetSelectedDate = ({
    type,
    value,
  }: {
    type: "preset" | DateFilterModalType;
    value: Date | PresetType | DateRangeFilterValue;
  }) => {
    if (type === "daterange") {
      updateSearchData({
        date: {
          type,
          value: value as DateRangeFilterValue,
        },
      });
    } else {
      updateSearchData({
        date: {
          type,
          value:
            typeof value === "object"
              ? moment(value as Date).format("YYYY-MM-DD")
              : value,
        },
      });
    }
  };

  const setDateSelectValue = (date: DateFilterValue) => {
    if (!date) {
      return "";
    }

    // Adds the custom date as a menu item on the select component if a custom date is selected
    if (isCustomDate) {
      return "custom_date_value";
    }

    // Otherwise, just set the value accordingly for the date presets
    if (date.type === "preset") {
      return date.value;
    }
  };

  const renderCustomDateOption = () => {
    if (!isCustomDate) {
      return;
    }

    // Custom menu item for daterange
    if (searchData.date?.type === "daterange") {
      const dates = searchData.date?.value as DateRangeFilterValue;

      return (
        <MenuItem value="custom_date_value" selected>
          {moment(dates.from).format("MMM D, YYYY")} to{" "}
          {moment(dates.to).format("MMM D, YYYY")}
        </MenuItem>
      );
    }

    // Custom menu item for single date
    return (
      <MenuItem value="custom_date_value" selected>
        {upperFirst(searchData.date?.type)}{" "}
        {moment(searchData.date?.value as string).format("MMM D, YYYY")}
      </MenuItem>
    );
  };

  const handleSearchClicked = () => {
    const isOnSearchPage = location.pathname === "/search";
    const { keyword, user, date, resourceType, language } = searchData;
    const searchParams = new URLSearchParams();

    if (keyword) {
      searchParams.set("q", keyword);
    }

    if (user) {
      searchParams.set("user", user.ZUID);
    }

    if (language) {
      searchParams.set("lang", language);
    }

    if (date) {
      switch (date.type) {
        case "preset":
          searchParams.set("datePreset", date.value as string);
          break;

        case "before":
          searchParams.set("to", date.value as string);
          break;

        case "after":
          searchParams.set("from", date.value as string);
          break;

        case "on":
          searchParams.set("from", date.value as string);
          searchParams.set("to", date.value as string);
          break;

        case "daterange":
          const { from, to } = date.value as DateRangeFilterValue;
          searchParams.set("from", from);
          searchParams.set("to", to);
          break;

        default:
          break;
      }
    }

    if (resourceType) {
      searchParams.set("resource", resourceType);
    }

    if (keyword || user) {
      onSearch && onSearch(searchData);
      onClose();

      // Only add the search page on the history stack during initial page visit
      // Makes sure clicking close on the search page brings the user back to the previous page
      if (isOnSearchPage) {
        history.replace(`/search?${searchParams.toString()}`);
      } else {
        history.push(`/search?${searchParams.toString()}`);
      }
    }
  };

  return (
    <>
      <Dialog
        open
        onClose={onClose}
        PaperProps={{
          sx: {
            borderRadius: "4px",
            maxWidth: "480px",
          },
        }}
      >
        <DialogTitle component="div">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h5" fontWeight={700}>
              Advanced Search
            </Typography>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Typography variant="body2" color="text.secondary" mt={1}>
            As you and your team work together in Zesty, you'll create a
            searchable archive of content, models, and code files. Use the form
            below to find what you are looking for.
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack gap={2.5} data-cy="AdvanceSearchModal">
            <Box>
              <InputLabel>
                Keywords*
                <Tooltip
                  placement="top"
                  title="Enter a term or multiple terms that match part of the resource name."
                >
                  <InfoRoundedIcon
                    sx={{ ml: 1, width: "12px", height: "12px" }}
                    color="action"
                  />
                </Tooltip>
              </InputLabel>
              <TextField
                data-cy="AdvanceSearchKeyword"
                placeholder="ex. Articles"
                fullWidth
                value={searchData.keyword}
                onChange={(e) => updateSearchData({ keyword: e.target.value })}
              />
            </Box>
            <Box>
              <InputLabel>
                Resource Type
                <Tooltip
                  placement="top"
                  title="Use this filter when you want to only view search results for a single resource type such as a content item, model (schema), or code file."
                >
                  <InfoRoundedIcon
                    sx={{ ml: 1, width: "12px", height: "12px" }}
                    color="action"
                  />
                </Tooltip>
              </InputLabel>
              <Select
                data-cy="AdvanceSearchResourceType"
                displayEmpty
                fullWidth
                value={searchData.resourceType || ""}
                onChange={(e) => {
                  const { value } = e.target;

                  updateSearchData({
                    resourceType: value as ResourceType,
                  });
                }}
              >
                <MenuItem value="">Any Type</MenuItem>
                {Object.entries(RESOURCE_TYPES).map(([value, text]) => (
                  <MenuItem key={value} value={value}>
                    {text}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Box>
              <InputLabel>
                Created By
                <Tooltip
                  placement="top"
                  title="Select a user from all users on the instance."
                >
                  <InfoRoundedIcon
                    sx={{ ml: 1, width: "12px", height: "12px" }}
                    color="action"
                  />
                </Tooltip>
              </InputLabel>
              <Autocomplete
                data-cy="AdvanceSearchUser"
                fullWidth
                options={userOptions || []}
                disabled={isLoadingUsers}
                value={searchData.user}
                onChange={(_, newVal: User | null) => {
                  updateSearchData({ user: newVal });
                }}
                isOptionEqualToValue={(option, value) =>
                  option?.ZUID === value?.ZUID
                }
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    placeholder="Anyone"
                    sx={{ height: "40px" }}
                    InputProps={{
                      ...params.InputProps,
                      sx: {
                        "&.MuiAutocomplete-inputRoot": {
                          py: "2px",
                          height: "40px",
                        },
                        "&.MuiAutocomplete-inputRoot .MuiAutocomplete-input": {
                          pl: 0,
                        },
                      },
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <ListItem {...props} key={option.ZUID}>
                    {option.firstName} {option.lastName}
                  </ListItem>
                )}
                getOptionLabel={(option: User) => {
                  return `${option.firstName} ${option.lastName}`;
                }}
                sx={{ height: "40px" }}
              />
            </Box>
            <Box>
              <InputLabel>
                Date Modified
                <Tooltip
                  placement="top"
                  title="Select the date range for which you want to see results for."
                >
                  <InfoRoundedIcon
                    sx={{ ml: 1, width: "12px", height: "12px" }}
                    color="action"
                  />
                </Tooltip>
              </InputLabel>
              <Select
                data-cy="AdvanceSearchDate"
                displayEmpty
                fullWidth
                value={setDateSelectValue(searchData.date)}
                onChange={(e) => {
                  const { value } = e.target;

                  if (value === "") {
                    updateSearchData({ date: null });
                  } else {
                    if (
                      PRESET_DATES.map((d) => d.value).includes(
                        value as PresetType
                      )
                    ) {
                      updateSearchData({
                        date: {
                          type: "preset",
                          value: value as PresetType,
                        },
                      });
                    } else {
                      setCalendarModalType(value as DateFilterModalType);
                    }
                  }
                }}
              >
                <MenuItem value="">Any Time</MenuItem>
                {PRESET_DATES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.text}
                  </MenuItem>
                ))}
                {renderCustomDateOption()}
                <Divider />
                {CUSTOM_DATES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.text}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Box>
              <InputLabel>
                Language
                <Tooltip
                  placement="top"
                  title="Select the language for which you want to see results for."
                >
                  <InfoRoundedIcon
                    sx={{ ml: 1, width: "12px", height: "12px" }}
                    color="action"
                  />
                </Tooltip>
              </InputLabel>
              <Select
                data-cy="AdvanceSearchLanguage"
                displayEmpty
                fullWidth
                value={searchData.language ?? ""}
                onChange={(evt) => {
                  const { value } = evt.target;

                  updateSearchData({
                    language: Boolean(value) ? value : null,
                  });
                }}
              >
                <MenuItem value="">Any Language</MenuItem>
                {sortedLangs?.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.code}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Button
              data-cy="AdvanceSearchClearButton"
              color="inherit"
              onClick={() => {
                updateSearchData({
                  keyword: "",
                  user: null,
                  date: null,
                  resourceType: null,
                  language: null,
                });
              }}
            >
              Clear All
            </Button>
            <Box>
              <Button color="inherit" sx={{ mr: 1 }} onClick={onClose}>
                Cancel
              </Button>
              <Button
                data-cy="AdvanceSearchSubmitButton"
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearchClicked}
                disabled={!searchData.keyword && !searchData.user}
              >
                Search
              </Button>
            </Box>
          </Stack>
        </DialogActions>
      </Dialog>

      {Boolean(calendarModalType) && calendarModalType !== "daterange" && (
        <DateFilterModal
          onClose={() => setCalendarModalType("")}
          onDateChange={({ type, date }) => {
            handleSetSelectedDate({ type, value: date });
          }}
          type={calendarModalType}
          date={
            ["on", "before", "after"].includes(searchData.date?.type)
              ? (searchData.date?.value as string)
              : ""
          }
        />
      )}

      {Boolean(calendarModalType) && calendarModalType === "daterange" && (
        <DateRangeFilterModal
          date={
            searchData.date?.type === "daterange"
              ? (searchData.date?.value as DateRangeFilterValue)
              : { from: null, to: null }
          }
          onClose={() => setCalendarModalType("")}
          onDateChange={({ type, date }) => {
            handleSetSelectedDate({
              type,
              value: date,
            });
          }}
        />
      )}
    </>
  );
};
