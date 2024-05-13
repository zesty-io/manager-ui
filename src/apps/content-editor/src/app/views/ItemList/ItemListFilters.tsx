import { Box, Menu, MenuItem } from "@mui/material";
import { FilterButton } from "../../../../../../shell/components/Filters";
import { useState } from "react";
import { useParams } from "../../../../../../shell/hooks/useParams";

const SORT_ORDER = {
  dateSaved: "Date Saved",
  datePublished: "Date Published",
  dateCreated: "Date Created",
  status: "Status",
} as const;

const STATUS_FILTER = {
  published: "Published",
  scheduled: "Scheduled",
  notPublished: "Not Published",
} as const;

export const ItemListFilters = () => {
  const [anchorEl, setAnchorEl] = useState({
    currentTarget: null,
    id: "",
  });
  const [params, setParams] = useParams();
  return (
    <Box display="flex" gap={1.5} py={2}>
      <FilterButton
        isFilterActive={false}
        buttonText={`Sort: ${
          SORT_ORDER[params.get("sort") as keyof typeof SORT_ORDER] ??
          SORT_ORDER.dateSaved
        }`}
        onOpenMenu={(event: React.MouseEvent<HTMLButtonElement>) => {
          setAnchorEl({
            currentTarget: event.currentTarget,
            id: "sort",
          });
        }}
        onRemoveFilter={() => {}}
      />
      <Menu
        open={!!anchorEl?.currentTarget && anchorEl.id === "sort"}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl?.currentTarget}
      >
        {Object.entries(SORT_ORDER).map(([key, value]) => (
          <MenuItem
            onClick={() => {
              setParams(key, "sort");
              setAnchorEl({
                currentTarget: null,
                id: "",
              });
            }}
            selected={
              key === "dateSaved"
                ? !params.get("sort") || params.get("sort") === key
                : params.get("sort") === key
            }
          >
            {value}
          </MenuItem>
        ))}
      </Menu>
      <FilterButton
        isFilterActive={!!params.get("statusFilter")}
        buttonText={
          params.get("statusFilter")
            ? STATUS_FILTER[
                params.get("statusFilter") as keyof typeof STATUS_FILTER
              ]
            : "Status"
        }
        onOpenMenu={(event: React.MouseEvent<HTMLButtonElement>) => {
          setAnchorEl({
            currentTarget: event.currentTarget,
            id: "statusFilter",
          });
        }}
        onRemoveFilter={() => {
          setParams(null, "statusFilter");
        }}
      />
      <Menu
        open={!!anchorEl?.currentTarget && anchorEl.id === "statusFilter"}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl?.currentTarget}
      >
        {Object.entries(STATUS_FILTER).map(([key, value]) => (
          <MenuItem
            onClick={() => {
              setParams(key, "statusFilter");
              setAnchorEl({
                currentTarget: null,
                id: "",
              });
            }}
            selected={params.get("statusFilter") === key}
          >
            {value}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
