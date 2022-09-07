import FolderIcon from "./FolderIcon";
import { Typography, Button } from "@mui/material";
import { useHistory } from "react-router-dom";

interface FolderProps {
  name: string;
  path: string;
}

export const Folder: React.FC<FolderProps> = ({ name, path }) => {
  let history = useHistory();

  return (
    <Button
      sx={{
        color: "text.primary",
        height: "100%",
        display: "flex",
        cursor: "pointer",
        py: 2,
        px: 2,
        mr: 2,
        mb: 2,
        border: "1px solid #F2F4F7",
        maxWidth: "225px",
        width: "225px",
      }}
      onClick={() => {
        history.push(path);
      }}
    >
      <FolderIcon />
      <Typography
        variant="caption"
        sx={{
          paddingLeft: "0.5rem",
          fontSize: "1rem",
          marginTop: "-0.1rem",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {name}
      </Typography>
    </Button>
  );
};
