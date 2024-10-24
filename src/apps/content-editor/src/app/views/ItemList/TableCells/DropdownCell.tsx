import { Button, Menu, MenuItem } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid-pro";
import { useState } from "react";
import { KeyboardArrowDownRounded } from "@mui/icons-material";
import { useStagedChanges } from "../StagedChangesContext";

export const DropDownCell = ({ params }: { params: GridRenderCellParams }) => {
  const { stagedChanges, updateStagedChanges } = useStagedChanges();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const field = params.row.fieldData[params.field];
  const handleChange = (value: any) => {
    setAnchorEl(null);

    if (value !== currVal) {
      updateStagedChanges(
        params.row.id,
        params.field,
        value === "Select" ? null : value
      );
    }
  };

  const currVal =
    stagedChanges?.[params.row.id]?.[params.field] === null ||
    !field?.settings?.options
      ? "Select"
      : field?.settings?.options?.[
          stagedChanges?.[params.row.id]?.[params.field]
        ] ||
        field?.settings?.options?.[params?.value] ||
        "Select";

  return (
    <>
      <Button
        sx={{
          color: "text.disabled",
          height: "24px",
          minWidth: "unset",
          padding: "2px",
          " .MuiButton-endIcon": {
            marginLeft: "4px",
          },
        }}
        color="inherit"
        endIcon={<KeyboardArrowDownRounded color="action" />}
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
      >
        {currVal}
      </Button>
      <Menu
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        anchorEl={anchorEl}
        open={!!anchorEl}
      >
        <MenuItem
          dense
          onClick={() => {
            handleChange("Select");
          }}
          sx={{
            textWrap: "wrap",
            wordBreak: "break-word",
          }}
        >
          Select
        </MenuItem>
        {field?.settings?.options &&
          Object.entries(field?.settings?.options)?.map(([key, value]) => (
            <MenuItem
              dense
              key={key}
              onClick={() => {
                handleChange(key);
              }}
              selected={value === currVal}
              sx={{
                textWrap: "wrap",
                wordBreak: "break-word",
              }}
            >
              {value}
            </MenuItem>
          ))}
      </Menu>
    </>
  );
};
