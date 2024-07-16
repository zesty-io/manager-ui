import { useMemo } from "react";
import { TextField, Typography, Box, Stack } from "@mui/material";

import { currencies } from "./currenciesV2";
import { NumberFormatInput } from "../NumberFormatInput";
import getFlagEmoji from "../../../utility/getFlagEmoji";

type FieldTypeCurrencyV2Props = {
  name: string;
  value: string;
  currency: string;
  error: boolean;
  onChange: (value: string, name: string) => void;
};
export const FieldTypeCurrencyV2 = ({
  name,
  currency,
  value,
  error,
  onChange,
}: FieldTypeCurrencyV2Props) => {
  const selectedCurrency = useMemo(() => {
    return currencies.find((_currency) => _currency.value === currency);
  }, [currency]);

  return (
    <TextField
      fullWidth
      value={value}
      placeholder="0.00"
      InputProps={{
        inputComponent: NumberFormatInput as any,
        inputProps: {
          thousandSeparator: true,
        },
        startAdornment: (
          <Typography variant="body2" color="text.disabled" pr={0.5}>
            {selectedCurrency?.symbol_native}
          </Typography>
        ),
        endAdornment: (
          <Stack pl={0.5} direction="row" alignItems="center">
            <Box pr={0.5}>{getFlagEmoji(selectedCurrency.countryCode)}</Box>
            <Typography variant="body2" color="text.disabled">
              {selectedCurrency.value}
            </Typography>
          </Stack>
        ),
      }}
    />
  );
};
