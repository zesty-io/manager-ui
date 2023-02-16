import { FC, useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  SvgIcon,
  ButtonGroup,
} from "@mui/material";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import { modelIconMap, modelNameMap } from "../../utils";
import { ModelType as ModelSet } from "../../../../../../shell/services/types";
import { FiltersProps } from "./index";

const MODEL_TYPE_FILTERS: ModelSet[] = ["templateset", "pageset", "dataset"];

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

  const getFilterButton = () => {
    if (activeModelTypeFilter) {
      return (
        <ButtonGroup variant="contained">
          <Button
            size="small"
            startIcon={<CheckIcon sx={{ width: "20px", height: "20px" }} />}
            onClick={handleOpenMenuClick}
          >
            {modelNameMap[activeModelTypeFilter]}
          </Button>
          <Button
            size="small"
            onClick={() => setActiveFilters({ modelType: "" })}
          >
            <CloseRoundedIcon fontSize="small" />
          </Button>
        </ButtonGroup>
      );
    } else {
      return (
        <Button
          variant="outlined"
          size="small"
          color="inherit"
          endIcon={<ArrowDropDownOutlinedIcon />}
          onClick={handleOpenMenuClick}
        >
          Model Type
        </Button>
      );
    }
  };

  return (
    <>
      {getFilterButton()}
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
    </>
  );
};
