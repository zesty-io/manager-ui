import React from "react";
import { FC, useState } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  SvgIcon,
} from "@mui/material";
import {
  SvgIconComponent,
  EditRounded,
  CodeRounded,
  ImageRounded,
} from "@mui/icons-material";
import { Database } from "@zesty-io/material";
import { ResourceType } from "../../../services/types";

import { FilterButton } from "../../../components/Filters";

interface ResourceTypeValue {
  text: string;
  icon: SvgIconComponent;
}
type ResourceTypeOptions = Record<Exclude<ResourceType, "">, ResourceTypeValue>;
const RESOURCE_TYPE_OPTIONS: ResourceTypeOptions = {
  content: {
    text: "Content Items",
    icon: EditRounded,
  },
  schema: {
    text: "Models",
    icon: Database as SvgIconComponent,
  },
  code: {
    text: "Code Files",
    icon: CodeRounded,
  },
  media: {
    text: "Media",
    icon: ImageRounded,
  },
};

export type ResourceCodes = ResourceType | "";
interface ResourceTypeFilter {
  onChange: (value: ResourceCodes) => void;
  value?: ResourceCodes;
}
export const ResourceTypeFilter: FC<ResourceTypeFilter> = ({
  onChange,
  value,
}) => {
  const [anchorRef, setAnchorRef] = useState<HTMLElement | null>(null);

  const getButtonText = (): string => {
    if (Boolean(value) && value in RESOURCE_TYPE_OPTIONS) {
      return RESOURCE_TYPE_OPTIONS[value as ResourceType].text;
    }

    return "Resource Type";
  };

  return (
    <>
      <FilterButton
        filterId="resourceType"
        isFilterActive={Boolean(value)}
        buttonText={getButtonText()}
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
        {Object.entries(RESOURCE_TYPE_OPTIONS).map(
          ([code, data]: [code: ResourceType, data: ResourceTypeValue]) => (
            <MenuItem
              key={code}
              value={code}
              selected={value === code}
              sx={{
                height: 40,
              }}
              onClick={() => {
                onChange(code as ResourceType);
                setAnchorRef(null);
              }}
            >
              <ListItemIcon>
                <SvgIcon component={data.icon} />
              </ListItemIcon>
              <ListItemText>{data.text}</ListItemText>
            </MenuItem>
          )
        )}
      </Menu>
    </>
  );
};
