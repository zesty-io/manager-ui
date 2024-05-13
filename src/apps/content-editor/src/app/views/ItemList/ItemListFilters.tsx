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

export const ItemListFilters = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
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
          setAnchorEl(event.currentTarget);
        }}
        onRemoveFilter={() => {}}
      />
      <Menu
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl}
      >
        {Object.entries(SORT_ORDER).map(([key, value]) => (
          <MenuItem
            onClick={() => {
              setParams(key, "sort");
              setAnchorEl(null);
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
    </Box>
  );
};
