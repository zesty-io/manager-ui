import { FC } from "react";
import { Typography, Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ImageIcon from "@mui/icons-material/Image";

interface Props {
  filename?: string;
}

export const FileModalHeader: FC<Props> = ({ filename }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        pb: 4,
      }}
    >
      <Box sx={{ display: "flex" }}>
        <ImageIcon />
        <Typography noWrap sx={{ width: "200px", pl: 1.5 }}>
          {filename}
        </Typography>
      </Box>
      <Box>
        <EditIcon sx={{ mr: 1, cursor: "pointer" }} />
        <DeleteIcon sx={{ mr: 1, cursor: "pointer" }} />
        <MoreVertIcon sx={{ cursor: "pointer" }} />
      </Box>
    </Box>
  );
};
