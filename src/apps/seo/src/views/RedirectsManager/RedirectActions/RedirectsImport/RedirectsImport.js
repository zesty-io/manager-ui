import Button from "@mui/material/Button";
import UploadIcon from "@mui/icons-material/Upload";

// import styles from "./RedirectsImport.less";
export default function RedirectsImport(props) {
  let fileInput = null;
  return (
    <div>
      <input
        type="file"
        hidden
        ref={(input) => (fileInput = input)}
        onChange={props.onChange}
      />
      <Button
        variant="outlined"
        color="inherit"
        onClick={() => {
          fileInput.click();
        }}
        startIcon={<UploadIcon />}
      >
        Import CSV/XML
      </Button>
    </div>
  );
}
