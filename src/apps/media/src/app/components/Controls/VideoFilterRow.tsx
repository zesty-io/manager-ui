import { FC, useState } from "react";

import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Typography from "@mui/material/Typography";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";

import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import MovieCreationRounded from "@mui/icons-material/MovieCreationRounded";

import { useParams } from "../../../../../../shell/hooks/useParams";
import { Filetype } from "../../../../../../shell/store/media-revamp";

type VideoFilterRow = {
  onClose: () => void;
};
export const VideoFilterRow: FC<VideoFilterRow> = ({ onClose }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [params, setParams] = useParams();
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    onClose();
  };
  const handleChange = (filetype: Filetype) => {
    setParams(filetype, "filetype");
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
        <ListItemText>Videos</ListItemText>
        <ListItemIcon style={{ minWidth: "0px" }}>
          <ChevronRightOutlined fontSize="small" />
        </ListItemIcon>
      </MenuItem>
      <Menu
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => handleChange("Video")}>
          <Typography variant="body1">All Video Types</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("MPEG")}>
          <Typography variant="body1">MPEG</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("MP4")}>
          <Typography variant="body1">MP4</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("MOV")}>
          <Typography variant="body1">MOV</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("WMV")}>
          <Typography variant="body1">WMV</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("AVI")}>
          <Typography variant="body1">AVI</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("FLV")}>
          <Typography variant="body1">FLV</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};
