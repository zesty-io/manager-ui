import { useState, FC, ReactNode, ChangeEvent } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  CardMedia,
  Avatar,
  Checkbox,
  Grid,
  IconButton,
  Stack,
  Paper,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
// import { SelectionDisplayType } from "../configs";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import moment from "moment-timezone";
import { getObjectValue } from "../utils";
import DataObjectIcon from "@mui/icons-material/DataObject";

import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { IntegrationTypes, ConfigProps } from "../configs";

// width={["youtube", "video", "mux"].includes(type) ? "142px" : "76px"}

type DetailsProps = Record<string, string | number>;

type CardWrapperPtops = {
  title: string;
  subTitle: string;
  children: ReactNode;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  cardType?: "select" | "drag" | "preview";
};

const CardWrapper: FC<CardWrapperPtops> = ({
  title,
  subTitle,
  cardType,
  isSelected,
  onSelect,
  children,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        py: 1,
        pl: "54px",
        pr: "58px",
        width: "100%",
        height: "96px",
        borderRadius: 0,
        position: "relative",

        boxSizing: "border-box",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        outline: "1px solid",
        outlineColor: "border",
        "& *": {
          boxSizing: "border-box",
        },
      }}
    >
      <Box
        position="absolute"
        left={0}
        width="56px"
        height="100%"
        boxSizing="border-box"
        sx={{
          display: "grid",
          placeContent: "center",
        }}
      >
        <SelectCheckBox
          isSelected={isSelected}
          onChange={(e) => {
            onSelect && onSelect(e);
          }}
        />
      </Box>
      {children}
      <Box
        position="absolute"
        right={0}
        width="58px"
        height="100%"
        pr={2}
        sx={{
          display: "grid",
          placeContent: "center",
        }}
      >
        {cardType === "select" ? (
          <IconButton
            sx={{
              borderRadius: 1,
              color: "action.active",
            }}
            // onClick={() => setSelectedCard(1)}
          >
            <DataObjectIcon />
          </IconButton>
        ) : (
          <MoreOptions />
        )}
      </Box>
    </Paper>
  );
};

const SelectCheckBox = ({
  isSelected,
  onChange,
}: {
  isSelected: boolean;
  onChange: (checked: boolean) => void;
}) => {
  return (
    <Checkbox
      checked={isSelected}
      onChange={(e) => {
        onChange(e.target.checked);
      }}
    />
  );
};

const MediaPreview = ({
  url,
  integrationType,
}: {
  url: string;
  integrationType: IntegrationTypes;
}) => {
  return <Box sx={{}}></Box>;
};

const MoreOptions = () => {
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
      <IconButton onClick={handleClick}>
        <MoreHorizIcon color="action" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem>
          <DataObjectIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="body1" color="text.primary">
            View Raw JSON
          </Typography>
        </MenuItem>
        <MenuItem>
          <ClearIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="body1" color="text.primary">
            Remove
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CardWrapper;
