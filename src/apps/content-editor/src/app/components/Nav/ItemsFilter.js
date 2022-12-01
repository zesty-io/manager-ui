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
      value={props.searchTerm}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
      }}
      onChange={(evt) => {
        const term = evt.target.value.toLowerCase();

        props.setSearchTerm(term);
        if (term) {
          const trimmedTerm = term.trim();

          props.setFilteredItems(
            props.nav.raw.filter((f) => {
              return (
                f.label.toLowerCase().includes(trimmedTerm) ||
                f.path.toLowerCase().includes(trimmedTerm) ||
                f.contentModelZUID === trimmedTerm ||
                f.ZUID === trimmedTerm
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
