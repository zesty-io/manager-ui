import { FC, useState, useMemo } from "react";
import {
  Menu,
  MenuItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import { FilterButton } from "./FilterButton";
import { useGetUsersQuery } from "../../../../../../shell/services/accounts";
import { MD5 } from "../../../../../../utility/md5";
import { FiltersProps } from "./index";

export const People: FC<FiltersProps> = ({
  activeFilters,
  setActiveFilters,
}) => {
  const [filter, setFilter] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement | null>(
    null
  );
  const isFilterMenuOpen = Boolean(menuAnchorEl);
  const { data: users } = useGetUsersQuery();

  const filteredUsers = useMemo(() => {
    if (!filter.length) {
      return users;
    }
    const _filter = filter.toLowerCase();

    return users?.filter(
      (user) =>
        user?.firstName?.toLowerCase().includes(_filter) ||
        user?.lastName?.toLowerCase().includes(_filter)
    );
  }, [filter, users]);

  const activeUserFilter = users?.find(
    (user) => user?.ZUID === activeFilters?.people
  );
  const buttonText = activeUserFilter
    ? `${activeUserFilter.firstName} ${activeUserFilter.lastName}`
    : "People";

  const handleOpenMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(e.currentTarget);
  };

  const handleFilterSelect = (userZUID: string) => {
    setMenuAnchorEl(null);
    setActiveFilters({
      people: userZUID,
    });
  };

  return (
    <FilterButton
      isFilterActive={Boolean(activeUserFilter)}
      buttonText={buttonText}
      onOpenMenu={handleOpenMenuClick}
      onRemoveFilter={() => setActiveFilters({ people: "" })}
    >
      <Menu
        open={isFilterMenuOpen}
        anchorEl={menuAnchorEl}
        onClose={() => setMenuAnchorEl(null)}
        PaperProps={{
          style: {
            maxHeight: 52 * 10 + 8, // Item Height * No. of items to show + Padding Top
            width: 320,
          },
        }}
      >
        <MenuItem
          disableRipple
          onKeyDown={(e) => e.stopPropagation()}
          sx={{
            "&:hover": {
              backgroundColor: "common.white",
            },
            "&.Mui-focusVisible": {
              backgroundColor: "common.white",
            },
          }}
        >
          <TextField
            fullWidth
            placeholder="Search Users"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: filter.length ? (
                <IconButton size="small" onClick={() => setFilter("")}>
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              ) : null,
            }}
          />
        </MenuItem>
        {filteredUsers?.map((user) => {
          return (
            <MenuItem
              key={user?.ZUID}
              onClick={() => handleFilterSelect(user?.ZUID)}
            >
              <ListItemAvatar>
                <Avatar
                  src={`https://www.gravatar.com/avatar/${MD5(
                    user?.email
                  )}?d=mm&s=40`}
                />
              </ListItemAvatar>
              <ListItemText>
                {user?.firstName} {user?.lastName}
              </ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </FilterButton>
  );
};
