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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";

import { useGetUsersQuery } from "../../../services/accounts";
import {
  PresetType,
  DateFilterModalType,
  DateRangeFilterValue,
  DateFilterValue,
} from "../../../components/Filters/DateFilter/types";
import { DateFilterModal } from "../../../components/Filters/DateFilter/DateFilterModal";
import { DateRangeFilterModal } from "../../../components/Filters/DateFilter/DateRangeFilterModal";
import { PRESET_DATES, CUSTOM_DATES } from "./config";

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
}
interface AdvancedSearch {
  keyword: string;
  onClose: () => void;
}
export const AdvancedSearch: FC<AdvancedSearch> = ({ keyword, onClose }) => {
  const { data: users, isLoading: isLoadingUsers } = useGetUsersQuery();
  const [calendarModalType, setCalendarModalType] =
    useState<DateFilterModalType>("");
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
    }
  );

  const userOptions = useMemo(() => {
    return users?.map((user) => ({
      firstName: user.firstName,
      lastName: user.lastName,
      ZUID: user.ZUID,
      email: user.email,
    }));
  }, [users]);

  useEffect(() => {
    if (keyword) {
      updateSearchData({ keyword });
    }
  }, [keyword]);

  const handleSearchClicked = () => {
    console.log(searchData);
  };

  return (
    <>
      <Dialog open onClose={onClose}>
        <DialogTitle component="div">
          <Typography variant="h5" fontWeight={600} mb={1}>
            Advanced Search
          </Typography>
          <Typography variant="body2" color="text.secondary">
            As you and your team work together in Zesty, you'll create a
            searchable archive of content, models, and code files. Use the form
            below to find what you are looking for.
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack gap={2.5}>
            <Box>
              <InputLabel>
                Keywords*
                <Tooltip
                  placement="top"
                  title="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                >
                  <InfoRoundedIcon
                    sx={{ ml: 1, width: "12px", height: "12px" }}
                    color="action"
                  />
                </Tooltip>
              </InputLabel>
              <TextField
                placeholder="ex. Articles"
                fullWidth
                value={searchData.keyword}
                onChange={(e) => updateSearchData({ keyword: e.target.value })}
              />
            </Box>
            <Box>
              <InputLabel>
                Created or Modified By
                <Tooltip
                  placement="top"
                  title="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                >
                  <InfoRoundedIcon
                    sx={{ ml: 1, width: "12px", height: "12px" }}
                    color="action"
                  />
                </Tooltip>
              </InputLabel>
              <Autocomplete
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
                    placeholder="Select"
                    sx={{ height: "40px" }}
                    InputProps={{
                      ...params.InputProps,
                      sx: {
                        "&.MuiAutocomplete-inputRoot": {
                          py: "2px",
                          height: "40px",
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
                Date
                <Tooltip
                  placement="top"
                  title="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                >
                  <InfoRoundedIcon
                    sx={{ ml: 1, width: "12px", height: "12px" }}
                    color="action"
                  />
                </Tooltip>
              </InputLabel>
              <Select
                displayEmpty
                fullWidth
                value={searchData.date?.value || ""}
                sx={{
                  "& .MuiSelect-select.MuiSelect-outlined.MuiInputBase-input.MuiOutlinedInput-input":
                    {
                      color:
                        searchData.date === null
                          ? "text.disabled"
                          : "text.secondary",
                    },
                }}
                onChange={(e) => {
                  const { value } = e.target;

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
                }}
              >
                <MenuItem value="" disabled sx={{ display: "none" }}>
                  Select
                </MenuItem>
                {PRESET_DATES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.text}
                  </MenuItem>
                ))}
                {CUSTOM_DATES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.text}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Button
              color="inherit"
              onClick={() => {
                updateSearchData({
                  keyword: "",
                  user: null,
                  date: null,
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
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearchClicked}
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
            // TODO: Add handler
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
            // TODO: add handler
          }}
        />
      )}
    </>
  );
};
