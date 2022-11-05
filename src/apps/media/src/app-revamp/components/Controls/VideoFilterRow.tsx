import { FC, useState } from "react";
import { useDispatch } from "react-redux";

import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Typography from "@mui/material/Typography";
import ListItemIcon from "@mui/material/ListItemIcon";

import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import MovieCreationRounded from "@mui/icons-material/MovieCreationRounded";

import {
  Filetype,
  setFiletypeFilter,
} from "../../../../../../shell/store/media-revamp";

type VideoFilterRow = {
  onClose: () => void;
};
export const VideoFilterRow: FC<VideoFilterRow> = ({ onClose }) => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    onClose();
  };
  const handleChange = (filetype: Filetype) => {
    dispatch(setFiletypeFilter(filetype));
    handleClose();
    onClose();
  };
  return (
    <>
      {/*@ts-expect-error*/}
      <MenuItem onClick={handleClick}>
        <ListItemIcon>
          <MovieCreationRounded fontSize="small" />
        </ListItemIcon>
        <Typography variant="body1">Videos</Typography>
        <ListItemIcon>
          <ChevronRightOutlined fontSize="small" />
        </ListItemIcon>
      </MenuItem>
      <Menu
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => handleChange("Videos")}>
          <Typography variant="body1">All Video Types</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("MPEGs")}>
          <Typography variant="body1">MPEG</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("MP4s")}>
          <Typography variant="body1">MP4</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("MOVs")}>
          <Typography variant="body1">MOV</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("WMVs")}>
          <Typography variant="body1">WMV</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("AVIs")}>
          <Typography variant="body1">AVI</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("FLVs")}>
          <Typography variant="body1">FLV</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};
