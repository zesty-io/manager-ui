import { Typography, Button } from "@mui/material";
import { useHistory } from "react-router-dom";
import FolderIcon from "@mui/icons-material/Folder";

interface FolderProps {
  name: string;
  path: string;
}

export const Folder: React.FC<FolderProps> = ({ name, path }) => {
  const history = useHistory();

  return (
    <Button
      startIcon={<FolderIcon />}
      variant="outlined"
      sx={{
        py: 2,
        px: 2,
        color: "grey.500",
        borderColor: "grey.100",
      }}
      onClick={() => {
        history.push(path);
      }}
    >
      <Typography
        variant="caption"
        sx={{
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
