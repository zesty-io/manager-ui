import { Button } from "@mui/material";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";

export const ModelType = () => {
  return (
    <Button
      variant="outlined"
      size="small"
      color="inherit"
      endIcon={<ArrowDropDownOutlinedIcon />}
    >
      Model Type
    </Button>
  );
};
