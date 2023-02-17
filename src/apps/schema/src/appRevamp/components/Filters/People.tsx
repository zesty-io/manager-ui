import { FC, useState } from "react";
import {
  Menu,
  MenuItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
} from "@mui/material";

import { FilterButton } from "./FilterButton";
import { useGetUsersQuery } from "../../../../../../shell/services/accounts";
import { MD5 } from "../../../../../../utility/md5";
import { FiltersProps } from "./index";

export const People: FC<FiltersProps> = ({
  activeFilters,
  setActiveFilters,
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement | null>(
    null
  );
  const isFilterMenuOpen = Boolean(menuAnchorEl);
  const { data: users } = useGetUsersQuery();

  const handleOpenMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(e.currentTarget);
  };

  return (
    <FilterButton
      isFilterActive={false}
      buttonText="People"
      onOpenMenu={handleOpenMenuClick}
      onRemoveFilter={() => {}}
    >
      <Menu
        open={isFilterMenuOpen}
        anchorEl={menuAnchorEl}
        onClose={() => setMenuAnchorEl(null)}
        PaperProps={{
          style: {
            maxHeight: 52 * 10 + 8, // Item Height * No. of items to show + Padding Top
          },
        }}
      >
        {users?.map((user) => {
          return (
            <MenuItem key={user?.ZUID}>
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
