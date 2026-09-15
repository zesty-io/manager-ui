import { FC, useState, Dispatch } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  SvgIcon,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { modelIconMap, modelNameMap } from "../../utils";
import { ModelType as ModelSet } from "../../../../../../shell/services/types";
import { FilterButton } from "../../../../../../shell/components/Filters";

const MODEL_TYPE_FILTERS: ModelSet[] = [
  "templateset",
  "pageset",
  "dataset",
  "block",
];

interface ModelTypeProps {
  value: ModelSet | "";
  onChange: (filter: ModelSet | "") => void;
}
export const ModelType: FC<ModelTypeProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
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
          (modelNameMap[activeModelTypeFilter as ModelSet]
            ? t(modelNameMap[activeModelTypeFilter as ModelSet])
            : null) || t("schema.modelType")
        }
        onOpenMenu={handleOpenMenuClick}
        onRemoveFilter={() => onChange("")}
      >
        <Menu
          open={isFilterMenuOpen}
          anchorEl={menuAnchorEl}
          onClose={() => setMenuAnchorEl(null)}
          PaperProps={{
            sx: {
              mt: 1,
            },
          }}
        >
          {MODEL_TYPE_FILTERS.map((filter, index) => (
            <MenuItem
              selected={
                activeModelTypeFilter
                  ? filter === activeModelTypeFilter
                  : index === 0
              }
              key={filter}
              data-cy={`filter_value_${filter}`}
              onClick={() => handleFilterSelect(filter)}
            >
              <ListItemIcon>
                <SvgIcon component={modelIconMap[filter]} />
              </ListItemIcon>
              <ListItemText>{t(modelNameMap[filter])}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </FilterButton>
    </>
  );
};
