import { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  SvgIcon,
} from "@mui/material";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";

import { modelIconMap, modelNameMap } from "../../utils";
import { ModelType as ModelSet } from "../../../../../../shell/services/types";

const MODEL_TYPE_FILTERS: ModelSet[] = ["templateset", "pageset", "dataset"];

export const ModelType = () => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement | null>(
    null
  );
  const [activeFilter, setActiveFilter] = useState<ModelSet | "">("");
  const isFilterMenuOpen = Boolean(menuAnchorEl);

  const handleFilterSelect = (filter: ModelSet) => {
    setMenuAnchorEl(null);
    setActiveFilter(filter);
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        color="inherit"
        endIcon={<ArrowDropDownOutlinedIcon />}
        onClick={(e) => setMenuAnchorEl(e.currentTarget)}
      >
        Model Type
      </Button>
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
