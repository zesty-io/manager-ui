import { FC, useState } from "react";
import { useDispatch } from "react-redux";

import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Typography from "@mui/material/Typography";
import ListItemIcon from "@mui/material/ListItemIcon";

import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import ImageRounded from "@mui/icons-material/ImageRounded";

import {
  Filetype,
  setFiletypeFilter,
} from "../../../../../../shell/store/media-revamp";

type ImageFilterRow = {
  onClose: () => void;
};
export const ImageFilterRow: FC<ImageFilterRow> = ({ onClose }) => {
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
          <ImageRounded fontSize="small" />
        </ListItemIcon>
        <Typography variant="body1">Images</Typography>
        <ListItemIcon>
          <ChevronRightOutlined fontSize="small" />
        </ListItemIcon>
      </MenuItem>
      <Menu
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: -8, horizontal: "right" }}
      >
        <MenuItem onClick={() => handleChange("Images")}>
          <Typography variant="body1">All Image Types</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("PNGs")}>
          <Typography variant="body1">PNG</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("JPEGs")}>
          <Typography variant="body1">JPEG</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("SVGs")}>
          <Typography variant="body1">SVG</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("WEBPs")}>
          <Typography variant="body1">WEBP</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("GIFs")}>
          <Typography variant="body1">GIF</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};
