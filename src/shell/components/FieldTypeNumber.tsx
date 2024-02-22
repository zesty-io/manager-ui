import { useEffect, useRef } from "react";
import { IconButton, Stack, TextField } from "@mui/material";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { Error } from "../../apps/content-editor/src/app/components/Editor/Field/FieldShell";
import { NumberFormatInput } from "./NumberFormatInput";

type FieldTypeNumberProps = {
  required: boolean;
  name: string;
  value: number;
  onChange: (value: number, name: string) => void;
  hasError: boolean;
};
export const FieldTypeNumber = ({
  required,
  value,
  onChange,
  name,
  hasError,
}: FieldTypeNumberProps) => {
  const numberInputRef = useRef(null);

  useEffect(() => {
    if (value === 0) {
      numberInputRef.current?.setSelectionRange(1, 1);
    }
  }, [value]);

  const modifyNumberValue = (action: "increment" | "decrement") => {
    switch (action) {
      case "increment":
        onChange(+(+value + 1).toFixed(10), name);
        break;

      case "decrement":
        onChange(+(+value - 1).toFixed(10), name);
        break;

      default:
        break;
    }
  };

  return (
    <TextField
      inputRef={numberInputRef}
      variant="outlined"
      fullWidth
      value={value?.toString() || "0"}
      name={name}
      required={required}
      onChange={(evt) => {
        onChange(isNaN(+evt.target.value) ? 0 : +evt.target.value, name);
      }}
      onKeyDown={(evt) => {
        if ((evt.key === "Backspace" || evt.key === "Delete") && value === 0) {
          evt.preventDefault();
        }
      }}
      error={hasError}
      InputProps={{
        endAdornment: (
          <Stack direction="row" gap={1}>
            <IconButton
              size="small"
              onClick={() => modifyNumberValue("decrement")}
            >
              <RemoveRoundedIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => modifyNumberValue("increment")}
            >
              <AddRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        ),
        inputComponent: NumberFormatInput as any,
        inputProps: {
          thousandSeparator: true,
          valueIsNumericString: true,
        },
      }}
    />
  );
};
