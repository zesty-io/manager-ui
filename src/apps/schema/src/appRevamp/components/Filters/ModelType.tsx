import { FC, useState, Dispatch } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  SvgIcon,
} from "@mui/material";

import { modelIconMap, modelNameMap } from "../../utils";
import { ModelType as ModelSet } from "../../../../../../shell/services/types";
import { FilterButton } from "../../../../../../shell/components/Filters";

const MODEL_TYPE_FILTERS: ModelSet[] = ["templateset", "pageset", "dataset"];

interface ModelTypeProps {
  value: ModelSet | "";
  onChange: (filter: ModelSet | "") => void;
}
export const ModelType: FC<ModelTypeProps> = ({ value, onChange }) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement | null>(
    null
  );
  const isFilterMenuOpen = Boolean(menuAnchorEl);
  const activeModelTypeFilter: ModelSet | "" = value;

  const handleOpenMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(e.currentTarget);
  };

  const handleFilterSelect = (filter: ModelSet) => {
    setMenuAnchorEl(null);
    onChange(filter);
  };

  return (
    <>
      <FilterButton
        isFilterActive={Boolean(activeModelTypeFilter)}
        buttonText={
          modelNameMap[activeModelTypeFilter as ModelSet] || "Model Type"
        }
        onOpenMenu={handleOpenMenuClick}
        onRemoveFilter={() => onChange("")}
      >
        <Menu
          open={isFilterMenuOpen}
          anchorEl={menuAnchorEl}
          onClose={() => setMenuAnchorEl(null)}
        >
          {MODEL_TYPE_FILTERS.map((filter, index) => (
            <MenuItem
              selected={
                activeModelTypeFilter
                  ? filter === activeModelTypeFilter
                  : index === 0
              }
              key={index}
              onClick={() => handleFilterSelect(filter)}
            >
              <ListItemIcon>
                <SvgIcon component={modelIconMap[filter]} />
              </ListItemIcon>
              <ListItemText>{modelNameMap[filter]}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </FilterButton>
    </>
  );
};
