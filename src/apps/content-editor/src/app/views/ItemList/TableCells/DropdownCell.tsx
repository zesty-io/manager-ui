import { useParams as useRouterParams } from "react-router";
import { Button, Menu, MenuItem } from "@mui/material";
import { useGetContentModelFieldsQuery } from "../../../../../../../shell/services/instance";
import { GridRenderCellParams } from "@mui/x-data-grid-pro";
import { useState } from "react";
import { KeyboardArrowDownRounded } from "@mui/icons-material";
import { ContentItem } from "../../../../../../../shell/services/types";
import { useStagedChanges } from "../StagedChangesContext";

export const DropDownCell = ({ params }: { params: GridRenderCellParams }) => {
  const { stagedChanges, updateStagedChanges } = useStagedChanges();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { modelZUID } = useRouterParams<{ modelZUID: string }>();
  const { data: fields, isFetching: isFieldsFetching } =
    useGetContentModelFieldsQuery(modelZUID);
  const field = fields?.find((field) => field.name === params.field);
  const handleChange = (value: any) => {
    setAnchorEl(null);
    updateStagedChanges(params.row.id, params.field, value);
  };

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
        {stagedChanges?.[params.row.id]?.[params.field] === null ||
        !field?.settings?.options
          ? "Select"
          : field?.settings?.options?.[
              stagedChanges?.[params.row.id]?.[params.field]
            ] ||
            field?.settings?.options?.[params?.value] ||
            "Select"}
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
          onClick={() => {
            handleChange(null);
          }}
        >
          Select
        </MenuItem>
        {field?.settings?.options &&
          Object.entries(field?.settings?.options)?.map(([key, value]) => (
            <MenuItem
              key={key}
              onClick={() => {
                handleChange(key);
              }}
            >
              {value}
            </MenuItem>
          ))}
      </Menu>
    </>
  );
};
