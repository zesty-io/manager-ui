import { FC, useState } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  SvgIcon,
} from "@mui/material";

import { modelIconMap, modelNameMap } from "../../utils";
import { ModelType as ModelSet } from "../../../../../../shell/services/types";
import { FiltersProps } from "./index";
import { FilterButton } from "./FilterButton";

const MODEL_TYPE_FILTERS: ModelSet[] = ["templateset", "pageset", "dataset"];

// TODO: Make a base component that can be re-used for all filters
export const ModelType: FC<FiltersProps> = ({
  activeFilters,
  setActiveFilters,
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement | null>(
    null
  );
  const isFilterMenuOpen = Boolean(menuAnchorEl);
  const activeModelTypeFilter: ModelSet | "" = activeFilters?.modelType;

  const handleOpenMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(e.currentTarget);
  };

  const handleFilterSelect = (filter: ModelSet) => {
    setMenuAnchorEl(null);
    setActiveFilters({
      modelType: filter,
    });
  };

  return (
    <>
      <FilterButton
        isFilterActive={Boolean(activeModelTypeFilter)}
        buttonText={
          modelNameMap[activeModelTypeFilter as ModelSet] || "Model Type"
        }
        onOpenMenu={handleOpenMenuClick}
        onRemoveFilter={() => setActiveFilters({ modelType: "" })}
      >
        <Menu
          open={isFilterMenuOpen}
          anchorEl={menuAnchorEl}
          onClose={() => setMenuAnchorEl(null)}
        >
          {MODEL_TYPE_FILTERS.map((filter, index) => (
            <MenuItem key={index} onClick={() => handleFilterSelect(filter)}>
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
