import React from "react";
import { FC, useState } from "react";
import { Menu, MenuItem } from "@mui/material";

import { FilterButton } from "../../../components/Filters";

interface ResourceTypeOptions {
  content: string;
  schema: string;
}
const RESOURCE_TYPE_OPTIONS: ResourceTypeOptions = {
  content: "Content Items",
  schema: "Models",
};

export type ResourceType = "content" | "schema" | "";
interface ResourceTypeFilter {
  onChange: (value: ResourceType | "") => void;
  value?: ResourceType;
}
export const ResourceTypeFilter: FC<ResourceTypeFilter> = ({
  onChange,
  value,
}) => {
  const [anchorRef, setAnchorRef] = useState<HTMLElement | null>(null);

  return (
    <>
      <FilterButton
        filterId="resourceType"
        isFilterActive={Boolean(value)}
        buttonText={
          RESOURCE_TYPE_OPTIONS[value as Exclude<ResourceType, "">] ||
          "Resource Type"
        }
        onOpenMenu={(e: React.MouseEvent<HTMLButtonElement>) =>
          setAnchorRef(e.currentTarget)
        }
        onRemoveFilter={() => onChange("")}
      />
      <Menu
        data-cy="ResourceTypeFilterMenu"
        anchorEl={anchorRef}
        open={Boolean(anchorRef)}
        onClose={() => setAnchorRef(null)}
        PaperProps={{
          sx: {
            mt: 1,
          },
        }}
      >
        {Object.entries(RESOURCE_TYPE_OPTIONS).map(([filter, text]) => (
          <MenuItem
            key={filter}
            value={filter}
            selected={value === filter}
            sx={{
              height: 40,
            }}
            onClick={() => {
              onChange(filter as ResourceType);
              setAnchorRef(null);
            }}
          >
            {text}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
