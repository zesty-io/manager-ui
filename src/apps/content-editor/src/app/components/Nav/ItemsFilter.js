import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

const ItemsFilter = (props) => {
  return (
    <TextField
      name="itemsFilter"
      placeholder="Filter items by name, zuid or path"
      type="search"
      variant="outlined"
      fullWidth
      size="small"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
      }}
      onChange={(evt) => {
        let term = evt.target.value.trim().toLowerCase();

        if (term === null) return;
        if (term) {
          props.setSearchTerm(term);
          props.setFilteredItems(
            props.nav.raw.filter((f) => {
              return (
                f.label.toLowerCase().includes(term) ||
                f.path.toLowerCase().includes(term) ||
                f.contentModelZUID === term ||
                f.ZUID === term
              );
            })
          );
        } else {
          props.setFilteredItems(props.nav.nav);
        }
      }}
      sx={{ boxSizing: "border-box", p: 1 }}
    />
  );
};

export default ItemsFilter;
