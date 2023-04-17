import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

const ItemsFilter = (props) => {
  return (
    <TextField
      name="itemsFilter"
      placeholder="Search by Name, ZUID or Path"
      type="search"
      variant="outlined"
      fullWidth
      size="small"
      value={props.searchTerm}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon
              fontSize="small"
              sx={{
                color: "#10182866",
              }}
            />
          </InputAdornment>
        ),
      }}
      onChange={(evt) => {
        const term = evt.target.value;

        props.setSearchTerm(term);
        if (term) {
          const filterTerm = term.trim().toLowerCase();

          props.setFilteredItems(
            props.nav.raw.filter((f) => {
              return (
                f.label.toLowerCase().includes(filterTerm) ||
                f.path.toLowerCase().includes(filterTerm) ||
                f.contentModelZUID === filterTerm ||
                f.ZUID === filterTerm
              );
            })
          );
        } else {
          props.setFilteredItems(props.nav.nav);
        }
      }}
      sx={{
        boxSizing: "border-box",
        p: 1,
        color: "#1018288F",
      }}
    />
  );
};

export default ItemsFilter;
