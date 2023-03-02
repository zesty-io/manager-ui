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
  ListSubheader,
  ListItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { theme } from "@zesty-io/material";
import { cloneDeep } from "lodash";

import { FilterButton } from "./FilterButton";
import { useGetUsersQuery } from "../../services/accounts";
import { MD5 } from "../../../utility/md5";

interface UserFilterProps {
  value: string;
  onChange: (filter: string) => void;
  defaultButtonText?: string;
}
export const UserFilter: FC<UserFilterProps> = ({
  value,
  onChange,
  defaultButtonText = "Created By",
}) => {
  const [filter, setFilter] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement | null>(
    null
  );
  const isFilterMenuOpen = Boolean(menuAnchorEl);
  const { data: users } = useGetUsersQuery();

  const filteredUsers = useMemo(() => {
    const _users = cloneDeep(users);

    const sortedUsers = _users?.sort((a, b) => {
      const nameA = a.firstName.toLowerCase();
      const nameB = b.firstName.toLowerCase();

      if (nameA < nameB) {
        return -1;
      }

      if (nameA > nameB) {
        return 1;
      }

      return 0;
    });

    if (!filter.length) {
      return sortedUsers;
    }

    const _filterTerm = filter.toLowerCase();

    return sortedUsers?.filter(
      (user) =>
        user?.firstName?.toLowerCase().includes(_filterTerm) ||
        user?.lastName?.toLowerCase().includes(_filterTerm)
    );
  }, [filter, users]);

  const activeUserFilter = users?.find((user) => user?.ZUID === value);
  const buttonText = activeUserFilter
    ? `${activeUserFilter.firstName} ${activeUserFilter.lastName}`
    : defaultButtonText;

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
        MenuListProps={{
          sx: {
            pt: 0,
            pb: 1,
          },
        }}
        autoFocus={false}
      >
        <ListSubheader
          onKeyDown={(e: React.KeyboardEvent) => {
            const allowedKeys = ["ArrowUp", "ArrowDown", "Escape"];

            if (!allowedKeys.includes(e.key)) {
              e.stopPropagation();
            }
          }}
          sx={{
            pt: 1,
            height: "60px",
            display: "flex",
            alignItems: "center",
            "&:focus-visible": {
              outline: "none",
            },
          }}
        >
          <TextField
            autoFocus
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
        </ListSubheader>

        {!filteredUsers?.length && Boolean(filter) && (
          <ListItem>
            <ListItemText>No users found</ListItemText>
          </ListItem>
        )}

        {filteredUsers?.map((user) => {
          return (
            <MenuItem
              key={user?.ZUID}
              onClick={() => handleFilterSelect(user?.ZUID)}
              selected={value && value === user?.ZUID}
              sx={{
                height: "52px",
              }}
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
