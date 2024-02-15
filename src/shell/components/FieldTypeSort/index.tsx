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
  return (
    <MuiTextField
      variant="outlined"
      value={value}
      onChange={onChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                // References input via click event in order to obtain its value
                const input = e.currentTarget?.parentElement?.parentElement
                  ?.childNodes?.[1] as HTMLInputElement;
                const newValue = String(+input.value - 1);
                // Updates internal input value in case component is not controlled
                input.value = newValue;
                // Mocks an event change
                const event = { target: { value: newValue } };
                onChange &&
                  onChange(
                    event as ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
                  );
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
                // References input via click event in order to obtain its value
                const input = e.currentTarget?.parentElement?.parentElement
                  ?.childNodes?.[1] as HTMLInputElement;
                const newValue = String(+input.value + 1);
                // Updates internal input value in case component is not controlled
                input.value = newValue;
                // Mocks an event change
                const event = { target: { value: newValue } };
                onChange &&
                  onChange(
                    event as ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
                  );
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
      // Spread props at the end to allow prop overrides
      {...props}
    />
  );
};
