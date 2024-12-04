import { FC } from "react";
import { memo } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Box } from "@mui/material";

import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";

export type CardProps = {
  id: string;
  moveCard: (id: string, to: number) => void;
  findCard: (id: string) => { index: number };
};

type Item = {
  id: string;
  originalIndex: number;
};

export const Draggable: FC<CardProps> = memo(function Card({
  id,

  moveCard,
  findCard,

  children,
}) {
  const originalIndex = findCard(id).index;
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: "drag-card",
      item: { id, originalIndex },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const { id: droppedId, originalIndex } = item;
        const didDrop = monitor.didDrop();
        if (!didDrop) {
          moveCard(droppedId, originalIndex);
        }
      },
    }),
    [id, originalIndex, moveCard]
  );

  const [, drop] = useDrop(
    () => ({
      accept: "drag-card",
      hover({ id: draggedId }: Item) {
        if (draggedId !== id) {
          const { index: overIndex } = findCard(id);
          moveCard(draggedId, overIndex);
        }
      },
    }),
    [findCard, moveCard]
  );

  const dragDrop = (node: HTMLElement) => {
    drag(drop(node as HTMLElement));
  };

  return (
    <Box
      ref={preview}
      sx={{
        opacity: isDragging ? 0.1 : 1,
        width: "100%",

        height: "fit-content",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        columnGap: 1.5,
        position: "relative",

        borderRadius: (theme) => theme.spacing(1),
      }}
    >
      <div
        ref={(node) => dragDrop(node)}
        style={{
          height: "100%",
          cursor: "grab",
          position: "absolute",
          left: 0,
          top: 0,
          paddingLeft: "8px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        <DragIndicatorRoundedIcon
          sx={{
            width: "22px",
            height: "22px",
            color: "grey.400",
          }}
        />
      </div>
      {children}
    </Box>
  );
});

// type MoreActionsMenuProps = {
//   onEdit: () => void;
//   onDelete: () => void;
// };

// function MoreActionsMenu({ onEdit, onDelete }: MoreActionsMenuProps) {
//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
//   const open = Boolean(anchorEl);
//   const handleClick = (event: MouseEvent<HTMLElement>) => {
//     setAnchorEl(event.currentTarget);
//   };
//   const handleClose = () => {
//     setAnchorEl(null);
//   };

//   const handleEditClicked = () => {
//     onEdit();
//     setAnchorEl(null);
//   };
//   const handleDeleteClicked = () => {
//     onDelete();
//     setAnchorEl(null);
//   };

//   return (
//     <div>
//       <IconButton
//         size="small"
//         sx={{ borderRadius: "50%" }}
//         id="fade-button"
//         aria-controls={open ? "fade-menu" : undefined}
//         aria-haspopup="true"
//         aria-expanded={open ? "true" : undefined}
//         onClick={handleClick}
//       >
//         <MoreHorizIcon
//           sx={{ width: "26px", height: "26px", color: "grey.400" }}
//         />
//       </IconButton>
//       <Menu
//         id="fade-menu"
//         MenuListProps={{
//           "aria-labelledby": "fade-button",
//         }}
//         anchorEl={anchorEl}
//         open={open}
//         onClose={handleClose}
//         TransitionComponent={Fade}
//         anchorOrigin={{
//           vertical: "bottom",
//           horizontal: "right",
//         }}
//         transformOrigin={{
//           vertical: "top",
//           horizontal: "right",
//         }}
//       >
//         <MenuItem onClick={handleEditClicked}>
//           <ListItemIcon color="action.active">
//             <DriveFileRenameOutlineIcon />
//           </ListItemIcon>
//           <Typography variant="body1" color="text.primary">
//             Edit Status
//           </Typography>
//         </MenuItem>
//         <MenuItem onClick={handleDeleteClicked}>
//           <ListItemIcon color="action.active">
//             <PauseCircleOutlineRoundedIcon />
//           </ListItemIcon>
//           <Typography variant="body1" color="text.primary">
//             Deactivate Status
//           </Typography>
//         </MenuItem>
//       </Menu>
//     </div>
//   );
// }
