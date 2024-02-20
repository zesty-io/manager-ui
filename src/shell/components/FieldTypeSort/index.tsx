import { ChangeEvent } from "react";
import MuiTextField, { OutlinedTextFieldProps } from "@mui/material/TextField";
import { InputAdornment, IconButton } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";

export interface FieldTypeSortProps
  extends Omit<OutlinedTextFieldProps, "variant"> {
  value: string;
}

export const FieldTypeSort = ({
  value,
  InputProps,
  onChange,
  ...props
}: FieldTypeSortProps) => {
  const modifyValue = (action: "increment" | "decrement") => {
    let newValue = +value;

    switch (action) {
      case "increment":
        newValue++;
        break;

      case "decrement":
        newValue--;
        break;

      default:
        break;
    }

    // Mocks an event change
    const event = { target: { value: newValue.toString() } };

    onChange &&
      onChange(event as ChangeEvent<HTMLTextAreaElement | HTMLInputElement>);
  };

  return (
    <MuiTextField
      variant="outlined"
      // Only changes how the minus sign is rendered on the input field, doesn't affect the value at all
      value={value.replace("-", "−")}
      onChange={onChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                modifyValue("decrement");
              }}
            >
              <RemoveRoundedIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                modifyValue("increment");
              }}
            >
              <AddRoundedIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
        // Spread props at the end to allow Input prop overrides
        ...InputProps,
      }}
      inputProps={{
        pattern: "[0-9]-",
      }}
      sx={{
        maxWidth: "100%",
        width: "fit-content",

        "& .MuiInputBase-input.MuiOutlinedInput-input": {
          width: value?.length + "ch",
        },
      }}
      onKeyDown={(evt) => {
        switch (evt.code) {
          case "ArrowUp":
            evt.preventDefault();
            modifyValue("increment");
            break;

          case "ArrowDown":
            evt.preventDefault();
            modifyValue("decrement");
            break;

          default:
            break;
        }
      }}
      // Spread props at the end to allow prop overrides
      {...props}
    />
  );
};
