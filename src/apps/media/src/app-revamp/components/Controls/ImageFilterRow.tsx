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
        anchorOrigin={{
          /*
            The list has a verticle padding of 8px
            We need the submenu to be flush with the top of the main dropdown
            menu, NOT flush with the first item in the menu. So we must cancel
            out the padding of the list with vertical: -8px
          */
          vertical: -8,
          horizontal: "right",
        }}
      >
        <MenuItem onClick={() => handleChange("Image")}>
          <Typography variant="body1">All Image Types</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("PNG")}>
          <Typography variant="body1">PNG</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("JPEG")}>
          <Typography variant="body1">JPEG</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("SVG")}>
          <Typography variant="body1">SVG</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("WEBP")}>
          <Typography variant="body1">WEBP</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("GIF")}>
          <Typography variant="body1">GIF</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};
