import { Button } from "@mui/material";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";

// TODO: Add functionality
export const LastUpdated = () => {
  return (
    <Button
      variant="outlined"
      size="small"
      color="inherit"
      endIcon={<ArrowDropDownOutlinedIcon />}
    >
      Last Updated
    </Button>
  );
};
