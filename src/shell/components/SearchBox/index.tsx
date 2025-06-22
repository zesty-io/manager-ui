import Autocomplete from "@mui/material/Autocomplete";
import { TextField, TextFieldProps } from "@mui/material";

const SearchBox = (props: TextFieldProps) => {
  const { value = "", onChange, size, fullWidth, ...otherProps } = props;

  return (
    <Autocomplete
      freeSolo
      options={[]}
      inputValue={(value || "") as string}
      fullWidth={!!fullWidth}
      onInputChange={(event, val, reason) => {
        if (reason === "clear") {
          onChange?.({
            target: { value: "" },
          } as React.ChangeEvent<HTMLInputElement>);
        } else {
          onChange?.(event as React.ChangeEvent<HTMLInputElement>);
        }
      }}
      size={size || "medium"}
      renderInput={(params) => (
        <TextField
          {...params}
          {...otherProps}
          InputProps={{
            ...params?.InputProps,
            ...props?.InputProps,
          }}
        />
      )}
      sx={{
        ...otherProps?.sx,
        boxSizing: "border-box",
        px: 0,
        "& .MuiAutocomplete-inputRoot": {
          boxSizing: "border-box",
        },
        "& .MuiAutocomplete-inputRoot.MuiInputBase-sizeSmall": {
          py: 0,
          "& .MuiAutocomplete-input": {
            py: 1,
            px: 0,
          },
        },
      }}
    />
  );
};
export default SearchBox;
