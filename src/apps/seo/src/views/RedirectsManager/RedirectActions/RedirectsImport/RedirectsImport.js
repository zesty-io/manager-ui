import Button from "@mui/material/Button";
import UploadIcon from "@mui/icons-material/Upload";

import styles from "./RedirectsImport.less";
export default function RedirectsImport(props) {
  let fileInput = null;
  return (
    <div className={styles.RedirectsImport}>
      <input
        type="file"
        className={styles.hidden}
        ref={(input) => (fileInput = input)}
        onChange={props.onChange}
      />
      <Button
        variant="contained"
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
