import { FC, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Typography from "@mui/material/Typography";
import ListItemIcon from "@mui/material/ListItemIcon";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ImageRounded from "@mui/icons-material/ImageRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import MovieCreationRounded from "@mui/icons-material/MovieCreationRounded";
import AudiotrackRounded from "@mui/icons-material/AudiotrackRounded";
import PicutreasPdfRounded from "@mui/icons-material/PictureAsPdfRounded";
import DescriptionRounded from "@mui/icons-material/DescriptionRounded";
import SlideshowRounded from "@mui/icons-material/SlideshowRounded";
import BorderAllRounded from "@mui/icons-material/BorderAllRounded";
import CodeRounded from "@mui/icons-material/CodeRounded";
import FontDownloadRounded from "@mui/icons-material/FontDownloadRounded";
import FolderZipRounded from "@mui/icons-material/FolderZipRounded";

import { AppState } from "../../../../../../shell/store/types";
import {
  Filetype,
  setFiletypeFilter,
} from "../../../../../../shell/store/media-revamp";
import { ButtonGroup } from "@mui/material";

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
  const activeFilter = useSelector(
    (state: AppState) => state.mediaRevamp.filetypeFilter
  );

  const inactiveButton = (
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
  );
  const activeButton = (
    <ButtonGroup>
      <Button
        onClick={handleClick}
        variant="outlined"
        size="small"
        sx={{
          py: "1px",
        }}
      >
        <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
          {activeFilter}
        </Typography>
      </Button>
      <Button
        onClick={() => handleChange(null)}
        size="small"
        variant="outlined"
        sx={{
          py: "1px",
        }}
      >
        <CloseRounded />
      </Button>
    </ButtonGroup>
  );

  return (
    <>
      {activeFilter ? activeButton : inactiveButton}
      <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
        <MenuItem onClick={() => handleChange("image")}>
          <ListItemIcon>
            <ImageRounded fontSize="small" />
          </ListItemIcon>
          <Typography variant="body1">Images</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("video")}>
          <ListItemIcon>
            <MovieCreationRounded fontSize="small" />
          </ListItemIcon>
          <Typography variant="body1">Videos</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("audio")}>
          <ListItemIcon>
            <AudiotrackRounded fontSize="small" />
          </ListItemIcon>
          <Typography variant="body1">Audio</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("pdf")}>
          <ListItemIcon>
            <PicutreasPdfRounded fontSize="small" />
          </ListItemIcon>
          <Typography variant="body1">PDFs</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("document")}>
          <ListItemIcon>
            <DescriptionRounded fontSize="small" />
          </ListItemIcon>
          <Typography variant="body1">Documents</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("presentation")}>
          <ListItemIcon>
            <SlideshowRounded fontSize="small" />
          </ListItemIcon>
          <Typography variant="body1">Presentations</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("spreadsheet")}>
          <ListItemIcon>
            <BorderAllRounded fontSize="small" />
          </ListItemIcon>
          <Typography variant="body1">Spreadsheets</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("code")}>
          <ListItemIcon>
            <CodeRounded fontSize="small" />
          </ListItemIcon>
          <Typography variant="body1">Code</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("font")}>
          <ListItemIcon>
            <FontDownloadRounded fontSize="small" />
          </ListItemIcon>
          <Typography variant="body1">Fonts</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleChange("archive")}>
          <ListItemIcon>
            <FolderZipRounded fontSize="small" />
          </ListItemIcon>
          <Typography variant="body1">Archives (zip)</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};
