import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Menu, MenuItem } from "@mui/material";
import { FilterButton } from "../../../../../../shell/components/Filters";
import { useRedirectsTable } from "./RedirectsTableContextProvider";

const getSortOptions = (t: (key: string) => string) => ({
  createdAt: t("shell.relationalSortDateCreated"),
  path: t("seo.sortIncomingPath"),
  code: t("seo.sortHttpCode"),
  targetType: t("seo.sortType"),
  target: t("seo.sortTarget"),
});

const getHttpCodeFilters = (t: (key: string) => string) => ({
  "301": t("seo.httpCode301Permanent"),
  "302": t("seo.httpCode302Temporary"),
});

const getTypeFilters = (t: (key: string) => string) => ({
  external: t("seo.typeFilterExternal"),
  path: t("seo.typeFilterWildcard"),
  internal: t("seo.typeFilterInternal"),
});

export const TableSortFilters = () => {
  const { t } = useTranslation();
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
  } = useRedirectsTable();

  const SORT_OPTIONS = getSortOptions(t);
  const HTTP_CODE_FILTERS = getHttpCodeFilters(t);
  const TYPE_FILTERS = getTypeFilters(t);

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
        return t("shell.relationalSortBy", {
          value: SORT_OPTIONS[sortBy as keyof typeof SORT_OPTIONS],
        });
      case "code":
        return httpCodeFilter === null
          ? t("seo.sortHttpCode")
          : HTTP_CODE_FILTERS[httpCodeFilter as keyof typeof HTTP_CODE_FILTERS];
      case "type":
        return typeFilter === null
          ? t("seo.sortType")
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
        isFilterActive={httpCodeFilter !== null}
        buttonText={getButtonText("code")}
        onOpenMenu={(e) => handleOpenMenu(e, "code")}
        onRemoveFilter={() => {
          setHttpCodeFilter(null);
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
        isFilterActive={typeFilter !== null}
        buttonText={getButtonText("type")}
        onOpenMenu={(e) => handleOpenMenu(e, "type")}
        onRemoveFilter={() => {
          setTypeFilter(null);
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
