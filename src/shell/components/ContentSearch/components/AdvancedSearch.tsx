import { FC, useEffect, useMemo } from "react";
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
// import { User } from "../../../services/types";

const PRESET_DATES: PresetDate[] = [
  {
    text: "Today",
    value: "today",
  },
  {
    text: "Yesterday",
    value: "yesterday",
  },
  {
    text: "Last 7 days",
    value: "last_7_days",
  },
  {
    text: "Last 30 days",
    value: "last_30_days",
  },
  {
    text: "Last 3 months",
    value: "last_3_months",
  },
  {
    text: "Last 12 months",
    value: "last_12_months",
  },
];
const CUSTOM_DATES: CustomDate[] = [
  {
    text: "On...",
    value: "on",
  },
  {
    text: "Before...",
    value: "before",
  },
  {
    text: "After...",
    value: "after",
  },
  {
    text: "Custom date range",
    value: "daterange",
  },
];

interface PresetDate {
  text: string;
  value:
    | "today"
    | "yesterday"
    | "last_7_days"
    | "last_30_days"
    | "last_3_months"
    | "last_12_months";
}
interface CustomDate {
  text: string;
  value: "on" | "before" | "after" | "daterange" | "";
}
interface User {
  firstName: string;
  lastName: string;
  ZUID: string;
  email: string;
}
export interface SearchData {
  keyword: string;
  user: User | null;
  date: string;
}
interface AdvancedSearch {
  onClose: () => void;
  searchData: SearchData;
  onUpdateSearchData: (payload: Partial<SearchData>) => void;
  onResetSearchData: () => void;
}
export const AdvancedSearch: FC<AdvancedSearch> = ({
  onClose,
  searchData,
  onUpdateSearchData,
  onResetSearchData,
}) => {
  const { data: users, isLoading: isLoadingUsers } = useGetUsersQuery();

  const userOptions = useMemo(() => {
    return users?.map((user) => ({
      firstName: user.firstName,
      lastName: user.lastName,
      ZUID: user.ZUID,
      email: user.email,
    }));
  }, [users]);

  // const selectedUser = useMemo(() => {

  // }, [searchData.user])

  const handleSearchClicked = () => {
    console.log(searchData);
  };

  return (
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
              onChange={(e) => onUpdateSearchData({ keyword: e.target.value })}
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
                onUpdateSearchData({ user: newVal });
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
              value=""
              sx={{
                "& .MuiSelect-select.MuiSelect-outlined.MuiInputBase-input.MuiOutlinedInput-input":
                  {
                    color:
                      searchData.date === ""
                        ? "text.disabled"
                        : "text.secondary",
                  },
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
          <Button color="inherit" onClick={onResetSearchData}>
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
  );
};
