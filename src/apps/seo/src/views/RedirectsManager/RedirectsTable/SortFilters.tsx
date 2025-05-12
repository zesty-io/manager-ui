import { useState } from "react";
import { Box, Menu, MenuItem } from "@mui/material";
import { FilterButton } from "../../../../../../shell/components/Filters";
import { useRedirectsTableFilters } from "./TableSortFilterProvider";

const SORT_OPTIONS = {
  createdAt: "Date Created",
  path: "Incoming Path",
  code: "HTTP Code",
  targetType: "Type",
  target: "Target",
} as const;

const HTTP_CODE_FILTERS = {
  "301": "301 - Permanent",
  "302": "302 - Temporary",
} as const;

const TYPE_FILTERS = {
  external: "External - link to an external webpage",
  path: "Wildcard - rule based redirects",
  internal: "Internal - linked to an item in this instance",
} as const;

export const SortFilters = () => {
  const [anchorEl, setAnchorEl] = useState({
    currentTarget: null,
    id: "",
  });

  const {
    sortBy,
    httpCodeFilter,
    typeFilter,
    setSortBy,
    setHttpCodeFilter,
    setTypeFilter,
  } = useRedirectsTableFilters();

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    id: string
  ) => {
    setAnchorEl({
      currentTarget: event.currentTarget,
      id,
    });
  };

  const handleCloseMenu = () => {
    setAnchorEl({
      currentTarget: null,
      id: "",
    });
  };

  const getButtonText = (id: string) => {
    switch (id) {
      case "sort":
        return `Sort: ${SORT_OPTIONS[sortBy as keyof typeof SORT_OPTIONS]}`;
      case "code":
        return httpCodeFilter === "all"
          ? "HTTP Code"
          : HTTP_CODE_FILTERS[httpCodeFilter as keyof typeof HTTP_CODE_FILTERS];
      case "type":
        return typeFilter === "all"
          ? "Type"
          : TYPE_FILTERS[typeFilter as keyof typeof TYPE_FILTERS];
      default:
        return "";
    }
  };

  return (
    <Box display="flex" gap={1.5} py="16px">
      <FilterButton
        filterId="sortByFilter"
        isFilterActive={false}
        buttonText={getButtonText("sort")}
        onOpenMenu={(e) => handleOpenMenu(e, "sort")}
        onRemoveFilter={() => {
          setSortBy("createdAt");
        }}
      />
      <Menu
        open={!!anchorEl?.currentTarget && anchorEl.id === "sort"}
        onClose={handleCloseMenu}
        anchorEl={anchorEl?.currentTarget}
        transformOrigin={{
          vertical: -8,
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            width: "280px",
          },
        }}
      >
        {Object.entries(SORT_OPTIONS).map(([key, value]) => (
          <MenuItem
            key={key}
            onClick={() => {
              setSortBy(key);
              handleCloseMenu();
            }}
            selected={sortBy === key}
          >
            {value}
          </MenuItem>
        ))}
      </Menu>

      <FilterButton
        filterId="httpCode"
        isFilterActive={httpCodeFilter !== "all"}
        buttonText={getButtonText("code")}
        onOpenMenu={(e) => handleOpenMenu(e, "code")}
        onRemoveFilter={() => {
          setHttpCodeFilter("all");
        }}
      />
      <Menu
        open={!!anchorEl?.currentTarget && anchorEl.id === "code"}
        onClose={handleCloseMenu}
        anchorEl={anchorEl?.currentTarget}
        transformOrigin={{
          vertical: -8,
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            width: "160px",
          },
        }}
      >
        {Object.entries(HTTP_CODE_FILTERS).map(([key, value]) => (
          <MenuItem
            key={key}
            onClick={() => {
              setHttpCodeFilter(key);
              handleCloseMenu();
            }}
            selected={httpCodeFilter === key}
          >
            {value}
          </MenuItem>
        ))}
      </Menu>

      <FilterButton
        filterId="targetType"
        isFilterActive={typeFilter !== "all"}
        buttonText={getButtonText("type")}
        onOpenMenu={(e) => handleOpenMenu(e, "type")}
        onRemoveFilter={() => {
          setTypeFilter("all");
        }}
      />
      <Menu
        open={!!anchorEl?.currentTarget && anchorEl.id === "type"}
        onClose={handleCloseMenu}
        anchorEl={anchorEl?.currentTarget}
        transformOrigin={{
          vertical: -8,
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            width: "360px",
          },
        }}
      >
        {Object.entries(TYPE_FILTERS).map(([key, value]) => (
          <MenuItem
            key={key}
            onClick={() => {
              setTypeFilter(key);
              handleCloseMenu();
            }}
            selected={typeFilter === key}
          >
            {value}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
