import Button from "@mui/material/Button";
import UploadIcon from "@mui/icons-material/Upload";

import Box from "@mui/material/Box";
export default function RedirectsImport(props) {
  let fileInput = null;
  return (
    <Box>
      <input
        type="file"
        hidden
        ref={(input) => (fileInput = input)}
        onChange={props.onChange}
      />
      <Button
        variant="outlined"
        color="inherit"
        size="small"
        onClick={() => {
          fileInput.click();
        }}
        startIcon={<UploadIcon />}
      >
        Import CSV/XML
      </Button>
    </Box>
  );
}
