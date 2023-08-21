import { IconButton, ListItemIcon, Menu, MenuItem } from "@mui/material";
import {
  MoreHorizRounded,
  WidgetsRounded,
  ContentCopyRounded,
  BoltRounded,
  DataObjectRounded,
  CodeRounded,
  DeleteRounded,
} from "@mui/icons-material";
import { useState } from "react";
import { Database } from "@zesty-io/material";
import { useHistory, useParams } from "react-router";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../../../shell/store/types";
import { ContentItem } from "../../../../../../../../shell/services/types";
import {
  useCreateContentItemMutation,
  useGetContentModelFieldsQuery,
  useGetContentModelQuery,
} from "../../../../../../../../shell/services/instance";
import { DuplicateItemDialog } from "./DuplicateItemDialog";

export const MoreMenu = () => {
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const [showDuplicateItemDialog, setShowDuplicateItemDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data: modelFields } = useGetContentModelFieldsQuery(modelZUID);
  const history = useHistory();
  const item = useSelector(
    (state: AppState) => state.content[itemZUID] as ContentItem
  );

  return (
    <>
      <IconButton
        size="small"
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
        }}
      >
        <MoreHorizRounded fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: -8,
          horizontal: "right",
        }}
        onClose={() => {
          setAnchorEl(null);
        }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setShowDuplicateItemDialog(true);
          }}
        >
          <ListItemIcon>
            <ContentCopyRounded fontSize="small" />
          </ListItemIcon>
          Duplicate Item
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <WidgetsRounded fontSize="small" />
          </ListItemIcon>
          Copy
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <BoltRounded fontSize="small" />
          </ListItemIcon>
          View Quick Access API
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <DataObjectRounded fontSize="small" />
          </ListItemIcon>
          View Site Generators API
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Database fontSize="small" />
          </ListItemIcon>
          Edit Model
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <CodeRounded fontSize="small" />
          </ListItemIcon>
          Edit Template
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <DeleteRounded fontSize="small" />
          </ListItemIcon>
          Delete Item
        </MenuItem>
      </Menu>
      {showDuplicateItemDialog && (
        <DuplicateItemDialog
          onClose={() => setShowDuplicateItemDialog(false)}
        />
      )}
    </>
  );
};
