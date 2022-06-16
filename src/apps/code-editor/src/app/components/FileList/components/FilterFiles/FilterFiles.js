import TextField from "@mui/material/TextField";

export function FilterFiles(props) {
  return (
    <TextField
      id="filled-search"
      label="Filter file list by name, zuid or code"
      type="search"
      variant="outlined"
      fullWidth
      onChange={(evt) => {
        let term = evt.target.value.trim().toLowerCase();

        if (term === null) return;
        if (term) {
          props.setShownFiles(
            props.nav.raw.filter((f) => {
              return (
                f.fileName.toLowerCase().includes(term) ||
                f.contentModelZUID === term ||
                f.contentModelType === term ||
                f.version === term ||
                f.ZUID === term
              );
            })
          );
        } else {
          props.setShownFiles(props.nav.tree);
        }
      }}
      sx={{ mt: 1 }}
    />
  );
}
