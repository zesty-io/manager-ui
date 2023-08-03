import { Typography, Button } from "@mui/material";
import { useHistory } from "react-router-dom";
import FolderIcon from "@mui/icons-material/Folder";
import { alpha } from "@mui/material/styles";
import { useParams } from "../../../../../../shell/hooks/useParams";

interface FolderProps {
  name: string;
  id: string;
}

export const Folder: React.FC<FolderProps> = ({ name, id }) => {
  const history = useHistory();
  const [params, setParams] = useParams();

  return (
    <Button
      fullWidth
      startIcon={<FolderIcon sx={{ color: "action.active" }} />}
      variant="outlined"
      color="inherit"
      autoFocus={id === params.get("newFolderId")}
      onBlur={() => setParams(null, "newFolderId")}
      disableFocusRipple
      sx={{
        height: "100%",
        justifyContent: "flex-start",
        color: "grey.500",
        borderColor: "grey.100",
        textTransform: "none",
        "&:focus": {
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
        },
      }}
      onClick={() => {
        history.push("/media/folder/" + id);
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
