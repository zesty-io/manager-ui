import { Button } from "@mui/material";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";

// TODO: Add functionality
export const People = () => {
  return (
    <Button
      variant="outlined"
      size="small"
      color="inherit"
      endIcon={<ArrowDropDownOutlinedIcon />}
    >
      People
    </Button>
  );
};
