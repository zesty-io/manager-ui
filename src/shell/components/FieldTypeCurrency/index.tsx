import { useMemo } from "react";
import { TextField, Typography, Box, Stack } from "@mui/material";

import { currencies } from "./currencies";
import { NumberFormatInput } from "../NumberFormatInput";
import getFlagEmoji from "../../../utility/getFlagEmoji";

type FieldTypeCurrencyProps = {
  name: string;
  value: string;
  currency: string;
  error: boolean;
  onChange: (value: string, name: string) => void;
};
export const FieldTypeCurrency = ({
  name,
  currency,
  value,
  error,
  onChange,
  ...otherProps
}: FieldTypeCurrencyProps) => {
  const selectedCurrency = useMemo(() => {
    return currencies.find((_currency) => _currency.value === currency);
  }, [currency]);

  return (
    <TextField
      {...otherProps}
      name={name}
      fullWidth
      value={value}
      placeholder="0.00"
      error={error}
      onChange={(evt: any) => onChange(evt?.target?.value?.value, name)}
      InputProps={{
        inputComponent: NumberFormatInput as any,
        inputProps: {
          thousandSeparator: true,
          valueIsNumericString: true,
        },
        startAdornment: (
          <Typography variant="body2" color="text.disabled" pr={0.5}>
            {selectedCurrency?.symbol_native}
          </Typography>
        ),
        endAdornment: (
          <Stack pl={0.5} direction="row" alignItems="center">
            <Box
              component="img"
              pr={0.5}
              height={14}
              src={`/images/flags/${selectedCurrency.countryCode?.toLowerCase()}.svg`}
              loading="lazy"
              alt={`${selectedCurrency.countryCode} flag`}
            />
            <Typography variant="body2" color="text.disabled">
              {selectedCurrency.value}
            </Typography>
          </Stack>
        ),
      }}
    />
  );
};
