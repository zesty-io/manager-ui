import { useEffect, useRef } from "react";
import { IconButton, Stack, TextField } from "@mui/material";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { NumberFormatInput } from "./NumberFormatInput";

type FieldTypeNumberProps = {
  required: boolean;
  name: string;
  value: number;
  onChange: (value: number, name: string) => void;
  hasError: boolean;
  allowNegative?: boolean;
  limit?: number;
};
export const FieldTypeNumber = ({
  required,
  value,
  onChange,
  name,
  hasError,
  allowNegative = true,
  limit,
  ...props
}: FieldTypeNumberProps) => {
  const numberInputRef = useRef(null);

  useEffect(() => {
    if (value === 0) {
      numberInputRef.current?.setSelectionRange(1, 1);
    }
  }, [value]);

  const modifyNumberValue = (action: "increment" | "decrement") => {
    if (value.toString().includes("e")) return;

    const integerFractionalSplit = value.toString().split(".");

    switch (action) {
      case "increment":
        integerFractionalSplit[0] = (+integerFractionalSplit[0] + 1).toString();
        break;

      case "decrement":
        integerFractionalSplit[0] = (+integerFractionalSplit[0] - 1).toString();
        break;

      default:
        break;
    }

    const newValue = +integerFractionalSplit.join(".");

    if (!limit || (limit && newValue <= limit)) {
      onChange(newValue, name);
    }
  };

  return (
    <TextField
      {...props}
      inputRef={numberInputRef}
      variant="outlined"
      fullWidth
      value={value || 0}
      name={name}
      required={required}
      onChange={(evt) => {
        onChange(+evt.target.value?.toString()?.replace(/^0+/, "") ?? 0, name);
      }}
      onKeyDown={(evt) => {
        if ((evt.key === "Backspace" || evt.key === "Delete") && value === 0) {
          evt.preventDefault();
        }

        if (
          limit &&
          ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(
            evt.key
          ) &&
          +(value + evt.key) > limit
        ) {
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
          allowNegative,
        },
      }}
    />
  );
};
