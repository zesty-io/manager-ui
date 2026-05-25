import { RefObject } from "react";
import { Box, Typography, Autocomplete, Paper, TextField } from "@mui/material";

import { COLOR_MAP } from "../constants";
import { getKeyValue } from "../utils";
import { IntegrationTypes } from "../../../services/types";
import { validateUrl } from "../utils";

const KeyPathSelector = ({
  value,
  onChange,
  options,
  placeholder = "",
  optionsDescription = "",
  data,
  inputRef,
  restrictedTypes = [],
  name,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  optionsDescription?: string;
  data?: any;
  inputRef?: RefObject<HTMLInputElement>;
  type?: IntegrationTypes;
  restrictedTypes?: string[];
  name?: string;
}) => {
  const filteredOptions = restrictedTypes.length
    ? options.filter((option) => {
        const optionValue = getKeyValue(data, option);
        const valueType = typeof optionValue;
        return !restrictedTypes.includes(valueType);
      })
    : options;

  const getValueType = (value: any): string => {
    if (Array.isArray(value)) return "array";
    if (value === null) return "null";
    return typeof value;
  };

  return (
    <Autocomplete
      data-cy={`integrationKeyPathSelector-${name}`}
      fullWidth
      options={filteredOptions}
      value={value}
      size="small"
      disableClearable
      autoHighlight
      onChange={(_, value) => onChange(value || "")}
      slots={{
        paper: (props) => (
          <Paper {...props} sx={{ px: 0, py: 1, position: "relative" }}>
            {optionsDescription && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ px: 2, pt: 1, pb: 0.5, fontStyle: "italic" }}
              >
                {optionsDescription}
              </Typography>
            )}
            <Box sx={{ width: "100%" }}>{props?.children}</Box>
          </Paper>
        ),
      }}
      renderInput={(params) => (
        <TextField {...params} placeholder={placeholder} inputRef={inputRef} />
      )}
      renderOption={(props, option) => {
        const optionValue = data ? getKeyValue(data, option) : null;
        const valueType = getValueType(optionValue);
        const isUrl =
          valueType === "string" && validateUrl(optionValue as string);
        const typeColor =
          COLOR_MAP[valueType as keyof typeof COLOR_MAP] || COLOR_MAP.default;

        const { key, ...otherProps } = props;

        return (
          <li key={key} {...otherProps}>
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              width="100%"
              sx={{
                "& .MuiTypography-root": { fontFamily: "monospace" },
              }}
            >
              <Typography noWrap flex={1} variant="body2">
                {`${option}: `}
                <Typography
                  component="span"
                  variant="body2"
                  color={`${isUrl ? COLOR_MAP.url : typeColor}.600`}
                >
                  {valueType === "string"
                    ? `"${optionValue}"`
                    : JSON.stringify(optionValue, null, 3)}
                </Typography>
              </Typography>

              <Typography
                component="span"
                variant="caption"
                sx={{
                  flexShrink: 0,
                  borderRadius: 1,
                  bgcolor: `${typeColor}.50`,
                  color: `${typeColor}.600`,
                  py: 0,
                  px: 1,
                }}
              >
                {valueType}
              </Typography>
            </Box>
          </li>
        );
      }}
    />
  );
};

export default KeyPathSelector;
