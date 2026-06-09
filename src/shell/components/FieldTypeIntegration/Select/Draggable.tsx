import React, { useRef, useState, type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
} from "@mui/material";
import { useDrag, useDrop } from "react-dnd";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ClearIcon from "@mui/icons-material/Clear";
import DataObjectIcon from "@mui/icons-material/DataObject";

interface DragItem {
  id: string;
  index: number;
}

interface DraggableProps {
  id: string;
  index: number;
  moveItem: (from: number, to: number) => void;
  loading?: boolean;
  onDelete?: () => void;
  onView?: () => void;
  children: ReactElement;
}

const Draggable: React.FC<DraggableProps> = ({
  id,
  index,
  moveItem,
  loading,
  onDelete,
  onView,
  children,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag<
    DragItem,
    void,
    { isDragging: boolean }
  >({
    type: "card",
    options: {
      dropEffect: "copy",
    },
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>(
    () => ({
      accept: "card",

      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
      drop: (item: DragItem) => {
        const dragIndex = item?.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) return;
        moveItem(dragIndex, hoverIndex);
        item.index = dragIndex;
      },
    }),
    [moveItem]
  );

  drop(preview(itemRef));

  return (
    <Paper
      className="draggableCard"
      elevation={0}
      component="div"
      ref={itemRef}
      variant="outlined"
      sx={{
        borderColor: "border",
        py: 0,
        pr: 1,
        width: "100%",
        height: "fit-content",
        borderRadius: 2,
        position: "relative",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        my: 1,
        opacity: isOver ? 0.2 : isDragging ? 0.5 : 1,
        transform: isOver ? "scale(1.02)" : "scale(1)",
        outline: isOver ? "1px dashed" : "none",
        outlineColor: "success.main",
      }}
    >
      <div
        className="draggableCardDragHandle"
        ref={loading ? null : (node) => drag(node)}
        style={{
          width: "28px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        {loading ? (
          <Skeleton width="8px" height="13px" />
        ) : (
          <DragIndicatorRoundedIcon color="action" fontSize="small" />
        )}
      </div>

      <Box
        flexGrow={1}
        width="100%"
        height="100%"
        position="relative"
        boxSizing="border-box"
        overflow="hidden"
      >
        {children}
      </Box>

      <Box
        right={0}
        width="40px"
        height="100%"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MoreOptions disableMenu={false} onDelete={onDelete} onView={onView} />
      </Box>
    </Paper>
  );
};

interface MoreOptionsProps {
  disableMenu?: boolean;
  onDelete?: () => void;
  onView?: () => void;
}

const MoreOptions: React.FC<MoreOptionsProps> = ({
  disableMenu = false,
  onDelete,
  onView,
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (handler?: () => void) => {
    handler?.();
    handleClose();
  };

  return (
    <Box>
      <IconButton
        size="small"
        onClick={handleClick}
        disabled={disableMenu}
        className="moreOptionButton"
      >
        <MoreHorizIcon color="action" />
      </IconButton>
      <Menu
        className="moreOptionMenu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem
          onClick={() => handleMenuItemClick(onView)}
          className="moreOptionMenuItem-view"
          disabled={!onView}
        >
          <DataObjectIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="body1" color="text.primary">
            View Raw JSON
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => handleMenuItemClick(onDelete)}
          className="moreOptionMenuItem-remove"
          disabled={!onDelete}
        >
          <ClearIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="body1" color="text.primary">
            {t("remove")}
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Draggable;
