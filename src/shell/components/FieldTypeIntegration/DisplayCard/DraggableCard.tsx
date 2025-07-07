import { useState, FC, useRef } from "react";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Box, Typography, IconButton, Paper } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import DataObjectIcon from "@mui/icons-material/DataObject";
import { IntegrationTypes, IntegrationKeyPaths } from "../../../services/types";
import DisplayCard from ".";
import { useIntegrationField } from "../IntegrationFieldProvider";
import Skeleton from "@mui/material/Skeleton";
import { useDrag, useDrop } from "react-dnd";

type DraggableCardProps = IntegrationKeyPaths & {
  id?: string;
  type: IntegrationTypes;
  data?: any;
  loading?: boolean;

  disableMenu?: boolean;
  moveCard?: (id: string, hoverIndex: number) => void;
  onReorder?: () => void;
  index?: number;
  draggable?: boolean;
};
interface DragItem {
  index: number;
  id: string;
  type: string;
}
export const ItemTypes = {
  CARD: "card",
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
  moveCard,
  onReorder,
  draggable = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.CARD,
    item: () => ({ id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      onReorder?.();
    },
  });

  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover: (item: DragItem, monitor) => {
      if (!ref.current) return;
      if (item.index === index) return;

      moveCard?.(item.id, index);
      item.index = index;
    },
  });

  drag(drop(preview(ref)));

  return (
    <Paper
      className="draggableCard"
      id={id}
      elevation={0}
      ref={draggable ? ref : null}
      sx={{
        opacity: isDragging ? 0.1 : 1,
        py: 0,
        pl: "28px",
        pr: "40px",
        width: "100%",
        height: "fit-content",
        borderRadius: "8px",
        position: "relative",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        outline: "1px solid",
        outlineColor: "border",
        outlineOffset: "0",
        transform: "translate(0, 0)",
        "& *": {
          boxSizing: "border-box",
        },
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
          <MoreOptions id={id} data={data} disableMenu={disableMenu} />
        )}
      </Box>
    </Paper>
  );
};

const MoreOptions = ({
  id,
  data,
  disableMenu = false,
}: {
  id: string;
  data: any;
  disableMenu?: boolean;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const {
    jsonViewerIsOpen,
    setJsonViewerIsOpen,
    setJsonData,
    removeSelectedItem,
  } = useIntegrationField();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRemoveItem = () => {
    removeSelectedItem(id);
  };

  const handleViewJsonData = () => {
    setJsonData(data);
    setJsonViewerIsOpen(true);
  };
  return (
    <Box>
      <IconButton
        size="small"
        onClick={handleClick}
        disabled={disableMenu}
        className="moreOptionButton"
      >
        <MoreHorizIcon color="action" fontSize="small" />
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
        <MenuItem
          onClick={handleViewJsonData}
          className="moreOptionMenuItem-view"
        >
          <DataObjectIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="body1" color="text.primary">
            View Raw JSON
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={handleRemoveItem}
          className="moreOptionMenuItem-remove"
        >
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
