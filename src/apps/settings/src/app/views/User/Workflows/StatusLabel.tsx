import type { FC, MouseEvent } from "react";
import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Menu,
  Button,
  ListItemIcon,
} from "@mui/material";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import * as WorkflowStatus from "./constants";

import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import PauseCircleOutlineRoundedIcon from "@mui/icons-material/PauseCircleOutlineRounded";
import { useWorkflowStatus } from "./WorkflowsContext";

type StatusLabelPropTypes = {
  data: WorkflowStatus.StatusLabelProps;
  draggable?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
};

export const StatusLabel: FC<StatusLabelPropTypes> = ({
  data,
  draggable = false,
  onEdit,
  onDelete,
  onClose,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        height: "76px",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        pt: 2,
        pr: 2,
        pb: 2,
        pl: 1,
        columnGap: 1.5,
        borderRadius: (theme) => theme.spacing(1),
        opacity: draggable ? 1 : 0.7,
        border: "1px solid",
        borderColor: (theme) => theme.palette.border,
      }}
    >
      <Box
        sx={{
          width: "22px",
          height: "22px",
          cursor: draggable ? "grab" : "default",
          opacity: draggable ? 0 : 1,
        }}
      >
        <DragIndicatorRoundedIcon
          sx={{
            width: "100%",
            height: "100%",
            color: "grey.400",
          }}
        />
      </Box>

      <Box
        bgcolor={data?.color}
        width="22px"
        height="22px"
        borderRadius="50%"
      />
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="stretch"
        flexGrow={1}
      >
        <Typography
          variant="h6"
          color="text.primary"
          component="h6"
          fontWeight={700}
          lineHeight="22px"
        >
          {data?.name}
        </Typography>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          lineHeight="20px"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          fontWeight={400}
        >
          {data?.description}
        </Typography>
      </Box>
      <Box>
        <MoreActionsMenu onEdit={onEdit} data={data} />
      </Box>
    </Paper>
  );
};
type MoreActionsMenuProps = {
  onEdit?: () => void;
  data: WorkflowStatus.StatusLabelProps;
};

function MoreActionsMenu({ onEdit, data }: MoreActionsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { openDeleteConfirm } = useWorkflowStatus();

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEditClicked = () => {
    onEdit();
    setAnchorEl(null);
  };

  const handleDelete = () => {
    alert("DELETED");
  };

  const handleDeleteClicked = () => {
    // onDelete();
    openDeleteConfirm({
      zuid: data?.zuid,
      labelName: data?.name,
    });
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        size="small"
        sx={{ borderRadius: "50%" }}
        id="fade-button"
        aria-controls={open ? "fade-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <MoreHorizIcon
          sx={{ width: "26px", height: "26px", color: "grey.400" }}
        />
      </IconButton>
      <Menu
        id="fade-menu"
        MenuListProps={{
          "aria-labelledby": "fade-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleEditClicked}>
          <ListItemIcon color="action.active">
            <DriveFileRenameOutlineIcon />
          </ListItemIcon>
          <Typography variant="body1" color="text.primary">
            Edit Status
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleDeleteClicked}>
          <ListItemIcon color="action.active">
            <PauseCircleOutlineRoundedIcon />
          </ListItemIcon>
          <Typography variant="body1" color="text.primary">
            Deactivate Status
          </Typography>
        </MenuItem>
      </Menu>
    </div>
  );
}
