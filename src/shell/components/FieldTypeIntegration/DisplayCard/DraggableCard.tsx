import { useState, FC } from "react";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Box, Typography, IconButton, Paper } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import DataObjectIcon from "@mui/icons-material/DataObject";
import { IntegrationTypes, IntegrationKeyPaths } from "../../../services/types";
import DisplayCard from ".";
import Skeleton from "@mui/material/Skeleton";
import { useDrag, useDrop } from "react-dnd";

type DragItem = {
  id: string;
  index: number;
};

type DraggableCardProps = IntegrationKeyPaths & {
  id?: string;
  type: IntegrationTypes;
  data?: any;
  loading?: boolean;

  disableMenu?: boolean;
  findCard?: (id: string) => number;
  moveCard?: (from: number, to: number) => void;
  index?: number;
  draggable?: boolean;
  onView?: () => void;
  onDelete?: () => void;
};

const DraggableCard: FC<DraggableCardProps> = ({
  id,
  type,
  rootPath,
  heading,
  subHeading,
  thumbnail,
  detail,
  details,
  data,
  loading = false,
  disableMenu = false,
  index,
  findCard,
  moveCard,
  draggable = false,
  onView,
  onDelete,
}) => {
  const originIndex = findCard?.(id);

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: "card",
    item: { id, originIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "card",
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),

      drop(item: DragItem, monitor) {
        const { id: droppedId } = item;

        const draggedIndex = findCard(droppedId);
        const currentIndex = findCard(id);

        if (draggedIndex !== currentIndex) {
          moveCard?.(draggedIndex, currentIndex);
        }
      },
    }),
    [findCard, moveCard]
  );

  return (
    <Paper
      className="draggableCard"
      id={id}
      elevation={0}
      ref={!draggable ? null : (node) => drop(preview(node as HTMLElement))}
      sx={{
        py: 0,
        pl: 3.5,
        pr: "40px",
        width: "100%",
        height: "fit-content",
        borderRadius: 2,
        position: "relative",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        my: 0.5,
        outline: isOver ? "1px dashed green" : "none",
        opacity: isOver || isDragging ? 0.2 : 1,
        scale: isOver ? 1.03 : 1,
      }}
    >
      <Box
        className="draggableCardDragHandle"
        ref={draggable ? (node) => drag(node as HTMLElement) : null}
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "28px",
          display: "grid",
          placeContent: "center",
          cursor: "grab",
        }}
      >
        {loading ? (
          <Skeleton animation="wave" height="35px" width="11px" />
        ) : (
          <DragIndicatorRoundedIcon color="action" fontSize="small" />
        )}
      </Box>

      <Box
        width="100%"
        height="100%"
        position="relative"
        boxSizing="border-box"
        overflow="hidden"
      >
        <DisplayCard
          rootPath={rootPath}
          type={type}
          heading={heading}
          subHeading={subHeading}
          thumbnail={thumbnail}
          detail={detail}
          details={details}
          data={data}
          loading={loading}
          isDraggable={true}
        />
      </Box>

      <Box
        position="absolute"
        right={0}
        width="40px"
        height="100%"
        pr={2}
        sx={{
          display: "grid",
          placeContent: "center",
        }}
      >
        {loading ? (
          <Skeleton
            animation="wave"
            variant="circular"
            height="20px"
            width="20px"
          />
        ) : (
          <MoreOptions
            disableMenu={disableMenu}
            onView={onView}
            onDelete={onDelete}
          />
        )}
      </Box>
    </Paper>
  );
};

const MoreOptions = ({
  disableMenu = false,
  onDelete,
  onView,
}: {
  disableMenu?: boolean;
  onDelete?: () => void;
  onView?: () => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
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
        onClick={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem onClick={onView} className="moreOptionMenuItem-view">
          <DataObjectIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="body1" color="text.primary">
            View Raw JSON
          </Typography>
        </MenuItem>
        <MenuItem onClick={onDelete} className="moreOptionMenuItem-remove">
          <ClearIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="body1" color="text.primary">
            Remove
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DraggableCard;
