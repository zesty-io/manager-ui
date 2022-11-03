import { FC, useState } from "react";
import { Button, Box, MenuItem, Menu } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";
import {
  Filetype,
  setFiletypeFilter,
} from "../../../../../../shell/store/media-revamp";

export const FiletypeFilter: FC = () => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleChange = (filetype: Filetype) => {
    dispatch(setFiletypeFilter(filetype));
    handleClose();
  };
  return (
    <>
      <Button
        endIcon={<ArrowDropDownIcon />}
        onClick={handleClick}
        variant="outlined"
        size="small"
        color="inherit"
        sx={{
          py: "1px",
        }}
      >
        File Type
      </Button>
      <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
        <MenuItem onClick={() => handleChange("image")}>Images</MenuItem>
        <MenuItem onClick={() => handleChange("video")}>Videos</MenuItem>
        <MenuItem onClick={() => handleChange("audio")}>Audio</MenuItem>
        <MenuItem onClick={() => handleChange("pdf")}>PDFs</MenuItem>
        <MenuItem onClick={() => handleChange("document")}>Documents</MenuItem>
        <MenuItem onClick={() => handleChange("presentation")}>
          Presentations
        </MenuItem>
        <MenuItem onClick={() => handleChange("spreadsheet")}>
          Spreadsheets
        </MenuItem>
        <MenuItem onClick={() => handleChange("code")}>Code</MenuItem>
        <MenuItem onClick={() => handleChange("font")}>Fonts</MenuItem>
        <MenuItem onClick={() => handleChange("archive")}>
          Archives (zip)
        </MenuItem>
      </Menu>
    </>
  );
};
