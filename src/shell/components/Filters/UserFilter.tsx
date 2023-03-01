import { useRef, FC, useState, useMemo, useEffect } from "react";
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
import { theme } from "@zesty-io/material";

import { FilterButton } from "./FilterButton";
import { useGetUsersQuery } from "../../services/accounts";
import { MD5 } from "../../../utility/md5";

interface UserFilterProps {
  value: string;
  onChange: (filter: string) => void;
}
export const UserFilter: FC<UserFilterProps> = ({ value, onChange }) => {
  const [filter, setFilter] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement | null>(
    null
  );
  const isFilterMenuOpen = Boolean(menuAnchorEl);
  const { data: users } = useGetUsersQuery();
  const searchField = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    searchField.current?.focus();
  }, [filteredUsers]);

  const activeUserFilter = users?.find((user) => user?.ZUID === value);
  const buttonText = activeUserFilter
    ? `${activeUserFilter.firstName} ${activeUserFilter.lastName}`
    : "People";

  const handleOpenMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(e.currentTarget);
  };

  const handleFilterSelect = (userZUID: string) => {
    setMenuAnchorEl(null);
    onChange(userZUID);
  };

  return (
    <FilterButton
      isFilterActive={Boolean(activeUserFilter)}
      buttonText={buttonText}
      onOpenMenu={handleOpenMenuClick}
      onRemoveFilter={() => onChange("")}
    >
      <Menu
        open={isFilterMenuOpen}
        anchorEl={menuAnchorEl}
        onClose={() => setMenuAnchorEl(null)}
        PaperProps={{
          sx: {
            maxHeight: 420,
            width: 320,
            mt: 1,
            "::-webkit-scrollbar-track-piece": {
              backgroundColor: `${theme.palette.grey[100]} !important`,
              borderRadius: "4px",
            },
            "::-webkit-scrollbar-thumb": {
              backgroundColor: `${theme.palette.grey[300]} !important`,
            },
          },
        }}
      >
        <MenuItem
          disableRipple
          onKeyDown={(e: React.KeyboardEvent) => {
            const allowedKeys = ["ArrowUp", "ArrowDown"];

            if (!allowedKeys.includes(e.key)) {
              e.stopPropagation();
            }
          }}
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
            inputProps={{ ref: searchField }}
          />
        </MenuItem>
        {filteredUsers?.map((user, index) => {
          return (
            <MenuItem
              key={user?.ZUID}
              onClick={() => handleFilterSelect(user?.ZUID)}
              selected={value ? value === user?.ZUID : index === 0}
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
