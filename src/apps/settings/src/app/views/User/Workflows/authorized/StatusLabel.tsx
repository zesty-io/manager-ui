import { MouseEvent, FC, ReactElement, useState, useCallback } from "react";
import { useDrag, useDrop } from "react-dnd";
import {
  IconButton,
  Menu,
  MenuItem,
  Fade,
  Box,
  Paper,
  Collapse,
  Typography,
  Card,
  CardActions,
  CardContent,
  ListItemIcon,
  Skeleton,
  alpha,
  ClickAwayListener,
} from "@mui/material";
import Brightness1Icon from "@mui/icons-material/Brightness1";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import PauseCircleOutlineRoundedIcon from "@mui/icons-material/PauseCircleOutlineRounded";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import { useFormDialogContext } from "./forms-dialogs";
import { StatusLabel as StatusLabelTypes } from "../../../../../../../../shell/services/types";

export type StatusLabelProps = {
  id: string;
  isFiltered: boolean;
  moveCard?: (id: string, to: number) => void;
  findCard?: (id: string) => { index: number };
  isDeactivated?: boolean;
  onReorder?: () => void;
  isFocused?: boolean;
  data: StatusLabelTypes;
};

export const StatusLabel: FC<StatusLabelProps> = ({
  id,
  isFiltered,
  moveCard,
  findCard,
  isDeactivated,
  onReorder,
  isFocused,
  data,
}: StatusLabelProps) => {
  const { setFocusedLabel, openStatusLabelForm } = useFormDialogContext();

  const originalIndex = isDeactivated ? 0 : findCard?.(id)?.index;

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: "draggable",
      item: { id, originalIndex },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      options: {
        dropEffect: "copy",
      },
      end: (item, monitor) => {
        const { id: droppedId, originalIndex } = item;
        const didDrop = monitor.didDrop();
        if (!didDrop) {
          moveCard?.(droppedId, originalIndex);
        }
      },
    }),
    [id, originalIndex, moveCard]
  );

  const [, drop] = useDrop(
    () => ({
      accept: "draggable",
      hover({ id: draggedId }: { id: string; originalIndex: number }) {
        if (draggedId !== id) {
          const { index: overIndex } = findCard?.(id);
          moveCard?.(draggedId, overIndex);
        }
      },
      drop: () => {
        onReorder?.();
      },
    }),
    [findCard, moveCard, onReorder]
  );

  const withClickAwayListener = useCallback(
    (component: ReactElement) => {
      if (isFocused) {
        return (
          <ClickAwayListener onClickAway={() => setFocusedLabel("")}>
            {component}
          </ClickAwayListener>
        );
      }
      return component;
    },
    [isFocused, setFocusedLabel]
  );

  return (
    <Collapse in={!isFiltered}>
      {withClickAwayListener(
        <Card
          data-cy="status-label"
          elevation={0}
          variant="outlined"
          ref={
            isDeactivated ? null : (node) => drop(preview(node as HTMLElement))
          }
          sx={{
            mx: 4,
            my: 1,
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
            borderRadius: 2,
            opacity: isDragging ? 0 : isDeactivated ? 0.7 : 1,
            border: "1px solid",
            borderColor: (theme) => theme.palette.border,
            backgroundColor: isFocused
              ? (theme) => alpha(theme.palette.primary.light, 0.1)
              : "background.paper",
          }}
        >
          <Box
            data-cy="status-label-drag-handle"
            component="div"
            ref={isDeactivated ? null : (node) => drag(node as HTMLElement)}
            sx={{
              cursor: isDeactivated ? "default" : "grab",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexGrow: 0,
            }}
          >
            <DragIndicatorRoundedIcon color="action" fontSize="small" />
          </Box>

          <Brightness1Icon sx={{ color: data?.color }} fontSize="medium" />

          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: 0,
              flexGrow: 1,
            }}
          >
            <Typography
              variant="h6"
              color="text.primary"
              fontWeight={700}
              lineHeight="22px"
              data-cy="status-label-name"
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
          </CardContent>

          <CardActions sx={{ flexGrow: 0, padding: 0 }}>
            <MoreActionsMenu data={data} isDeactivated={isDeactivated} />
          </CardActions>
        </Card>
      )}
    </Collapse>
  );
};

const MoreActionsMenu = ({
  data,
  isDeactivated,
}: {
  data: StatusLabelTypes;
  isDeactivated?: boolean;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { openStatusLabelForm, openDeactivationDialog } =
    useFormDialogContext();

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openEditForm = () => {
    openStatusLabelForm({ values: data, isDeactivated: isDeactivated });
    setAnchorEl(null);
  };

  const openDeleteDialog = () => {
    openDeactivationDialog({ ZUID: data?.ZUID, name: data?.name });
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        data-amp-track-id="workflows-status-label-menu-button"
        size="small"
        onClick={handleOpen}
        sx={{ borderRadius: "50%" }}
        data-cy="status-label-more-actions"
      >
        <MoreHorizIcon fontSize="small" color="action" />
      </IconButton>
      <Menu
        data-amp-track-id="workflows-status-label-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          data-amp-track-id="workflows-status-label-menu-edit-button"
          onClick={openEditForm}
          data-cy="menu-item-edit"
        >
          <ListItemIcon color="action.active">
            <DriveFileRenameOutlineIcon />
          </ListItemIcon>
          <Typography variant="body1" color="text.primary">
            Edit Status
          </Typography>
        </MenuItem>

        {!isDeactivated && (
          <MenuItem
            data-amp-track-id="workflows-status-label-menu-deactivate-button"
            onClick={openDeleteDialog}
            data-cy="menu-item-deactivate"
          >
            <ListItemIcon color="action.active">
              <PauseCircleOutlineRoundedIcon />
            </ListItemIcon>
            <Typography variant="body1" color="text.primary">
              Deactivate Status
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export const StatusLabelSkeleton = ({ width = 1 }: { width: number }) => {
  return (
    <Box width="100%" px={4} display="flex" flexDirection="column" rowGap={1}>
      <Paper
        elevation={0}
        sx={{
          height: "76%",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          py: 1,
          px: 2,
          columnGap: 1,
          borderRadius: "8px",
        }}
      >
        <DragIndicatorRoundedIcon
          sx={{
            width: "22px",
            height: "22px",
            color: "grey.400",
            opacity: 0.45,
          }}
        />
        <Skeleton
          variant="circular"
          width={22}
          height={22}
          sx={{ bgcolor: "action.disabled" }}
        />
        <Box flexGrow={1} ml={1}>
          <Skeleton
            variant="text"
            height={32}
            sx={{ width: `calc(10% * ${width})`, bgcolor: "action.disabled" }}
          />
          <Skeleton
            variant="text"
            height={20}
            sx={{ width: `calc(30% * ${width})`, bgcolor: "action.focus" }}
          />
        </Box>
        <MoreHorizIcon
          sx={{
            width: "26px",
            height: "26px",
            color: "grey.400",
            opacity: 0.45,
          }}
        />
      </Paper>
    </Box>
  );
};

export const StatusLabelLoader = () => (
  <Box display="flex" flexDirection="column" rowGap={2}>
    <StatusLabelSkeleton width={1.5} />
    <StatusLabelSkeleton width={2.7} />
    <StatusLabelSkeleton width={1.85} />
  </Box>
);
