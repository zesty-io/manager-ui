import { FC, useState, useMemo, useRef } from "react";
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
  Box,
  MenuList,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { theme } from "@zesty-io/material";
import { cloneDeep } from "lodash";

import { FilterButton } from "./FilterButton";
import { MD5 } from "../../../utility/md5";
import { User } from "../../../shell/services/types";

interface UserFilterProps {
  value: string;
  onChange: (filter: string) => void;
  defaultButtonText?: string;
  options: Partial<User>[];
}
export const UserFilter: FC<UserFilterProps> = ({
  value,
  onChange,
  defaultButtonText = "Created By",
  options,
}) => {
  const userListRef = useRef<HTMLUListElement>(null);
  const [filter, setFilter] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement | null>(
    null
  );
  const isFilterMenuOpen = Boolean(menuAnchorEl);

  const filteredUsers = useMemo(() => {
    const _users = cloneDeep(options);

    const sortedUsers = _users?.sort((a, b) => {
      const nameA = a?.firstName?.toLowerCase();
      const nameB = b?.firstName?.toLowerCase();

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
  }, [filter, options]);

  const activeUserFilter = options?.find((user) => user?.ZUID === value);
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
      filterId="user"
    >
      <Menu
        data-cy="UserFilterMenu"
        open={isFilterMenuOpen}
        anchorEl={menuAnchorEl}
        onClose={() => setMenuAnchorEl(null)}
        PaperProps={{
          sx: {
            maxHeight: 420,
            width: 320,
            mt: 1,
            overflow: "hidden",
          },
        }}
        MenuListProps={{
          sx: {
            py: 0,
          },
        }}
        autoFocus={false}
        onKeyDown={(evt) => {
          evt.preventDefault();
          evt.stopPropagation();

          if (evt.key === "ArrowDown") {
            userListRef.current?.querySelector("li")?.focus();
            return;
          }

          if (evt.key === "ArrowUp") {
            userListRef.current
              ?.querySelector<HTMLLIElement>("li:last-of-type")
              ?.focus();
            return;
          }
        }}
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
          <ListItem sx={{ pb: 2 }}>
            <ListItemText>No users found</ListItemText>
          </ListItem>
        )}

        {!!filteredUsers?.length && (
          <MenuList
            ref={userListRef}
            sx={{
              overflowY: "auto",
              maxHeight: 360,
              pt: 0,
            }}
            onKeyDown={(evt) => {
              evt.preventDefault();
              evt.stopPropagation();

              if (evt.key === "Escape") {
                setMenuAnchorEl(null);
              }
            }}
          >
            {filteredUsers.map((user) => {
              return (
                <MenuItem
                  key={user?.ZUID}
                  onClick={() => handleFilterSelect(user?.ZUID)}
                  selected={value ? value === user?.ZUID : false}
                  sx={{
                    height: "52px",
                  }}
                  data-cy={`filter_value_${user?.ZUID}`}
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
          </MenuList>
        )}
      </Menu>
    </FilterButton>
  );
};
